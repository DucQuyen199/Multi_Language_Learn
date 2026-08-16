import { useEffect, useState } from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InstructorLesson } from "@/lib/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card } from "./ui/Card";
import { cn } from "./ui/cn";

const skills = [
  { key: "listening", label: "Nghe" },
  { key: "speaking", label: "Nói" },
  { key: "reading", label: "Đọc" },
  { key: "writing", label: "Viết" },
  { key: "vocabulary", label: "Từ vựng" },
  { key: "grammar", label: "Ngữ pháp" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  lesson: InstructorLesson | null; // null = create
};

export function LessonEditorModal({ visible, onClose, courseId, lesson }: Props) {
  const queryClient = useQueryClient();
  const editing = !!lesson;

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [skill, setSkill] = useState("");
  const [duration, setDuration] = useState("10");
  const [order, setOrder] = useState("1");
  const [error, setError] = useState("");

  useEffect(() => {
    if (visible) {
      setTitle(lesson?.title ?? "");
      setSummary(lesson?.summary ?? "");
      setContent(lesson?.content ?? "");
      setImageUrl(lesson?.image_url ?? "");
      setVideoUrl(lesson?.video_url ?? "");
      setSkill(lesson?.skill ?? "");
      setDuration(String(lesson?.duration_minutes ?? 10));
      setOrder(String(lesson?.lesson_order ?? 1));
      setError("");
    }
  }, [visible, lesson]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const input = {
        title: title.trim(),
        summary: summary.trim() || undefined,
        content: content.trim(),
        image_url: imageUrl.trim() || undefined,
        video_url: videoUrl.trim() || undefined,
        skill: skill || undefined,
        duration_minutes: parseInt(duration, 10) || 10,
        lesson_order: parseInt(order, 10) || 1,
        status: "published" as const,
      };
      return editing ? api.instructor.updateLesson(lesson!.id, input) : api.instructor.createLesson(courseId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorLessons", courseId] });
      onClose();
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Lưu bài giảng thất bại."),
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-canvas">
        <View className="flex-row items-center gap-3 px-4 py-3 bg-paper border-b border-line">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-ink">{editing ? "Sửa bài giảng" : "Bài giảng mới"}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 4 }}>
          <Input label="Tiêu đề *" value={title} onChangeText={setTitle} placeholder="Ví dụ: Present Simple" autoCapitalize="sentences" />
          <Input label="Tóm tắt" value={summary} onChangeText={setSummary} placeholder="Mô tả ngắn về bài học" autoCapitalize="sentences" />

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-ink">Nội dung (hỗ trợ ## tiêu đề, - gạch đầu dòng, **in đậm**)</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder={"## Phần 1\nNội dung bài học...\n- Điểm chính 1\n- Điểm chính 2"}
              placeholderTextColor="#94a3b8"
              multiline
              className="bg-paper border border-line rounded-lg px-3 py-2.5 text-sm text-ink min-h-36 text-top"
            />
          </View>

          <Input label="Ảnh minh hoạ (URL)" value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." />
          <Input label="Video (URL)" value={videoUrl} onChangeText={setVideoUrl} placeholder="https://youtube.com/..." />

          <View className="gap-1.5">
            <Text className="text-sm font-medium text-ink">Kỹ năng</Text>
            <View className="flex-row flex-wrap gap-2">
              {skills.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  onPress={() => setSkill(skill === s.key ? "" : s.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full border",
                    skill === s.key ? "border-primary bg-primary-soft" : "border-line",
                  )}
                >
                  <Text className={cn("text-xs font-medium", skill === s.key ? "text-primary" : "text-muted")}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Thời lượng (phút)" value={duration} onChangeText={setDuration} keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Input label="Thứ tự" value={order} onChangeText={setOrder} keyboardType="numeric" />
            </View>
          </View>

          {error ? <Text className="text-sm text-danger px-1">{error}</Text> : null}

          <View className="flex-row gap-2 pt-2">
            <Button label="Huỷ" variant="secondary" onPress={onClose} className="flex-1" />
            <Button
              label={saveMutation.isPending ? "Đang lưu..." : "Lưu"}
              onPress={() => saveMutation.mutate()}
              disabled={!title.trim() || !content.trim()}
              className="flex-1"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
