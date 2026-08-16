import { View, Text, TextInput } from "react-native";
import { cn } from "./cn";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  error?: string;
  className?: string;
};

export function Input({
  label, value, onChangeText, placeholder, secureTextEntry,
  autoCapitalize = "none", autoCorrect = false, keyboardType, error, className,
}: Props) {
  return (
    <View className={cn("gap-1.5", className)}>
      {label && <Text className="text-sm font-medium text-ink">{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        className={cn(
          "bg-paper border rounded-lg px-3 py-2.5 text-sm text-ink",
          error ? "border-danger" : "border-line",
        )}
      />
      {error && <Text className="text-xs text-danger">{error}</Text>}
    </View>
  );
}
