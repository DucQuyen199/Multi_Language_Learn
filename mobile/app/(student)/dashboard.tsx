import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLearningStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SkeletonCard } from "@/components/ui/Skeleton";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const targetLanguage = useLearningStore((s) => s.targetLanguage);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["dashboard", targetLanguage],
    queryFn: () => api.dashboard(targetLanguage),
  });

  const xpPercent = data ? Math.min(100, Math.round((data.daily_xp / Math.max(1, data.daily_goal)) * 100)) : 0;

  const skills = data
    ? [
        { key: "listening", label: "Nghe", value: data.skills.listening, icon: "headset" as const },
        { key: "speaking", label: "Nói", value: data.skills.speaking, icon: "mic" as const },
        { key: "reading", label: "Đọc", value: data.skills.reading, icon: "book" as const },
        { key: "writing", label: "Viết", value: data.skills.writing, icon: "create" as const },
      ]
    : [];

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      {/* Greeting */}
      <View className="flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text className="text-sm text-muted">{data?.greeting ?? "Xin chào"}</Text>
          <Text className="text-2xl font-bold text-ink">{user?.first_name ?? "Learner"}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(student)/profile")}
          className="w-11 h-11 rounded-full bg-primary items-center justify-center"
        >
          <Text className="text-white text-lg font-bold">
            {(user?.first_name ?? "L").charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* XP goal hero */}
      {isLoading ? (
        <SkeletonCard />
      ) : (
        <Card className="bg-primary border-primary">
          <View className="flex-row items-center justify-between">
            <View className="gap-1 flex-1">
              <Text className="text-white/80 text-xs font-medium uppercase tracking-wide">Mục tiêu hôm nay</Text>
              <Text className="text-white text-3xl font-bold">
                {data?.daily_xp ?? 0}
                <Text className="text-white/70 text-base font-semibold"> / {data?.daily_goal ?? 30} XP</Text>
              </Text>
              <View className="h-2 bg-white/25 rounded-full overflow-hidden mt-2">
                <View className="bg-white rounded-full" style={{ width: `${xpPercent}%`, height: "100%" }} />
              </View>
            </View>
            <View className="items-center gap-1 bg-white/15 rounded-lg px-4 py-3">
              <Ionicons name="flame" size={24} color="#fbbf24" />
              <Text className="text-white font-bold">{data?.streak_days ?? 0}</Text>
              <Text className="text-white/80 text-xs">ngày</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Stats */}
      {isLoading ? (
        <SkeletonCard />
      ) : (
        <View className="flex-row gap-3">
          <StatCard icon={<Ionicons name="time" size={20} color="#2563eb" />} value={`${data?.study_minutes ?? 0}p`} label="Học hôm nay" />
          <StatCard icon={<Ionicons name="book" size={20} color="#16a34a" />} value={data?.words_learned ?? 0} label="Từ đã học" />
          <StatCard icon={<Ionicons name="refresh" size={20} color="#ea580c" />} value={data?.due_reviews ?? 0} label="Cần ôn" />
        </View>
      )}

      {/* Level */}
      {data ? (
        <Card>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-semibold text-ink">Trình độ hiện tại</Text>
            <Text className="text-sm font-bold text-primary">{data.current_level}</Text>
          </View>
          <ProgressBar value={data.level_progress} color="purple" />
        </Card>
      ) : null}

      {/* Quick actions */}
      <View>
        <SectionHeading title="Học ngay" />
        <View className="flex-row gap-3">
          {[
            { icon: "search" as const, label: "Từ điển", href: "/(student)/dictionary", color: "#2563eb" },
            { icon: "bookmarks" as const, label: "Ôn tập", href: "/(student)/flashcards", color: "#16a34a" },
            { icon: "library" as const, label: "Khoá học", href: "/(student)/courses", color: "#7c3aed" },
          ].map((a) => (
            <TouchableOpacity key={a.label} onPress={() => router.push(a.href as never)} className="flex-1">
              <Card className="items-center gap-2">
                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${a.color}20` }}>
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <Text className="text-xs font-medium text-ink">{a.label}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Skill balance */}
      {data ? (
        <View>
          <SectionHeading title="Cân bằng kỹ năng" />
          <Card className="gap-3">
            {skills.map((s) => (
              <View key={s.key} className="flex-row items-center gap-3">
                <Ionicons name={s.icon} size={16} color="#64748b" />
                <Text className="text-xs text-muted w-10">{s.label}</Text>
                <View className="flex-1">
                  <ProgressBar value={s.value} size="sm" color={s.value >= 60 ? "green" : "blue"} />
                </View>
              </View>
            ))}
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
}
