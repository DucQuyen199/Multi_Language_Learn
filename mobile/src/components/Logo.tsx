import { View } from "react-native";
import Svg, { Rect, Polygon, Circle } from "react-native-svg";
import { cn } from "./ui/cn";

type Props = { size?: number; className?: string };

export function Logo({ size = 36, className }: Props) {
  const s = size;
  return (
    <View className={cn("items-center justify-center", className)}>
      <Svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <Rect x="0" y="0" width="40" height="40" rx="10" fill="#2563eb" />
        <Polygon points="10,12 10,28 28,20" fill="white" opacity="0.9" />
        <Circle cx="12" cy="14" r="2.5" fill="white" />
        <Circle cx="12" cy="20" r="2.5" fill="white" />
        <Circle cx="12" cy="26" r="2.5" fill="white" />
      </Svg>
    </View>
  );
}
