import { View, Text } from "react-native";
import { cn } from "./cn";

type Props = {
  value: number;       // 0-100
  color?: "blue" | "green" | "orange" | "purple";
  size?: "sm" | "md";
  label?: string;
  className?: string;
};

const barColors = {
  blue: "bg-primary",
  green: "bg-success",
  orange: "bg-orange",
  purple: "bg-purple",
};

export function ProgressBar({ value, color = "blue", size = "md", label, className }: Props) {
  return (
    <View className={cn("gap-1", className)}>
      {(label || value !== undefined) && (
        <View className="flex-row justify-between">
          {label && <Text className="text-xs text-muted">{label}</Text>}
          <Text className="text-xs font-semibold text-muted-strong">{value}%</Text>
        </View>
      )}
      <View className={cn("bg-line rounded-full overflow-hidden", size === "sm" ? "h-1.5" : "h-2.5")}>
        <View
          className={cn("rounded-full", barColors[color])}
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: "100%" }}
        />
      </View>
    </View>
  );
}
