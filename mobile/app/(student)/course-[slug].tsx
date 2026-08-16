import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { SkillChip } from "@/components/SkillChip";

const skillLabels: Record<string, string> = {
  listening: "Nghe",
  speaking: "Nói",
  reading: "Đọc",
  writing: "Viết",
  vocabulary: "Từ vựng",
  grammar: "Ngữ pháp",
};

export default function CourseDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["courseDetail", slug],
    queryFn: () => api.courseDetail(slug as string),
    enabled: !!slug,
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.enroll(slug as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courseDetail", slug] });
      queryClient.invalidateQueries({ queryKey: ["myCourses"] });
    },
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas">
        <ScreenHeader title="Khoá học" />
        <View className="p-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  const course = data?.course;
  const lessons = data?.lessons ?? [];

  return (
    <View className="flex-1 bg-canvas">
      <ScreenHeader title={course?.title ?? "Khoá học"} subtitle={course?.instructor_name} />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {course ? (
          <>
            <Card className="gap-3">
              <View className="flex-row items-center gap-2">
                <Badge tone="blue" label={course.cefr} />
                <Badge tone="neutral" label={`${course.flag_emoji} ${course.language_name}`} />
              </View>
              <Text className="text-sm text-muted">{course.description}</Text>
              <View className="flex-row gap-4">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="library" size={14} color="#64748b" />
                  <Text className="text-xs text-muted">{course.lesson_count} bài</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="time" size={14} color="#64748b" />
                  <Text className="text-xs text-muted">{course.duration_minutes} phút</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="people" size={14} color="#64748b" />
                  <Text className="text-xs text-muted">{course.enrollment_count}</Text>
                </View>
              </View>
              {course.skills.length > 0 ? (
                <View className="flex-row flex-wrap gap-1.5">
                  {course.skills.map((s) => (
                    <SkillChip key={s} skill={s} label={skillLabels[s] ?? s} />
                  ))}
                </View>
              ) : null}
              {course.is_enrolled ? (
                <ProgressBar value={course.progress} color="green" label={`${course.completed_lessons}/${course.lesson_count} bài hoàn thành`} />
              ) : (
                <Button
                  label={enrollMutation.isPending ? "Đang đăng ký..." : "Đăng ký khoá học"}
                  onPress={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  size="lg"
                />
              )}
            </Card>

            {course.exam_id ? (
              <TouchableOpacity onPress={() => router.push(`/(student)/exam-${course.exam_id}` as never)}>
                <Card className="flex-row items-center gap-3 bg-purple-soft border-purple">
                  <View className="w-10 h-10 rounded-full bg-purple items-center justify-center">
                    <Ionicons name="school" size={20} color="#fff" />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-bold text-ink">{course.exam_title ?? "Bài kiểm tra cuối khóa"}</Text>
                    <Text className="text-xs text-muted">Đạt {course.exam_pass_score}% để vượt qua</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#7c3aed" />
                </Card>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        <View className="gap-2">
          <Text className="text-base font-bold text-ink">Lộ trình bài học</Text>
          {lessons.length === 0 ? (
            <EmptyState icon="library" message="Khoá học chưa có bài học nào." />
          ) : (
            lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                onPress={() => router.push(`/(student)/lesson-${lesson.id}` as never)}
                disabled={!course?.is_enrolled}
              >
                <Card className="flex-row items-center gap-3 opacity-100">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      lesson.completed ? "bg-success" : "bg-primary-soft"
                    }`}
                  >
                    {lesson.completed ? (
                      <Ionicons name="checkmark" size={18} color="#16a34a" />
                    ) : (
                      <Text className="text-primary font-bold text-sm">{lesson.lesson_order}</Text>
                    )}
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                      {lesson.title}
                    </Text>
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {lesson.duration_minutes} phút{lesson.score != null ? ` · ${lesson.score}%` : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
