import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeScreen } from "../components/SafeScreen";
import { useAuth } from "../lib/auth-context";
import { isSupabaseConfigured } from "../lib/supabase";
import { useProfile } from "../lib/use-profile";

export default function ProfilScreen() {
  const { session, signOut } = useAuth();
  const { profile, guncelle } = useProfile();
  const email = session?.user.email ?? "Demo kullanıcı";

  const [ad, setAd] = useState(profile.ad);
  const [kilo, setKilo] = useState(profile.kilo_kg ? String(profile.kilo_kg) : "");
  const [boy, setBoy] = useState(profile.boy_cm ? String(profile.boy_cm) : "");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);

  useEffect(() => {
    setAd(profile.ad);
    setKilo(profile.kilo_kg ? String(profile.kilo_kg) : "");
    setBoy(profile.boy_cm ? String(profile.boy_cm) : "");
  }, [profile.ad, profile.kilo_kg, profile.boy_cm]);

  async function cikisYap() {
    await signOut();
    router.replace("/(auth)/giris");
  }

  async function kaydet() {
    setMesaj(null);
    setKaydediliyor(true);
    const hata = await guncelle({
      ad: ad.trim() || profile.ad,
      kilo_kg: kilo ? Number(kilo) : null,
      boy_cm: boy ? Number(boy) : null,
    });
    setKaydediliyor(false);
    setMesaj(hata ?? "Kaydedildi");
  }

  return (
    <SafeScreen className="flex-1 bg-background">
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
          <>
            <View className="gap-3">
              <TextInput
                value={ad}
                onChangeText={setAd}
                placeholder="Ad Soyad"
                placeholderTextColor="#9aa389"
                className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
              />
              <View className="flex-row gap-3">
                <TextInput
                  value={kilo}
                  onChangeText={setKilo}
                  placeholder="Kilo (kg)"
                  placeholderTextColor="#9aa389"
                  keyboardType="numeric"
                  className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
                />
                <TextInput
                  value={boy}
                  onChangeText={setBoy}
                  placeholder="Boy (cm)"
                  placeholderTextColor="#9aa389"
                  keyboardType="numeric"
                  className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
                />
              </View>
              <Text className="text-muted text-[11px] px-1">
                Kilo, koşu sırasında kalori hesabında kullanılır.
              </Text>
            </View>

            {mesaj ? <Text className="text-muted text-xs px-1">{mesaj}</Text> : null}

            <Pressable
              onPress={kaydet}
              disabled={kaydediliyor}
              className="bg-accent rounded-full py-3.5 items-center"
            >
              <Text className="text-accent-ink font-semibold text-sm">
                {kaydediliyor ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </Pressable>

            <Pressable
              onPress={cikisYap}
              className="border border-border rounded-full py-3.5 items-center"
            >
              <Text className="text-foreground font-semibold text-sm">Çıkış Yap</Text>
            </Pressable>
          </>
        ) : (
          <Text className="text-muted text-xs px-1">
            Demo moddasın — Supabase yapılandırılınca gerçek hesabınla giriş yapabilirsin.
          </Text>
        )}
      </View>
    </SafeScreen>
  );
}
