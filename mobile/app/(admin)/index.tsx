import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

export default function AdminOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminOverview"],
    queryFn: () => api.admin.overview(),
  });

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-ink">Quản trị hệ thống</Text>
        <WorkspaceSwitcher current="admin" />
      </View>

      {isLoading || !data ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : (
        <>
          <View className="flex-row gap-3">
            <StatCard icon={<Ionicons name="people" size={20} color="#2563eb" />} value={data.users.total} label="Người dùng" />
            <StatCard icon={<Ionicons name="school" size={20} color="#7c3aed" />} value={data.users.instructors} label="Giảng viên" />
            <StatCard icon={<Ionicons name="flash" size={20} color="#ea580c" />} value={data.active_learners_today} label="Hoạt động hôm nay" />
          </View>

          <View className="flex-row gap-3">
            <StatCard icon={<Ionicons name="library" size={20} color="#16a34a" />} value={data.courses.total} label="Khoá học" />
            <StatCard icon={<Ionicons name="checkmark-done" size={20} color="#16a34a" />} value={data.courses.published} label="Đã xuất bản" />
            <StatCard icon={<Ionicons name="time" size={20} color="#b45309" />} value={data.courses.pending} label="Chờ duyệt" />
          </View>

          <View className="flex-row gap-3">
            <StatCard icon={<Ionicons name="book" size={20} color="#2563eb" />} value={data.lessons} label="Bài giảng" />
            <StatCard icon={<Ionicons name="bookmarks" size={20} color="#7c3aed" />} value={data.dictionary_words} label="Từ điển" />
            <StatCard icon={<Ionicons name="school" size={20} color="#ea580c" />} value={data.enrollments} label="Đăng ký học" />
          </View>

          {data.recent_users.length > 0 ? (
            <View>
              <SectionHeading title="Tài khoản mới nhất" />
              <Card className="gap-2.5">
                {data.recent_users.slice(0, 5).map((u) => (
                  <View key={u.id} className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-full bg-primary-soft items-center justify-center">
                      <Text className="text-primary font-bold text-xs">{u.first_name.charAt(0)}</Text>
                    </View>
                    <View className="flex-1 gap-0">
                      <Text className="text-sm font-semibold text-ink" numberOfLines={1}>{u.first_name}</Text>
                      <Text className="text-xs text-muted" numberOfLines={1}>{u.email}</Text>
                    </View>
                    <Badge
                      tone={u.role === "admin" ? "red" : u.role === "instructor" ? "purple" : "blue"}
                      label={u.role}
                    />
                  </View>
                ))}
              </Card>
            </View>
          ) : null}

          {data.recent_enrollments.length > 0 ? (
            <View>
              <SectionHeading title="Đăng ký gần đây" />
              <Card className="gap-2.5">
                {data.recent_enrollments.slice(0, 5).map((e) => (
                  <View key={e.id} className="gap-0.5">
                    <Text className="text-sm font-semibold text-ink" numberOfLines={1}>
                      {e.student_name} → {e.course_title}
                    </Text>
                    <Text className="text-xs text-muted">
                      Giảng viên: {e.instructor_name} · {new Date(e.enrolled_at).toLocaleDateString("vi-VN")}
                    </Text>
                  </View>
                ))}
              </Card>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
