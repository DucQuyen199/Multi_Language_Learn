import { useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { api, type AdminAccount } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";
import { cn } from "@/components/ui/cn";

const roleTabs = [
  { key: "", label: "Tất cả" },
  { key: "student", label: "Học viên" },
  { key: "instructor", label: "Giảng viên" },
  { key: "admin", label: "Admin" },
] as const;

const roleBadge: Record<string, { tone: "blue" | "purple" | "red"; label: string }> = {
  student: { tone: "blue", label: "Học viên" },
  instructor: { tone: "purple", label: "Giảng viên" },
  admin: { tone: "red", label: "Admin" },
};

function UserRow({ user, canManage }: { user: AdminAccount; canManage: boolean }) {
  const queryClient = useQueryClient();
  const badge = roleBadge[user.role] ?? roleBadge.student;

  const roleMutation = useMutation({
    mutationFn: (role: string) => api.admin.updateUser(user.id, { role }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
    onError: (e) => Alert.alert("Lỗi", e instanceof Error ? e.message : "Cập nhật thất bại."),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.admin.deleteUser(user.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
    onError: (e) => Alert.alert("Lỗi", e instanceof Error ? e.message : "Xoá thất bại."),
  });

  const cycleRole = () => {
    const next = user.role === "student" ? "instructor" : user.role === "instructor" ? "admin" : "student";
    Alert.alert("Đổi vai trò?", `${user.first_name} sẽ thành ${roleBadge[next].label}.`, [
      { text: "Huỷ", style: "cancel" },
      { text: "Xác nhận", onPress: () => roleMutation.mutate(next) },
    ]);
  };

  return (
    <Card className="gap-2">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-primary-soft items-center justify-center">
          <Text className="text-primary font-bold">{user.first_name.charAt(0)}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-bold text-ink flex-1" numberOfLines={1}>
              {user.first_name}
            </Text>
            <Badge tone={badge.tone} label={badge.label} />
          </View>
          <Text className="text-xs text-muted" numberOfLines={1}>
            {user.email}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted">
          {user.enrolled_courses} khoá · {user.completed_lessons} bài hoàn thành
        </Text>
        {canManage ? (
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={cycleRole} hitSlop={8}>
              <Ionicons name="swap-horizontal" size={18} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Xoá người dùng?", `Tài khoản ${user.email} sẽ bị xoá vĩnh viễn.`, [
                  { text: "Huỷ", style: "cancel" },
                  { text: "Xoá", style: "destructive", onPress: () => deleteMutation.mutate() },
                ])
              }
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<string>("");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["adminUsers", role, debounced],
    queryFn: () => api.admin.users({ role: role || undefined, q: debounced || undefined, limit: 50 }),
  });

  return (
    <View className="flex-1 bg-canvas">
      <View style={{ paddingTop: insets.top + 12 }} className="px-4 pb-3 gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">Người dùng</Text>
          <WorkspaceSwitcher current="admin" />
        </View>

        <View className="flex-row items-center gap-2 bg-paper border border-line rounded-lg px-3">
          <Ionicons name="search" size={18} color="#64748b" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm theo tên hoặc email..."
            placeholderTextColor="#94a3b8"
            className="flex-1 py-2.5 text-sm text-ink"
            autoCapitalize="none"
          />
        </View>

        <View className="flex-row gap-2">
          {roleTabs.map((t) => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setRole(t.key)}
              className={cn(
                "px-3 py-1.5 rounded-full border",
                role === t.key ? "border-primary bg-primary-soft" : "border-line",
              )}
            >
              <Text className={cn("text-xs font-medium", role === t.key ? "text-primary" : "text-muted")}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {data ? (
          <Text className="text-xs text-muted">Tổng số: {data.total}</Text>
        ) : null}
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(u) => u.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 10, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <EmptyState icon="people" message="Không tìm thấy người dùng nào." />
          )
        }
        renderItem={({ item }) => <UserRow user={item} canManage />}
      />
    </View>
  );
}
