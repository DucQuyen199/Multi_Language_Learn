import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  message: string;
  action?: { label: string; onPress: () => void };
};

export function EmptyState({ icon = "cube-outline", message, action }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3 py-10">
      <Ionicons name={icon} size={48} color="#94a3b8" />
      <Text className="text-center text-muted text-sm">{message}</Text>
      {action ? (
        <View className="mt-2">
          <TouchableOpacity
            className="bg-primary rounded-lg px-4 py-2"
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-semibold">{action.label}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}
