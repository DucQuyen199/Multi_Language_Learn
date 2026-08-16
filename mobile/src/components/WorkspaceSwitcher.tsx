import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth";
import { cn } from "./ui/cn";

type Props = { current: "instructor" | "admin" };

export function WorkspaceSwitcher({ current }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const items = [
    { key: "student", label: "Học tập", icon: "home" as const, href: "/(student)/dashboard", show: true },
    { key: "instructor", label: "Studio giảng viên", icon: "school" as const, href: "/(instructor)", show: user?.role === "instructor" || user?.role === "admin" },
    { key: "admin", label: "Quản trị", icon: "shield" as const, href: "/(admin)", show: user?.role === "admin" },
  ].filter((i) => i.show);

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} className="w-9 h-9 rounded-full bg-primary-soft items-center justify-center">
        <Ionicons name="swap-horizontal" size={18} color="#2563eb" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity className="flex-1 bg-black/40 justify-center px-6" activeOpacity={1} onPress={() => setOpen(false)}>
          <View className="bg-paper rounded-lg p-4 gap-1">
            <Text className="text-sm font-bold text-ink px-2 pb-2">Chuyển không gian làm việc</Text>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  setOpen(false);
                  router.replace(item.href as never);
                }}
                className={cn(
                  "flex-row items-center gap-3 rounded-lg px-3 py-3",
                  item.key === current ? "bg-primary-soft" : "bg-paper",
                )}
              >
                <Ionicons name={item.icon} size={20} color={item.key === current ? "#2563eb" : "#64748b"} />
                <Text className={cn("flex-1 text-sm font-medium", item.key === current ? "text-primary" : "text-ink")}>
                  {item.label}
                </Text>
                {item.key === current ? <Ionicons name="checkmark" size={18} color="#2563eb" /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
