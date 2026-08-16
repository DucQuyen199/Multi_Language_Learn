import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api, type DictionaryEntry } from "@/lib/api";
import { useLearningStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/components/ui/cn";

export default function DictionaryScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const targetLanguage = useLearningStore((s) => s.targetLanguage);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<DictionaryEntry | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ["search", debounced, targetLanguage],
    queryFn: () => api.search(debounced, targetLanguage),
    enabled: debounced.length >= 1,
  });

  const entryQuery = useQuery({
    queryKey: ["entry", selected?.slug],
    queryFn: () => api.entry(selected!.language_code, selected!.slug),
    enabled: !!selected,
  });

  const saveMutation = useMutation({
    mutationFn: (entryId: string) => api.saveVocabulary(entryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vocabulary"] }),
  });

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 gap-3">
        <Text className="text-2xl font-bold text-ink">Từ điển</Text>
        <View className="flex-row items-center gap-2 bg-paper border border-line rounded-lg px-3">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tra từ vựng..."
            placeholderTextColor="#94a3b8"
            className="flex-1 py-2.5 text-sm text-ink"
            autoCapitalize="none"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {debounced.length === 0 ? (
        <EmptyState icon="search-outline" message="Nhập một từ để tra cứu nghĩa, phát âm và ví dụ." />
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={results ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10 }}
          ListEmptyComponent={<EmptyState icon="alert-circle-outline" message={`Không tìm thấy kết quả cho "${debounced}".`} />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelected({ ...item } as unknown as DictionaryEntry)}>
              <Card className="gap-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-base font-bold text-ink">{item.word}</Text>
                  {item.ipa ? <Text className="text-xs text-muted">{item.ipa}</Text> : null}
                  <View className="flex-1" />
                  {item.cefr ? <Badge tone="blue" label={item.cefr} /> : null}
                </View>
                <Text className="text-xs italic text-muted">{item.part_of_speech}</Text>
                <Text className="text-sm text-navy" numberOfLines={2}>
                  {item.definition}
                </Text>
                {item.translation ? <Text className="text-xs text-primary">{item.translation}</Text> : null}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Entry detail modal */}
      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View className="flex-1 bg-canvas">
          <View style={{ paddingTop: insets.top + 8 }} className="flex-row items-center gap-3 px-4 pb-3 bg-paper border-b border-line">
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Ionicons name="close" size={26} color="#0f172a" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-ink flex-1" numberOfLines={1}>
              {selected?.word}
            </Text>
            <Button
              label="Lưu"
              size="sm"
              loading={saveMutation.isPending && entryQuery.data?.id === saveMutation.variables}
              onPress={() => entryQuery.data && saveMutation.mutate(entryQuery.data.id)}
            />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
            {entryQuery.isLoading ? (
              <ActivityIndicator size="large" color="#2563eb" className="mt-8" />
            ) : entryQuery.data ? (
              <>
                <Card className="gap-2">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    {entryQuery.data.cefr ? <Badge tone="blue" label={entryQuery.data.cefr} /> : null}
                    {entryQuery.data.academic_level ? <Badge tone="purple" label={entryQuery.data.academic_level} /> : null}
                    {entryQuery.data.domain ? <Badge tone="orange" label={entryQuery.data.domain} /> : null}
                    <Badge tone="neutral" label={entryQuery.data.part_of_speech} />
                  </View>
                  {entryQuery.data.ipa ? (
                    <Text className="text-sm text-muted font-mono">{entryQuery.data.ipa}</Text>
                  ) : null}
                  {saveMutation.isSuccess ? <Text className="text-xs text-success">Đã lưu vào sổ từ vựng ✓</Text> : null}
                </Card>

                {entryQuery.data.meanings.map((m) => (
                  <Card key={m.id} className="gap-2">
                    <View className="flex-row items-center gap-2">
                      <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                        <Text className="text-white text-xs font-bold">{m.order}</Text>
                      </View>
                      <Text className="text-sm font-semibold text-ink flex-1">{m.definition}</Text>
                    </View>
                    {m.translations.length > 0 ? (
                      <View className="flex-row flex-wrap gap-1.5">
                        {m.translations.map((t, i) => (
                          <View key={i} className="bg-primary-soft rounded-md px-2 py-1">
                            <Text className="text-xs text-primary">{t}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {m.examples.map((ex) => (
                      <View key={ex.id} className="bg-canvas rounded-md p-3 gap-1">
                        <Text className="text-sm text-navy italic">{ex.sentence}</Text>
                        {ex.translation ? <Text className="text-xs text-muted">{ex.translation}</Text> : null}
                      </View>
                    ))}
                  </Card>
                ))}
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
