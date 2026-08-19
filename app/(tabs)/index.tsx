import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";
import { useProfile } from "../../lib/use-profile";
import { useSonAktivite } from "../../lib/use-son-aktivite";
import { useTodaySteps } from "../../lib/use-steps";

const STEP_GOAL = 10000;
const MET = { kosu: 9.8, yuruyus: 3.5, bisiklet: 7.5 } as const;

function sureFormatla(saniye: number) {
  const dk = Math.round(saniye / 60);
  return `${dk} dk`;
}

function tempoFormatla(saniye: number, km: number) {
  if (km <= 0) return "–";
  const dkPerKm = saniye / 60 / km;
  const dk = Math.floor(dkPerKm);
  const sn = Math.round((dkPerKm - dk) * 60);
  return `${dk}:${sn.toString().padStart(2, "0")}/km`;
}

export default function BugunScreen() {
  const { profile } = useProfile();
  const { steps } = useTodaySteps();
  const sonAktivite = useSonAktivite();

  const kalan = Math.max(STEP_GOAL - steps, 0);
  const ilerleme = Math.min(Math.round((steps / STEP_GOAL) * 100), 100);
  const kilo = profile.kilo_kg ?? 70;

  const gunlukKalori = Math.round((MET.yuruyus * kilo * (steps / 1200)) / 60);

  return (
    <SafeScreen className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-xs uppercase tracking-widest">Bugünkü Hareket</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">Merhaba, {profile.ad}</Text>
          </View>
          <Pressable
            onPress={() => router.push("/profil")}
            className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
          >
            <Ionicons name="person-outline" size={18} color="#eef2e4" />
          </Pressable>
        </View>

        <View className="bg-surface border border-border rounded-card p-6 gap-1">
          <Text className="text-accent text-4xl font-bold">{steps.toLocaleString("tr-TR")}</Text>
          <Text className="text-muted text-xs">adım · %{ilerleme} tamamlandı</Text>
          <View className="h-2 bg-surface-2 rounded-full mt-3 overflow-hidden">
            <View className="h-2 bg-accent rounded-full" style={{ width: `${ilerleme}%` }} />
          </View>
        </View>

        <View className="bg-surface-2 border border-border rounded-card p-4">
          <Text className="text-foreground text-sm">
            Bugünkü hedefe {kalan.toLocaleString("tr-TR")} adım kaldı
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface border border-border rounded-card p-4 gap-1">
            <Text className="text-muted text-xs">Son Koşu</Text>
            {sonAktivite ? (
              <>
                <Text className="text-foreground text-lg font-bold">
                  {sureFormatla(sonAktivite.sure_sn)}
                </Text>
                <Text className="text-muted text-xs">
                  {sonAktivite.mesafe_km.toFixed(1)} km ·{" "}
                  {tempoFormatla(sonAktivite.sure_sn, sonAktivite.mesafe_km)}
                </Text>
              </>
            ) : (
              <Text className="text-muted text-xs mt-1">Henüz kayıt yok</Text>
            )}
          </View>
          <View className="flex-1 bg-surface border border-border rounded-card p-4 gap-1">
            <Text className="text-muted text-xs">Yakılan Kalori</Text>
            <Text className="text-accent text-lg font-bold">
              {(sonAktivite?.kalori ?? gunlukKalori).toLocaleString("tr-TR")} kcal
            </Text>
            <Text className="text-muted text-xs">MET tabanlı tahmin</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push("/kosu-kaydet")}
          className="bg-accent rounded-full py-4 items-center mt-2"
        >
          <Text className="text-accent-ink font-semibold text-base">Aktiviteyi Başlat</Text>
        </Pressable>
      </ScrollView>
    </SafeScreen>
  );
}
