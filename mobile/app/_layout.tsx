import "../global.css";
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { useThemeStore } from "@/lib/store";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (theme === "dark") setColorScheme("dark");
    else if (theme === "light") setColorScheme("light");
    else setColorScheme("system");
  }, [theme, setColorScheme]);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Slot />
            <StatusBar style="auto" />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
