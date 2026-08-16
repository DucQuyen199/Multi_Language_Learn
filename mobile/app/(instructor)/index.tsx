import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

export default function InstructorOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["instructorOverview"],
    queryFn: () => api.instructor.overview(),
  });

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-ink">Studio giảng viên</Text>
        <WorkspaceSwitcher current="instructor" />
      </View>

      {isLoading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : data ? (
        <>
          <View className="flex-row gap-3">
            <StatCard icon={<Ionicons name="library" size={20} color="#2563eb" />} value={data.course_count} label="Khoá học" />
            <StatCard icon={<Ionicons name="book" size={20} color="#16a34a" />} value={data.lesson_count} label="Bài giảng" />
            <StatCard icon={<Ionicons name="people" size={20} color="#ea580c" />} value={data.student_count} label="Học viên" />
          </View>

          <Card className="gap-1">
            <Text className="text-sm font-semibold text-ink">Tiến độ hoàn thành trung bình</Text>
            <ProgressBar value={Math.round(data.avg_progress)} color="green" />
            <Text className="text-xs text-muted">Tổng {data.total_completions} lượt hoàn thành bài học</Text>
          </Card>

          {data.top_courses.length > 0 ? (
            <View>
              <SectionHeading title="Khoá học nổi bật" action={{ label: "Tất cả", onPress: () => router.push("/(instructor)/courses") }} />
              {data.top_courses.slice(0, 3).map((c) => (
                <TouchableOpacity key={c.id} onPress={() => router.push(`/(instructor)/studio-${c.id}` as never)}>
                  <Card className="gap-2 mb-2.5">
                    <View className="flex-row items-center justify-between gap-2">
                      <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
                        {c.flag_emoji} {c.title}
                      </Text>
                      <Badge tone={c.status === "published" ? "green" : c.status === "pending" ? "orange" : "neutral"} label={c.status} />
                    </View>
                    <View className="flex-row gap-3">
                      <Text className="text-xs text-muted">{c.enrollment_count} học viên</Text>
                      <Text className="text-xs text-muted">{c.lesson_count} bài</Text>
                      <Text className="text-xs text-muted">TB {Math.round(c.avg_progress)}%</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {data.recent_students.length > 0 ? (
            <View>
              <SectionHeading title="Học viên mới nhất" />
              {data.recent_students.slice(0, 4).map((s) => (
                <Card key={s.id} className="flex-row items-center gap-3 mb-2.5">
                  <View className="w-9 h-9 rounded-full bg-primary-soft items-center justify-center">
                    <Text className="text-primary font-bold text-sm">{s.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-semibold text-ink" numberOfLines={1}>{s.name}</Text>
                    <Text className="text-xs text-muted" numberOfLines={1}>{s.course_title}</Text>
                  </View>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}
