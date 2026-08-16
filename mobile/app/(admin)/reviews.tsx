import { useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api, type AdminCourse } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { cn } from "@/components/ui/cn";

function PendingCard({ course }: { course: AdminCourse }) {
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const reviewMutation = useMutation({
    mutationFn: ({ action, reviewNote }: { action: "approve" | "reject"; reviewNote: string }) =>
      api.admin.reviewCourse(course.id, action, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourses"] });
      queryClient.invalidateQueries({ queryKey: ["adminOverview"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Thao tác thất bại."),
  });

  const reject = () => {
    if (!note.trim()) {
      setError("Cần ghi chú lý do để giảng viên biết cần sửa gì.");
      return;
    }
    reviewMutation.mutate({ action: "reject", reviewNote: note.trim() });
    setRejectOpen(false);
  };

  return (
    <Card className="gap-2.5">
      <View className="flex-row items-center gap-2">
        <View className="flex-1 gap-0.5">
          <Text className="text-sm font-bold text-ink" numberOfLines={2}>
            {course.title}
          </Text>
          <Text className="text-xs text-muted" numberOfLines={1}>
            {course.instructor_name} · {course.lesson_count} bài · {course.cefr}
          </Text>
        </View>
        <Badge tone="orange" label="Chờ duyệt" />
      </View>
      <Text className="text-xs text-muted" numberOfLines={3}>
        {course.description}
      </Text>
      {error ? <Text className="text-xs text-danger">{error}</Text> : null}
      <View className="flex-row gap-2">
        <Button
          label="Duyệt xuất bản"
          size="sm"
          onPress={() => reviewMutation.mutate({ action: "approve", reviewNote: "" })}
          loading={reviewMutation.isPending && reviewMutation.variables?.action === "approve"}
        />
        <Button
          label="Từ chối"
          size="sm"
          variant="danger"
          onPress={() => setRejectOpen(true)}
          disabled={reviewMutation.isPending}
        />
      </View>

      <Modal visible={rejectOpen} animationType="fade" transparent onRequestClose={() => setRejectOpen(false)}>
        <TouchableOpacity className="flex-1 bg-black/40 justify-center px-6" activeOpacity={1} onPress={() => setRejectOpen(false)}>
          <Card className="gap-3">
            <Text className="text-base font-bold text-ink">Từ chối khoá học</Text>
            <Text className="text-xs text-muted">
              Ghi chú bắt buộc — giảng viên sẽ thấy nội dung này để chỉnh sửa trước khi gửi lại.
            </Text>
            <TextInput
              value={note}
              onChangeText={(t) => {
                setNote(t);
                setError("");
              }}
              placeholder="Ví dụ: Cần thêm bài giảng và ảnh minh hoạ..."
              placeholderTextColor="#94a3b8"
              multiline
              className="bg-canvas border border-line rounded-lg px-3 py-2.5 text-sm text-ink min-h-20 text-top"
            />
            {error ? <Text className="text-xs text-danger">{error}</Text> : null}
            <View className="flex-row gap-2">
              <Button label="Huỷ" variant="secondary" onPress={() => setRejectOpen(false)} className="flex-1" />
              <Button label="Từ chối" variant="danger" onPress={reject} className="flex-1" />
            </View>
          </Card>
        </TouchableOpacity>
      </Modal>
    </Card>
  );
}

export default function AdminReviewsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"pending" | "processed">("pending");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminCourses"],
    queryFn: () => api.admin.courses(),
  });

  const courses = data ?? [];
  const pending = courses.filter((c) => c.status === "pending");
  const processed = courses.filter((c) => c.status !== "pending");

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Duyệt khoá học</Text>
          <WorkspaceSwitcher current="admin" />
        </View>
        <View className="flex-row bg-line rounded-lg p-1">
          {(
            [
              { key: "pending", label: `Chờ duyệt (${pending.length})` },
              { key: "processed", label: `Đã xử lý (${processed.length})` },
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : tab === "pending" ? (
          pending.length === 0 ? (
            <EmptyState icon="checkmark-done" message="Không có khoá học nào đang chờ duyệt. Tuyệt vời! 🎉" />
          ) : (
            pending.map((c) => <PendingCard key={c.id} course={c} />)
          )
        ) : processed.length === 0 ? (
          <EmptyState icon="library" message="Chưa có khoá học nào được xử lý." />
        ) : (
          processed.map((c) => (
            <Card key={c.id} className="gap-1.5">
              <View className="flex-row items-center gap-2">
                <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
                  {c.title}
                </Text>
                <Badge
                  tone={c.status === "published" ? "green" : c.status === "archived" ? "neutral" : "neutral"}
                  label={c.status === "published" ? "Đã xuất bản" : c.status === "archived" ? "Lưu trữ" : "Nháp"}
                />
              </View>
              <Text className="text-xs text-muted" numberOfLines={1}>
                {c.instructor_name} · {c.enrollment_count} học viên
              </Text>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}
