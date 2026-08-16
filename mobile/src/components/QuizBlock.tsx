import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { GradedAnswer, LearnerQuestion, QuizResult } from "@/lib/api";
import { Button } from "./ui/Button";
import { cn } from "./ui/cn";

type Props = {
  questions: LearnerQuestion[];
  onSubmit: (answers: { question_id: string; choice: number }[]) => Promise<QuizResult>;
  onCompleted?: () => void;
};

export function QuizBlock({ questions, onSubmit, onCompleted }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const detailMap = new Map<string, GradedAnswer>((result?.details ?? []).map((d) => [d.question_id, d]));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        choice: answers[q.id] ?? -1,
      }));
      const res = await onSubmit(payload);
      setResult(res);
      if (res.lesson_done) onCompleted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nộp bài thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
    setError("");
  };

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <View className="gap-4">
      {questions.map((q, qi) => {
        const detail = result ? detailMap.get(q.id) : undefined;
        return (
          <View key={q.id} className="bg-paper rounded-lg border border-line p-4 gap-3">
            <Text className="text-sm font-bold text-ink">
              {qi + 1}. {q.question}
            </Text>
            {q.options.map((opt, oi) => {
              const selected = answers[q.id] === oi;
              const isCorrectOption = detail && detail.correct_index === oi;
              const isWrongSelection = detail && selected && !detail.is_correct;
              return (
                <TouchableOpacity
                  key={oi}
                  onPress={() => !result && setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  disabled={!!result}
                  className={cn(
                    "flex-row items-center gap-2 border rounded-lg px-3 py-2.5",
                    !result && selected && "border-primary bg-primary-soft",
                    !result && !selected && "border-line bg-paper",
                    isCorrectOption && "border-success bg-success-soft",
                    isWrongSelection && "border-danger bg-danger-soft",
                  )}
                >
                  <View
                    className={cn(
                      "w-6 h-6 rounded-full border items-center justify-center",
                      selected && !result && "border-primary bg-primary",
                      isCorrectOption && "border-success bg-success",
                      isWrongSelection && "border-danger bg-danger",
                      !selected && !isCorrectOption && !isWrongSelection && "border-line",
                    )}
                  >
                    {selected && !result ? (
                      <View className="w-2.5 h-2.5 rounded-full bg-white" />
                    ) : isCorrectOption ? (
                      <Ionicons name="checkmark" size={14} color="#16a34a" />
                    ) : isWrongSelection ? (
                      <Ionicons name="close" size={14} color="#dc2626" />
                    ) : null}
                  </View>
                  <Text className="flex-1 text-sm text-ink">{opt}</Text>
                </TouchableOpacity>
              );
            })}
            {detail ? (
              <View className="bg-canvas rounded-md p-3 gap-1">
                <Text className={cn("text-xs font-semibold", detail.is_correct ? "text-success" : "text-danger")}>
                  {detail.is_correct ? "Chính xác!" : "Chưa đúng"}
                </Text>
                {detail.explanation ? <Text className="text-xs text-muted">{detail.explanation}</Text> : null}
              </View>
            ) : null}
          </View>
        );
      })}

      {result ? (
        <View
          className={cn(
            "rounded-lg p-4 gap-2",
            result.score >= 60 ? "bg-success-soft border border-success" : "bg-danger-soft border border-danger",
          )}
        >
          <Text className={cn("text-2xl font-bold", result.score >= 60 ? "text-success" : "text-danger")}>
            {result.score}%
          </Text>
          <Text className="text-sm text-muted">
            Đúng {result.correct}/{result.total} câu
            {result.lesson_done ? " · Bài học đã hoàn thành 🎉" : ""}
          </Text>
          <Button label="Làm lại" variant="secondary" size="sm" onPress={retry} className="self-start mt-1" />
        </View>
      ) : (
        <View className="gap-2">
          {error ? <Text className="text-sm text-danger">{error}</Text> : null}
          <Button
            label={allAnswered ? "Nộp bài" : "Trả lời tất cả để nộp"}
            onPress={submit}
            loading={submitting}
            disabled={!allAnswered}
            size="lg"
          />
        </View>
      )}
    </View>
  );
}
