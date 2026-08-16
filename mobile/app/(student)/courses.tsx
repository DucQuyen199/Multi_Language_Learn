import { useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api, type CourseCard } from "@/lib/api";
import { useLearningStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";

function CourseCardItem({ course }: { course: CourseCard }) {
  return (
    <TouchableOpacity onPress={() => router.push(`/(student)/course-${course.slug}` as never)}>
      <Card className="gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-1">
            <Text className="text-base font-bold text-ink" numberOfLines={2}>
              {course.title}
            </Text>
            <Text className="text-xs text-muted" numberOfLines={1}>
              {course.instructor_name} · {course.lesson_count} bài · {course.duration_minutes} phút
            </Text>
          </View>
          <Badge tone="blue" label={course.cefr} />
        </View>
        {course.is_enrolled ? (
          <ProgressBar value={course.progress} color="green" label={`${course.completed_lessons}/${course.lesson_count} bài`} />
        ) : (
          <View className="flex-row items-center gap-1">
            <Ionicons name="people" size={12} color="#64748b" />
            <Text className="text-xs text-muted">{course.enrollment_count} học viên</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const targetLanguage = useLearningStore((s) => s.targetLanguage);
  const [tab, setTab] = useState<"enrolled" | "catalog">("enrolled");

  const enrolledQuery = useQuery({ queryKey: ["myCourses"], queryFn: () => api.myCourses() });
  const catalogQuery = useQuery({
    queryKey: ["courses", targetLanguage],
    queryFn: () => api.courses(targetLanguage),
  });

  const isLoading = tab === "enrolled" ? enrolledQuery.isLoading : catalogQuery.isLoading;
  const isRefetching = tab === "enrolled" ? enrolledQuery.isRefetching : catalogQuery.isRefetching;
  const refetch = tab === "enrolled" ? enrolledQuery.refetch : catalogQuery.refetch;

  const enrolled = enrolledQuery.data ?? [];
  const catalog = (catalogQuery.data ?? []).filter((c) => !c.is_enrolled);

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 gap-3">
        <Text className="text-2xl font-bold text-ink">Khoá học</Text>
        <View className="flex-row bg-line rounded-lg p-1">
          {(
            [
              { key: "enrolled", label: `Của tôi (${enrolled.length})` },
              { key: "catalog", label: "Khám phá" },
            ] as const
          ).map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              className={cn("flex-1 py-2 rounded-md items-center", tab === t.key && "bg-paper")}
            >
              <Text className={cn("text-sm font-medium", tab === t.key ? "text-primary" : "text-muted")}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : tab === "enrolled" ? (
          enrolled.length === 0 ? (
            <EmptyState
              icon="library"
              message="Bạn chưa đăng ký khoá học nào. Khám phá danh mục để bắt đầu!"
              action={{ label: "Khám phá khoá học", onPress: () => setTab("catalog") }}
            />
          ) : (
            enrolled.map((c) => <CourseCardItem key={c.id} course={c} />)
          )
        ) : catalog.length === 0 ? (
          <EmptyState icon="telescope" message="Không có khoá học mới nào." />
        ) : (
          catalog.map((c) => <CourseCardItem key={c.id} course={c} />)
        )}
      </ScrollView>
    </View>
  );
}
