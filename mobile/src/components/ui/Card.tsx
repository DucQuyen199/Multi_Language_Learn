import { View, TouchableOpacity, type ViewProps } from "react-native";
import { cn } from "./cn";

type Props = ViewProps & { pressable?: boolean; onPress?: () => void };

export function Card({ className, pressable, onPress, children, ...rest }: Props) {
  if (pressable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className={cn("bg-paper rounded-lg p-4 border border-line", className)}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View className={cn("bg-paper rounded-lg p-4 border border-line", className)} {...rest}>
      {children}
    </View>
  );
}
