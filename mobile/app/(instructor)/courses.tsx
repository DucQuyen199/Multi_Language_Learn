import { useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api, type InstructorCourse } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const statusBadge: Record<string, { tone: "green" | "orange" | "neutral"; label: string }> = {
  published: { tone: "green", label: "Đã xuất bản" },
  pending: { tone: "orange", label: "Chờ duyệt" },
  draft: { tone: "neutral", label: "Nháp" },
  archived: { tone: "neutral", label: "Lưu trữ" },
};

function CourseRow({ course }: { course: InstructorCourse }) {
  const badge = statusBadge[course.status] ?? statusBadge.draft;
  return (
    <TouchableOpacity onPress={() => router.push(`/(instructor)/studio-${course.id}` as never)}>
      <Card className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text className="text-sm font-bold text-ink flex-1" numberOfLines={2}>
            {course.flag_emoji} {course.title}
          </Text>
          <Badge tone={badge.tone} label={badge.label} />
        </View>
        <View className="flex-row gap-3">
          <Text className="text-xs text-muted">{course.lesson_count} bài</Text>
          <Text className="text-xs text-muted">{course.enrollment_count} học viên</Text>
          <Text className="text-xs text-muted">{course.exam_count} đề thi</Text>
        </View>
        {course.review_note ? (
          <View className="bg-warning-soft rounded-md px-3 py-2 flex-row items-start gap-2">
            <Ionicons name="alert-circle" size={14} color="#b45309" />
            <Text className="text-xs text-warning flex-1" numberOfLines={2}>
              Ghi chú từ admin: {course.review_note}
            </Text>
          </View>
        ) : null}
      </Card>
    </TouchableOpacity>
  );
}

export default function InstructorCoursesScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cefr, setCefr] = useState("A1");
  const [error, setError] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["instructorCourses"],
    queryFn: () => api.instructor.courses(),
  });

  const createMutation = useMutation({
    mutationFn: () => api.instructor.createCourse({ language_code: "en", title: title.trim(), description: description.trim(), cefr }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      setCefr("A1");
      setError("");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Tạo khoá học thất bại."),
  });

  const courses = data ?? [];

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Khoá của tôi</Text>
          <View className="flex-row items-center gap-2">
            <WorkspaceSwitcher current="instructor" />
            <TouchableOpacity onPress={() => setCreateOpen(true)} className="w-9 h-9 rounded-full bg-primary items-center justify-center">
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : courses.length === 0 ? (
          <EmptyState icon="library" message="Bạn chưa có khoá học nào. Tạo khoá đầu tiên của mình!" />
        ) : (
          courses.map((c) => <CourseRow key={c.id} course={c} />)
        )}
      </ScrollView>

      {/* Create course modal */}
      <Modal visible={createOpen} animationType="slide" onRequestClose={() => setCreateOpen(false)}>
        <View className="flex-1 bg-canvas justify-center px-6">
          <Card className="gap-4">
            <Text className="text-lg font-bold text-ink">Tạo khoá học mới</Text>
            <Input label="Tiêu đề" value={title} onChangeText={setTitle} placeholder="Ví dụ: English for Beginners" autoCapitalize="sentences" />
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-ink">Mô tả</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Mô tả ngắn về khoá học..."
                placeholderTextColor="#94a3b8"
                multiline
                className="bg-paper border border-line rounded-lg px-3 py-2.5 text-sm text-ink min-h-20 text-top"
              />
            </View>
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-ink">Trình độ CEFR</Text>
              <View className="flex-row flex-wrap gap-2">
                {cefrLevels.map((l) => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setCefr(l)}
                    className={`px-3 py-1.5 rounded-full border ${cefr === l ? "border-primary bg-primary-soft" : "border-line"}`}
                  >
                    <Text className={`text-xs font-medium ${cefr === l ? "text-primary" : "text-muted"}`}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {error ? <Text className="text-sm text-danger">{error}</Text> : null}
            <View className="flex-row gap-2">
              <Button label="Huỷ" variant="secondary" onPress={() => setCreateOpen(false)} className="flex-1" />
              <Button
                label="Tạo khoá"
                onPress={() => createMutation.mutate()}
                loading={createMutation.isPending}
                disabled={!title.trim()}
                className="flex-1"
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
