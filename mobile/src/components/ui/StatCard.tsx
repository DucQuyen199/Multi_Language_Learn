import { View, Text } from "react-native";
import { cn } from "./cn";

type Props = {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  className?: string;
};

export function StatCard({ icon, value, label, className }: Props) {
  return (
    <View className={cn("bg-paper rounded-lg p-3 flex-1 items-center gap-1 border border-line", className)}>
      {icon}
      <Text className="text-lg font-bold text-ink">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}
