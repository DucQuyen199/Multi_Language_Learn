import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { cn } from "@/components/ui/cn";

export default function VocabularyScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"all" | "due">("all");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => api.vocabulary(),
  });

  const removeMutation = useMutation({
    mutationFn: (entryId: string) => api.removeVocabulary(entryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  const items = data ?? [];
  const dueItems = useMemo(
    () => items.filter((v) => new Date(v.next_review_at) <= new Date()),
    [items],
  );
  const shown = tab === "all" ? items : dueItems;
  const avgMastery = items.length ? Math.round(items.reduce((s, v) => s + v.mastery, 0) / items.length) : 0;

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Từ vựng</Text>
          {dueItems.length > 0 ? (
            <Button label={`Ôn ${dueItems.length} từ`} size="sm" onPress={() => router.push("/(student)/flashcards")} />
          ) : null}
        </View>
        <View className="flex-row bg-line rounded-lg p-1">
          {(
            [
              { key: "all", label: `Tất cả (${items.length})` },
              { key: "due", label: `Cần ôn (${dueItems.length})` },
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

      <FlatList
        data={shown}
        keyExtractor={(v) => v.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <EmptyState
              icon="bookmarks"
              message="Sổ từ vựng trống. Lưu từ mới từ Từ điển để bắt đầu!"
              action={{ label: "Mở Từ điển", onPress: () => router.push("/(student)/dictionary") }}
            />
          )
        }
        renderItem={({ item }) => {
          const overdue = new Date(item.next_review_at) <= new Date();
          return (
            <Card className="gap-2">
              <View className="flex-row items-center gap-2">
                <View className="flex-1 gap-0.5">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold text-ink">{item.word}</Text>
                    {item.ipa ? <Text className="text-xs text-muted">{item.ipa}</Text> : null}
                  </View>
                  <Text className="text-xs text-muted">{item.translation || item.note}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeMutation.mutate(item.entry_id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-2">
                {item.cefr ? <Badge tone="blue" label={item.cefr} /> : null}
                <Badge tone={overdue ? "orange" : "green"} label={overdue ? "Cần ôn" : "Đã thuộc"} />
                <View className="flex-1">
                  <ProgressBar value={item.mastery} size="sm" color={item.mastery >= 70 ? "green" : "blue"} />
                </View>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}
