import { View, Text } from "react-native";
import { cn } from "./ui/cn";

const toneBySkill: Record<string, string> = {
  listening: "bg-primary-soft text-primary",
  speaking: "bg-success-soft text-success",
  reading: "bg-orange-soft text-orange",
  writing: "bg-purple-soft text-purple",
  vocabulary: "bg-warning-soft text-warning",
  grammar: "bg-danger-soft text-danger",
};

type Props = { skill: string; label: string };

export function SkillChip({ skill, label }: Props) {
  return (
    <View className={cn("px-2.5 py-1 rounded-full", toneBySkill[skill] ?? "bg-line text-ink")}>
      <Text className="text-xs font-medium">{label}</Text>
    </View>
  );
}
