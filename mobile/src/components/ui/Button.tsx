import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary",
  secondary: "bg-line",
  danger: "bg-danger",
  ghost: "bg-transparent",
};

const textClasses: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-ink",
  danger: "text-white",
  ghost: "text-primary",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 rounded-lg",
  md: "px-4 py-2.5 rounded-lg",
  lg: "px-5 py-3 rounded-md",
};

const textSizes: Record<Size, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

type Props = {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  onPress: () => void;
};

export function Button({ label, variant = "primary", size = "md", loading, disabled, icon, className, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        "flex-row items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && "opacity-50",
        className,
      )}
      activeOpacity={0.7}
    >
      {loading ? <ActivityIndicator size="small" color={variant === "primary" ? "#fff" : "#2563eb"} /> : icon}
      <Text className={cn("font-semibold", textSizes[size], textClasses[variant])}>{label}</Text>
    </TouchableOpacity>
  );
}
