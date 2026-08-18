import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth-context";
import { isSupabaseConfigured } from "../lib/supabase";

export default function ProfilScreen() {
  const { session, signOut } = useAuth();
  const email = session?.user.email ?? "Demo kullanıcı";

  async function cikisYap() {
    await signOut();
    router.replace("/(auth)/giris");
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-4">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#eef2e4" />
        </Pressable>
        <Text className="text-foreground text-lg font-bold">Profil</Text>
      </View>

      <View className="px-5 pt-6 gap-4">
        <View className="bg-surface border border-border rounded-card p-5 gap-1">
          <Text className="text-muted text-xs uppercase tracking-widest">Hesap</Text>
          <Text className="text-foreground text-base font-semibold mt-1">{email}</Text>
        </View>

        {isSupabaseConfigured && session ? (
          <Pressable
            onPress={cikisYap}
            className="border border-border rounded-full py-3.5 items-center"
          >
            <Text className="text-foreground font-semibold text-sm">Çıkış Yap</Text>
          </Pressable>
        ) : (
          <Text className="text-muted text-xs px-1">
            Demo moddasın — Supabase yapılandırılınca gerçek hesabınla giriş yapabilirsin.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
