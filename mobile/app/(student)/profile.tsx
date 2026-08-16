import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useAuth } from "@/lib/auth";
import { useLearningStore, useThemeStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/Logo";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { targetLanguage, setTargetLanguage } = useLearningStore();
  const { theme, setTheme } = useThemeStore();
  const { setColorScheme } = useColorScheme();
  const isDark = theme === "dark";

  const toggleTheme = (dark: boolean) => {
    setTheme(dark ? "dark" : "light");
    setColorScheme(dark ? "dark" : "light");
  };

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 32, paddingHorizontal: 16, gap: 16 }}
    >
      {/* Profile card */}
      <Card className="flex-row items-center gap-4">
        <View className="w-14 h-14 rounded-full bg-primary items-center justify-center">
          <Text className="text-white text-xl font-bold">
            {(user?.first_name ?? "L").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-lg font-bold text-ink">{user?.first_name}</Text>
          <Text className="text-xs text-muted" numberOfLines={1}>
            {user?.email}
          </Text>
          <Text className="text-xs text-primary font-medium">
            {user?.role === "admin" ? "Quản trị viên" : user?.role === "instructor" ? "Giảng viên" : "Học viên"}
          </Text>
        </View>
      </Card>

      {/* Language */}
      <Card className="gap-3">
        <Text className="text-sm font-bold text-ink">Ngôn ngữ đang học</Text>
        <View className="flex-row gap-2">
          {languages.map((l) => (
            <TouchableOpacity
              key={l.code}
              onPress={() => setTargetLanguage(l.code)}
              className={`flex-1 rounded-lg border py-2.5 items-center gap-0.5 ${
                targetLanguage === l.code ? "border-primary bg-primary-soft" : "border-line"
              }`}
            >
              <Text className="text-lg">{l.flag}</Text>
              <Text className={`text-xs font-medium ${targetLanguage === l.code ? "text-primary" : "text-muted"}`}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Appearance */}
      <Card className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={isDark ? "#7c3aed" : "#ea580c"} />
          <Text className="text-sm font-medium text-ink">Chế độ tối</Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: "#e2e8f0", true: "#2563eb" }}
          thumbColor="#ffffff"
        />
      </Card>

      {/* Workspace switcher */}
      {user && (user.role === "instructor" || user.role === "admin") ? (
        <Card className="gap-2">
          <Text className="text-sm font-bold text-ink">Không gian làm việc</Text>
          <TouchableOpacity
            onPress={() => router.replace("/(instructor)")}
            className="flex-row items-center gap-3 py-2"
          >
            <Ionicons name="school" size={20} color="#2563eb" />
            <Text className="flex-1 text-sm text-ink">Studio giảng viên</Text>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
          {user.role === "admin" ? (
            <TouchableOpacity
              onPress={() => router.replace("/(admin)")}
              className="flex-row items-center gap-3 py-2"
            >
              <Ionicons name="shield" size={20} color="#dc2626" />
              <Text className="flex-1 text-sm text-ink">Quản trị hệ thống</Text>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </Card>
      ) : null}

      {/* About */}
      <Card className="items-center gap-2 py-6">
        <Logo size={40} />
        <Text className="text-sm font-bold text-ink">LinguaAtlas</Text>
        <Text className="text-xs text-muted">Phiên bản 0.1.0 · Học ngoại giao mỗi ngày</Text>
      </Card>

      <Button label="Đăng xuất" variant="danger" size="lg" onPress={() => logout()} />
    </ScrollView>
  );
}
