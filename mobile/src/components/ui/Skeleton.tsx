import { View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";
import { useEffect } from "react";
import { cn } from "./cn";

export function Skeleton({ className }: { className?: string }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.8, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animatedStyle}>
      <View className={cn("bg-line rounded-lg h-4 w-full", className)} />
    </Animated.View>
  );
}

export function SkeletonCard() {
  return (
    <View className="bg-paper rounded-lg p-4 border border-line gap-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </View>
  );
}
