import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRequireRole } from "@/lib/guard";

export default function AdminLayout() {
  useRequireRole("admin");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: { backgroundColor: "#ffffff", borderTopColor: "#e2e8f0" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tổng quan",
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          title: "Duyệt khoá",
          tabBarIcon: ({ color, size }) => <Ionicons name="clipboard" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Người dùng",
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="languages"
        options={{
          title: "Ngôn ngữ",
          tabBarIcon: ({ color, size }) => <Ionicons name="language" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
