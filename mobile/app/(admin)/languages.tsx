import { View, Text, FlatList, RefreshControl, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AdminLanguage } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

function LanguageCard({ lang }: { lang: AdminLanguage }) {
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (isActive: boolean) => api.admin.updateLanguage(lang.id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminLanguages"] }),
    onError: (e) => Alert.alert("Lỗi", e instanceof Error ? e.message : "Cập nhật thất bại."),
  });

  return (
    <Card className="gap-2">
      <View className="flex-row items-center gap-3">
        <Text className="text-2xl">{lang.flag_emoji}</Text>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-bold text-ink">{lang.name}</Text>
            <Text className="text-xs text-muted italic">{lang.native_name}</Text>
          </View>
          <Text className="text-xs text-muted">{lang.code.toUpperCase()}</Text>
        </View>
        <Switch
          value={lang.is_active}
          onValueChange={(v) => toggleMutation.mutate(v)}
          disabled={toggleMutation.isPending}
          trackColor={{ false: "#e2e8f0", true: "#2563eb" }}
          thumbColor="#ffffff"
        />
      </View>
      <View className="flex-row items-center gap-2">
        <Badge tone="blue" label={`${lang.word_count} từ`} />
        <Badge tone="purple" label={`${lang.course_count} khoá`} />
        <Badge tone="green" label={`${lang.learner_count} học viên`} />
      </View>
    </Card>
  );
}

export default function AdminLanguagesScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminLanguages"],
    queryFn: () => api.admin.languages(),
  });

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-ink">Ngôn ngữ</Text>
        <WorkspaceSwitcher current="admin" />
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : null
        }
        renderItem={({ item }) => <LanguageCard lang={item} />}
      />
    </View>
  );
}
