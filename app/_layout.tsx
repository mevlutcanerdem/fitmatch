import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider } from "../lib/auth-context";
import { isSupabaseConfigured } from "../lib/supabase";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {!isSupabaseConfigured && <SetupBanner />}
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="light" />
      </AuthProvider>
    </ErrorBoundary>
  );
}

function SetupBanner() {
  return (
    <View className="bg-surface-2 border-b border-border px-4 py-2">
      <Text className="text-muted text-[11px] text-center">
        Demo modu: Supabase bağlı değil, giriş atlandı. .env dosyasına anahtarları ekleyince gerçek
        giriş/kayıt aktif olur.
      </Text>
    </View>
  );
}
