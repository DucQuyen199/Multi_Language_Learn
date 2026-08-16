import { View, Text, TouchableOpacity } from "react-native";
import { cn } from "./cn";

type Props = {
  title: string;
  action?: { label: string; onPress: () => void };
  className?: string;
};

export function SectionHeading({ title, action, className }: Props) {
  return (
    <View className={cn("flex-row items-center justify-between mb-3", className)}>
      <Text className="text-base font-bold text-ink">{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
          <Text className="text-sm font-medium text-primary">{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
