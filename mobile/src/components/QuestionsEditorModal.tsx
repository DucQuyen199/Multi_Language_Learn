import { useEffect, useState } from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AuthorQuestion, type QuestionInput } from "@/lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { cn } from "./ui/cn";

type Props = {
  visible: boolean;
  onClose: () => void;
  mode: "lesson" | "exam";
  ownerId: string;
  title: string;
};

/**
 * Shared MCQ question editor — works for both lesson quizzes and exam questions.
 */
export function QuestionsEditorModal({ visible, onClose, mode, ownerId, title }: Props) {
  const queryClient = useQueryClient();

  const { data: questions } = useQuery({
    queryKey: ["questions", mode, ownerId],
    queryFn: () =>
      mode === "lesson"
        ? api.instructor.lessonQuestions(ownerId)
        : api.instructor.examQuestions(ownerId),
    enabled: visible && !!ownerId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["questions", mode, ownerId] });
    queryClient.invalidateQueries({ queryKey: ["instructorCourse"] });
    queryClient.invalidateQueries({ queryKey: ["instructorLessons"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      mode === "lesson" ? api.instructor.deleteLessonQuestion(id) : api.instructor.deleteExamQuestion(id),
    onSuccess: invalidate,
  });

  // Add-question form state
  const [formOpen, setFormOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) {
      setFormOpen(false);
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
      setExplanation("");
      setError("");
    }
  }, [visible]);

  const addMutation = useMutation({
    mutationFn: (input: QuestionInput) =>
      mode === "lesson"
        ? api.instructor.addLessonQuestion(ownerId, input)
        : api.instructor.addExamQuestion(ownerId, input),
    onSuccess: () => {
      invalidate();
      setFormOpen(false);
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
      setExplanation("");
      setError("");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Thêm câu hỏi thất bại."),
  });

  const submit = () => {
    if (question.trim().length < 5) return setError("Câu hỏi cần ít nhất 5 ký tự.");
    if (options.some((o) => !o.trim())) return setError("Điền đủ tất cả các lựa chọn.");
    addMutation.mutate({
      question: question.trim(),
      options: options.map((o) => o.trim()),
      correct_index: correct,
      explanation: explanation.trim() || undefined,
    });
  };

  const list = questions ?? [];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-canvas">
        <View className="flex-row items-center gap-3 px-4 py-3 bg-paper border-b border-line">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-ink flex-1" numberOfLines={1}>
            {title}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {list.map((q: AuthorQuestion, i: number) => (
            <Card key={q.id} className="gap-2">
              <View className="flex-row items-start gap-2">
                <Text className="text-sm font-bold text-ink flex-1">
                  {i + 1}. {q.question}
                </Text>
                <TouchableOpacity onPress={() => deleteMutation.mutate(q.id)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
              {q.options.map((opt, oi) => (
                <View
                  key={oi}
                  className={cn(
                    "flex-row items-center gap-2 rounded-md px-2.5 py-1.5",
                    oi === q.correct_index ? "bg-success-soft" : "bg-canvas",
                  )}
                >
                  {oi === q.correct_index ? (
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                  ) : (
                    <View className="w-4" />
                  )}
                  <Text className={cn("text-xs flex-1", oi === q.correct_index ? "text-success font-semibold" : "text-muted")}>
                    {opt}
                  </Text>
                </View>
              ))}
              {q.explanation ? <Text className="text-xs text-muted">💡 {q.explanation}</Text> : null}
            </Card>
          ))}

          {formOpen ? (
            <Card className="gap-3 border-primary">
              <Input label="Câu hỏi" value={question} onChangeText={setQuestion} placeholder="Ví dụ: What does 'analyse' mean?" autoCapitalize="sentences" />
              <View className="gap-2">
                <Text className="text-sm font-medium text-ink">Các lựa chọn (chọn đúng 1 đáp án)</Text>
                {options.map((opt, oi) => (
                  <View key={oi} className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={() => setCorrect(oi)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 items-center justify-center",
                        correct === oi ? "border-success bg-success" : "border-line",
                      )}
                    >
                      {correct === oi ? <View className="w-2.5 h-2.5 rounded-full bg-white" /> : null}
                    </TouchableOpacity>
                    <TextInput
                      value={opt}
                      onChangeText={(t) => setOptions((o) => o.map((x, i) => (i === oi ? t : x)))}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + oi)}`}
                      placeholderTextColor="#94a3b8"
                      className="flex-1 bg-canvas border border-line rounded-lg px-3 py-2 text-sm text-ink"
                    />
                  </View>
                ))}
              </View>
              <Input label="Giải thích (tuỳ chọn)" value={explanation} onChangeText={setExplanation} placeholder="Vì sao đáp án này đúng..." autoCapitalize="sentences" />
              {error ? <Text className="text-sm text-danger">{error}</Text> : null}
              <View className="flex-row gap-2">
                <Button label="Huỷ" variant="secondary" onPress={() => setFormOpen(false)} className="flex-1" />
                <Button label="Thêm" onPress={submit} loading={addMutation.isPending} className="flex-1" />
              </View>
            </Card>
          ) : (
            <Button label="+ Thêm câu hỏi" onPress={() => setFormOpen(true)} />
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
