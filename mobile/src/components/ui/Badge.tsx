import { Text, View } from "react-native";
import { cn } from "./cn";

type Tone = "neutral" | "blue" | "green" | "orange" | "purple" | "red";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-line text-ink",
  blue: "bg-primary-soft text-primary",
  green: "bg-success-soft text-success",
  orange: "bg-orange-soft text-orange",
  purple: "bg-purple-soft text-purple",
  red: "bg-danger-soft text-danger",
};

type Props = { tone?: Tone; label: string; className?: string };

export function Badge({ tone = "neutral", label, className }: Props) {
  return (
    <View className={cn("self-start px-2.5 py-0.5 rounded-full", toneClasses[tone], className)}>
      <Text className="text-xs font-medium">{label}</Text>
    </View>
  );
}
