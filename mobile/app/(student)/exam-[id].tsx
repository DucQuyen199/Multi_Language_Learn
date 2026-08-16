import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api, type ExamResult } from "@/lib/api";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";

export default function ExamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: exam, isLoading } = useQuery({
    queryKey: ["exam", id],
    queryFn: () => api.exam(id as string),
    enabled: !!id,
  });

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const questions = exam?.questions ?? [];
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);
  const detailMap = new Map((result?.details ?? []).map((d) => [d.question_id, d]));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await api.submitExam(id as string, questions.map((q) => ({ question_id: q.id, choice: answers[q.id] ?? -1 })));
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ["exam", id] });
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

  if (isLoading || !exam) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader title="Bài kiểm tra" />
        <View className="p-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title={exam.title} subtitle={exam.course_title} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {result ? (
          <Card className={cn("items-center gap-2 py-6", result.passed ? "bg-success-soft border-success" : "bg-danger-soft border-danger")}>
            <Ionicons name={result.passed ? "trophy" : "close-circle"} size={48} color={result.passed ? "#16a34a" : "#dc2626"} />
            <Text className={cn("text-4xl font-bold", result.passed ? "text-success" : "text-danger")}>{result.score}%</Text>
            <Text className="text-sm text-muted">
              Đúng {result.correct}/{result.total} câu · Yêu cầu {result.pass_score}%
            </Text>
            <Text className={cn("font-semibold", result.passed ? "text-success" : "text-danger")}>
              {result.passed ? "ĐẠT — Bạn đã vượt qua khoá học! 🎉" : "CHƯA ĐẠT — Thử lại nhé!"}
            </Text>
            <Button label="Làm lại" variant="secondary" onPress={retry} className="mt-2" />
          </Card>
        ) : (
          <Card className="gap-1">
            <View className="flex-row items-center gap-2">
              <Badge tone="purple" label={`${exam.question_count} câu`} />
              <Badge tone="neutral" label={`${exam.duration_minutes} phút`} />
              <Badge tone="orange" label={`Đạt ${exam.pass_score}%`} />
            </View>
            {exam.description ? <Text className="text-sm text-muted">{exam.description}</Text> : null}
            {exam.best_score != null ? (
              <Text className="text-xs text-muted">
                Lần tốt nhất: <Text className="font-bold text-primary">{exam.best_score}%</Text>
                {exam.passed ? " · Đã vượt qua" : ""}
              </Text>
            ) : null}
          </Card>
        )}

        {questions.map((q, qi) => {
          const detail = result ? detailMap.get(q.id) : undefined;
          const selected = answers[q.id];
          return (
            <Card key={q.id} className="gap-3">
              <Text className="text-sm font-bold text-ink">
                {qi + 1}. {q.question}
              </Text>
              {q.options.map((opt, oi) => {
                const isSelected = selected === oi;
                const isCorrectOption = detail && detail.correct_index === oi;
                const isWrongSelection = detail && isSelected && !detail.is_correct;
                return (
                  <TouchableOpacity
                    key={oi}
                    onPress={() => !result && setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    disabled={!!result}
                    className={cn(
                      "flex-row items-center gap-2 border rounded-lg px-3 py-2.5",
                      !result && isSelected && "border-primary bg-primary-soft",
                      !result && !isSelected && "border-line",
                      isCorrectOption && "border-success bg-success-soft",
                      isWrongSelection && "border-danger bg-danger-soft",
                    )}
                  >
                    <Text
                      className={cn(
                        "w-6 h-6 rounded-full border text-xs text-center pt-1 font-bold",
                        isSelected && !result && "border-primary bg-primary text-white",
                        !isSelected && "border-line text-muted",
                        isCorrectOption && "border-success bg-success text-white",
                        isWrongSelection && "border-danger bg-danger text-white",
                      )}
                    >
                      {String.fromCharCode(65 + oi)}
                    </Text>
                    <Text className="flex-1 text-sm text-ink">{opt}</Text>
                  </TouchableOpacity>
                );
              })}
              {detail && !detail.is_correct && detail.explanation ? (
                <Text className="text-xs text-muted bg-canvas rounded-md p-2.5">{detail.explanation}</Text>
              ) : null}
            </Card>
          );
        })}

        {!result ? (
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
        ) : null}
      </ScrollView>
    </View>
  );
}
