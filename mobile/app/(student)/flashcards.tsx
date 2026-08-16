import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/components/ui/cn";

const ratings = [
  { key: "again", label: "Lặp lại", color: "bg-danger", hint: "<1 phút" },
  { key: "hard", label: "Khó", color: "bg-warning", hint: "6 ngày" },
  { key: "good", label: "Tốt", color: "bg-success", hint: "10 ngày" },
  { key: "easy", label: "Dễ", color: "bg-primary", hint: "21 ngày" },
] as const;

export default function FlashcardsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => api.vocabulary(),
  });

  const dueQueue = useMemo(() => {
    const now = new Date();
    return (data ?? []).filter((v) => new Date(v.next_review_at) <= now);
  }, [data]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const rateMutation = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: string }) => api.review(id, rating),
    onSuccess: () => {
      setDone((d) => d + 1);
      setFlipped(false);
      setIndex((i) => i + 1);
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });

  const card = dueQueue[index];

  if (isLoading) return <View className="flex-1 bg-canvas" />;

  if (!card) {
    return (
      <View className="flex-1 bg-canvas">
        <View style={{ paddingTop: insets.top + 8 }} className="px-4 pb-3 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-ink">Ôn tập thẻ</Text>
        </View>
        <EmptyState
          icon="checkmark-circle"
          message={done > 0 ? `Hoàn thành ${done} thẻ trong phiên này! 🎉` : "Không có thẻ nào cần ôn lúc này."}
          action={{ label: "Quay lại", onPress: () => router.back() }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top + 8 }}>
      <View className="px-4 pb-3 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <View className="flex-1">
          <ProgressBar value={Math.round(((index) / Math.max(1, dueQueue.length)) * 100)} size="sm" />
        </View>
        <Text className="text-xs text-muted">
          {index + 1}/{dueQueue.length}
        </Text>
      </View>

      <View className="flex-1 px-4 gap-4 justify-center">
        <TouchableOpacity activeOpacity={0.95} onPress={() => setFlipped((f) => !f)} className="flex-1 max-h-72 justify-center">
          <Card className={cn("items-center justify-center gap-3 py-10", flipped ? "bg-primary-soft border-primary" : "bg-paper")}>
            <Text className="text-xs text-muted uppercase tracking-widest">
              {flipped ? "Nghĩa" : "Từ vựng"}
            </Text>
            <Text className="text-3xl font-bold text-ink text-center px-4">{flipped ? card.translation || card.note : card.word}</Text>
            {!flipped && card.ipa ? <Text className="text-sm text-muted font-mono">{card.ipa}</Text> : null}
            <Text className="text-xs text-muted mt-2">Chạm để {flipped ? "xem từ" : "lật thẻ"}</Text>
          </Card>
        </TouchableOpacity>

        {flipped ? (
          <View className="flex-row gap-2">
            {ratings.map((r) => (
              <TouchableOpacity
                key={r.key}
                className={cn("flex-1 rounded-lg py-3 items-center gap-0.5", r.color)}
                onPress={() => rateMutation.mutate({ id: card.id, rating: r.key })}
                disabled={rateMutation.isPending}
                activeOpacity={0.7}
              >
                <Text className="text-white text-sm font-bold">{r.label}</Text>
                <Text className="text-white/80 text-xs">{r.hint}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
