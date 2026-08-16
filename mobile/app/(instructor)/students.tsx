import { View, Text, FlatList, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

export default function InstructorStudentsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["instructorStudents"],
    queryFn: () => api.instructor.students(),
  });

  const students = data ?? [];

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-ink">Học viên ({students.length})</Text>
        <WorkspaceSwitcher current="instructor" />
      </View>

      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <EmptyState icon="people" message="Chưa có học viên nào đăng ký khoá của bạn." />
          )
        }
        renderItem={({ item }) => (
          <Card className="gap-2">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center">
                <Text className="text-primary font-bold">{item.name.charAt(0)}</Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-bold text-ink" numberOfLines={1}>{item.name}</Text>
                <Text className="text-xs text-muted" numberOfLines={1}>{item.email}</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted flex-1" numberOfLines={1}>
                {item.course_title}
              </Text>
              <Text className="text-xs text-muted">
                {item.lessons_completed}/{item.lessons_total} bài
              </Text>
            </View>
            <ProgressBar value={Math.round(item.progress)} size="sm" color={item.progress >= 70 ? "green" : "blue"} />
            {item.last_activity ? (
              <Text className="text-xs text-muted">
                Hoạt động cuối: {new Date(item.last_activity).toLocaleDateString("vi-VN")}
              </Text>
            ) : null}
          </Card>
        )}
      />
    </View>
  );
}
