import { useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api, type InstructorCourse, type InstructorLesson } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { QuestionsEditorModal } from "@/components/QuestionsEditorModal";
import { LessonEditorModal } from "@/components/LessonEditorModal";
import { cn } from "@/components/ui/cn";

const allSkills = [
  { key: "listening", label: "Nghe" },
  { key: "speaking", label: "Nói" },
  { key: "reading", label: "Đọc" },
  { key: "writing", label: "Viết" },
  { key: "vocabulary", label: "Từ vựng" },
  { key: "grammar", label: "Ngữ pháp" },
];

export default function CourseStudioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";

  const courseQuery = useQuery({
    queryKey: ["instructorCourse", id],
    queryFn: () => api.instructor.courses(),
    select: (courses: InstructorCourse[]) => courses.find((c) => c.id === id),
  });

  const lessonsQuery = useQuery({
    queryKey: ["instructorLessons", id],
    queryFn: () => api.instructor.lessons(id as string),
    enabled: !!id,
  });

  const examsQuery = useQuery({
    queryKey: ["instructorExams", id],
    queryFn: () => api.instructor.exams(id as string),
    enabled: !!id,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["instructorCourse", id] });
    queryClient.invalidateQueries({ queryKey: ["instructorLessons", id] });
    queryClient.invalidateQueries({ queryKey: ["instructorExams", id] });
    queryClient.invalidateQueries({ queryKey: ["instructorCourses"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.instructor.updateCourse(id as string, { status }),
    onSuccess: invalidateAll,
    onError: (e) => Alert.alert("Lỗi", e instanceof Error ? e.message : "Đổi trạng thái thất bại."),
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => api.instructor.deleteLesson(lessonId),
    onSuccess: invalidateAll,
  });

  const [selectedSkills, setSelectedSkills] = useState<string[] | null>(null);
  const [lessonModal, setLessonModal] = useState<{ open: boolean; lesson: InstructorLesson | null }>({ open: false, lesson: null });
  const [questionsModal, setQuestionsModal] = useState<{ open: boolean; mode: "lesson" | "exam"; ownerId: string; title: string } | null>(null);
  const [examModal, setExamModal] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [examDesc, setExamDesc] = useState("");
  const [examPass, setExamPass] = useState("60");
  const [examDuration, setExamDuration] = useState("20");

  const course = courseQuery.data;
  const skills = selectedSkills ?? course?.skills ?? [];

  const saveSkills = useMutation({
    mutationFn: (list: string[]) => api.instructor.setSkills(id as string, list.map((s) => ({ skill: s, note: "" }))),
    onSuccess: () => {
      invalidateAll();
      setSelectedSkills(null);
    },
  });

  const createExamMutation = useMutation({
    mutationFn: () =>
      api.instructor.createExam(id as string, {
        title: examTitle.trim(),
        description: examDesc.trim() || undefined,
        pass_score: parseInt(examPass, 10) || 60,
        duration_minutes: parseInt(examDuration, 10) || 20,
      }),
    onSuccess: () => {
      invalidateAll();
      setExamModal(false);
      setExamTitle("");
      setExamDesc("");
    },
    onError: (e) => Alert.alert("Lỗi", e instanceof Error ? e.message : "Tạo đề thi thất bại."),
  });

  const lessons = lessonsQuery.data ?? [];
  const exams = examsQuery.data ?? [];

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title={course?.title ?? "Soạn thảo khoá học"} subtitle={course ? `${course.cefr} · ${course.lesson_count} bài` : undefined} />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={courseQuery.isRefetching} onRefresh={() => {
          courseQuery.refetch();
          lessonsQuery.refetch();
          examsQuery.refetch();
        }} />}
      >
        {courseQuery.isLoading || !course ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Status card */}
            <Card className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-bold text-ink">Trạng thái</Text>
                <Badge
                  tone={course.status === "published" ? "green" : course.status === "pending" ? "orange" : "neutral"}
                  label={course.status === "published" ? "Đã xuất bản" : course.status === "pending" ? "Chờ duyệt" : course.status === "archived" ? "Lưu trữ" : "Nháp"}
                />
              </View>

              {course.review_note ? (
                <View className="bg-warning-soft border border-warning rounded-md p-3 gap-1">
                  <Text className="text-xs font-bold text-warning">Ghi chú từ quản trị viên</Text>
                  <Text className="text-xs text-warning">{course.review_note}</Text>
                </View>
              ) : null}

              <View className="flex-row gap-2 flex-wrap">
                {course.status === "draft" ? (
                  <Button label="Gửi duyệt" size="sm" onPress={() => statusMutation.mutate("pending")} loading={statusMutation.isPending} />
                ) : null}
                {course.status === "pending" ? (
                  <Button label="Rút về nháp" size="sm" variant="secondary" onPress={() => statusMutation.mutate("draft")} />
                ) : null}
                {isAdmin && course.status === "draft" ? (
                  <Button label="Xuất bản (admin)" size="sm" onPress={() => statusMutation.mutate("published")} />
                ) : null}
                {isAdmin && course.status === "published" ? (
                  <Button label="Lưu trữ" size="sm" variant="danger" onPress={() => statusMutation.mutate("archived")} />
                ) : null}
                {isAdmin && course.status === "archived" ? (
                  <Button label="Mở lại" size="sm" onPress={() => statusMutation.mutate("published")} />
                ) : null}
              </View>

              {course.status === "pending" ? (
                <Text className="text-xs text-muted">Đang chờ quản trị viên xem xét. Học viên chưa thấy khoá học này.</Text>
              ) : null}
            </Card>

            {/* Skills */}
            <Card className="gap-3">
              <Text className="text-sm font-bold text-ink">Kỹ năng đào tạo</Text>
              <View className="flex-row flex-wrap gap-2">
                {allSkills.map((s) => {
                  const active = skills.includes(s.key);
                  return (
                    <TouchableOpacity
                      key={s.key}
                      onPress={() => {
                        const next = active ? skills.filter((x) => x !== s.key) : [...skills, s.key];
                        setSelectedSkills(next);
                        saveSkills.mutate(next);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-full border flex-row items-center gap-1.5",
                        active ? "border-primary bg-primary-soft" : "border-line",
                      )}
                    >
                      {active ? <Ionicons name="checkmark" size={14} color="#2563eb" /> : null}
                      <Text className={cn("text-xs font-medium", active ? "text-primary" : "text-muted")}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {saveSkills.isPending ? <Text className="text-xs text-muted">Đang lưu...</Text> : null}
            </Card>

            {/* Lessons */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-ink">Bài giảng ({lessons.length})</Text>
                <TouchableOpacity onPress={() => setLessonModal({ open: true, lesson: null })}>
                  <Text className="text-sm font-semibold text-primary">+ Thêm bài</Text>
                </TouchableOpacity>
              </View>
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <View className="w-7 h-7 rounded-full bg-primary-soft items-center justify-center">
                      <Text className="text-primary text-xs font-bold">{lesson.lesson_order}</Text>
                    </View>
                    <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
                      {lesson.title}
                    </Text>
                    <TouchableOpacity onPress={() => setLessonModal({ open: true, lesson })} hitSlop={8}>
                      <Ionicons name="create-outline" size={18} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert("Xoá bài giảng?", `"${lesson.title}" sẽ bị xoá vĩnh viễn.`, [
                          { text: "Huỷ", style: "cancel" },
                          { text: "Xoá", style: "destructive", onPress: () => deleteLessonMutation.mutate(lesson.id) },
                        ])
                      }
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-xs text-muted">{lesson.duration_minutes} phút</Text>
                    {lesson.skill ? <Badge tone="purple" label={lesson.skill} /> : null}
                    <TouchableOpacity
                      onPress={() => setQuestionsModal({ open: true, mode: "lesson", ownerId: lesson.id, title: `Quiz: ${lesson.title}` })}
                      className="flex-row items-center gap-1"
                    >
                      <Ionicons name="help-circle" size={14} color="#2563eb" />
                      <Text className="text-xs text-primary font-medium">
                        Quiz ({lesson.question_count})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
              {lessons.length === 0 && !lessonsQuery.isLoading ? (
                <Text className="text-xs text-muted text-center py-4">Chưa có bài giảng nào.</Text>
              ) : null}
            </View>

            {/* Exams */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-ink">Bài kiểm tra ({exams.length})</Text>
                <TouchableOpacity onPress={() => setExamModal(true)}>
                  <Text className="text-sm font-semibold text-primary">+ Thêm đề</Text>
                </TouchableOpacity>
              </View>
              {exams.map((exam) => (
                <Card key={exam.id} className="gap-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="school" size={16} color="#7c3aed" />
                    <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
                      {exam.title}
                    </Text>
                    <Badge tone={exam.status === "published" ? "green" : "neutral"} label={exam.status} />
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-xs text-muted">Đạt {exam.pass_score}%</Text>
                    <Text className="text-xs text-muted">{exam.duration_minutes} phút</Text>
                    <TouchableOpacity
                      onPress={() => setQuestionsModal({ open: true, mode: "exam", ownerId: exam.id, title: `Đề: ${exam.title}` })}
                      className="flex-row items-center gap-1"
                    >
                      <Ionicons name="help-circle" size={14} color="#2563eb" />
                      <Text className="text-xs text-primary font-medium">Câu hỏi ({exam.question_count})</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
              {exams.length === 0 && !examsQuery.isLoading ? (
                <Text className="text-xs text-muted text-center py-4">Chưa có đề thi nào.</Text>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>

      {/* Lesson editor */}
      <LessonEditorModal
        visible={lessonModal.open}
        onClose={() => setLessonModal({ open: false, lesson: null })}
        courseId={id as string}
        lesson={lessonModal.lesson}
      />

      {/* Questions editor */}
      {questionsModal ? (
        <QuestionsEditorModal
          visible={questionsModal.open}
          onClose={() => setQuestionsModal(null)}
          mode={questionsModal.mode}
          ownerId={questionsModal.ownerId}
          title={questionsModal.title}
        />
      ) : null}

      {/* Create exam modal */}
      <Modal visible={examModal} animationType="slide" onRequestClose={() => setExamModal(false)}>
        <View className="flex-1 bg-canvas justify-center px-6">
          <Card className="gap-4">
            <Text className="text-lg font-bold text-ink">Đề kiểm tra cuối khoá</Text>
            <Input label="Tiêu đề *" value={examTitle} onChangeText={setExamTitle} placeholder="Bài kiểm tra cuối khoá" autoCapitalize="sentences" />
            <Input label="Mô tả" value={examDesc} onChangeText={setExamDesc} placeholder="Tổng hợp kiến thức toàn khoá" autoCapitalize="sentences" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input label="Điểm đạt (%)" value={examPass} onChangeText={setExamPass} keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Input label="Thời lượng (phút)" value={examDuration} onChangeText={setExamDuration} keyboardType="numeric" />
              </View>
            </View>
            <View className="flex-row gap-2">
              <Button label="Huỷ" variant="secondary" onPress={() => setExamModal(false)} className="flex-1" />
              <Button
                label="Tạo đề"
                onPress={() => createExamMutation.mutate()}
                loading={createExamMutation.isPending}
                disabled={!examTitle.trim()}
                className="flex-1"
              />
            </View>
          </Card>
        </View>
      </Modal>
    </View>
  );
}
