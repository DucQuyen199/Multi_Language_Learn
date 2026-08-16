import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Link, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    return s; // 0-3
  })();

  const submit = async () => {
    if (!firstName.trim() || !email.trim() || !password) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu cần ít nhất 8 ký tự.");
      return;
    }
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const user = await register(email.trim().toLowerCase(), password, firstName.trim());
      if (user.role === "admin") router.replace("/(admin)");
      else if (user.role === "instructor") router.replace("/(instructor)");
      else router.replace("/(student)/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng ký thất bại.");
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
            <Text className="text-2xl font-bold text-ink">Tạo tài khoản</Text>
            <Text className="text-sm text-muted text-center">Bắt đầu học miễn phí ngay hôm nay</Text>
          </View>

          <View className="gap-4 bg-paper rounded-lg p-5 border border-line">
            <Input label="Tên của bạn" value={firstName} onChangeText={setFirstName} placeholder="Nguyễn Văn A" autoCapitalize="words" />
            <Input label="Email" value={email} onChangeText={setEmail} placeholder="ban@example.com" keyboardType="email-address" />
            <View className="gap-1.5">
              <Input label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Tối thiểu 8 ký tự" secureTextEntry />
              {password ? (
                <View className="flex-row gap-1">
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < strength ? (strength <= 1 ? "bg-danger" : strength === 2 ? "bg-warning" : "bg-success") : "bg-line"
                      }`}
                    />
                  ))}
                </View>
              ) : null}
            </View>
            <Input label="Xác nhận mật khẩu" value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry />
            {error ? <Text className="text-sm text-danger">{error}</Text> : null}
            <Button label="Đăng ký" onPress={submit} loading={loading} size="lg" />
          </View>

          <View className="flex-row justify-center gap-1">
            <Text className="text-sm text-muted">Đã có tài khoản? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-primary">Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
