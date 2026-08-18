import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { AuthProvider, useAuth } from "../lib/auth-context";
import { isSupabaseConfigured } from "../lib/supabase";

function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return <View className="flex-1 bg-background" />;
  }

  // Supabase henüz yapılandırılmadıysa auth zorunlu kılınmıyor,
  // geliştirme sırasında sekmeler doğrudan görülebilsin diye.
  const girisGerekli = isSupabaseConfigured && !session;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!girisGerekli}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={girisGerekli}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-background">
        <ErrorBoundary>
          <AuthProvider>
            {!isSupabaseConfigured && <SetupBanner />}
            <RootNavigator />
          </AuthProvider>
        </ErrorBoundary>
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
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
