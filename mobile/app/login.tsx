import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role === "admin") router.replace("/(admin)");
      else if (user.role === "instructor") router.replace("/(instructor)");
      else router.replace("/(student)/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-canvas"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 gap-6 max-w-md w-full self-center">
          <View className="items-center gap-3">
            <Logo size={64} />
            <Text className="text-2xl font-bold text-ink">LinguaAtlas</Text>
            <Text className="text-sm text-muted text-center">
              Đăng nhập để tiếp tục hành trình ngôn ngữ của bạn
            </Text>
          </View>

          <View className="gap-4 bg-paper rounded-lg p-5 border border-line">
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="ban@example.com"
              keyboardType="email-address"
            />
            <Input
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />
            {error ? <Text className="text-sm text-danger">{error}</Text> : null}
            <Button label="Đăng nhập" onPress={submit} loading={loading} size="lg" />
          </View>

          <View className="flex-row justify-center gap-1">
            <Text className="text-sm text-muted">Chưa có tài khoản? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-primary">Đăng ký</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
