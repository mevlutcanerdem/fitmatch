import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeScreen } from "../components/SafeScreen";
import { useAuth } from "../lib/auth-context";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const SPOR_TURLERI = [
  { deger: "kosu", etiket: "Koşu" },
  { deger: "fitness", etiket: "Fitness" },
  { deger: "bisiklet", etiket: "Bisiklet" },
  { deger: "yuruyus", etiket: "Yürüyüş" },
] as const;

export default function GrupOlusturScreen() {
  const { session } = useAuth();
  const [isim, setIsim] = useState("");
  const [konum, setKonum] = useState("");
  const [sporTuru, setSporTuru] = useState<(typeof SPOR_TURLERI)[number]["deger"]>("kosu");
  const [hata, setHata] = useState<string | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  async function olustur() {
    if (!isim.trim()) {
      setHata("Grup adı gerekli");
      return;
    }
    if (!isSupabaseConfigured || !session) {
      router.back();
      return;
    }
    setHata(null);
    setKaydediliyor(true);

    const { data: grup, error } = await supabase
      .from("groups")
      .insert({
        isim: isim.trim(),
        spor_turu: sporTuru,
        konum: konum.trim() || null,
        olusturan_id: session.user.id,
      })
      .select()
      .single();

    if (error) {
      setHata(error.message);
      setKaydediliyor(false);
      return;
    }

    await supabase
      .from("group_members")
      .insert({ group_id: grup.id, user_id: session.user.id, rol: "yonetici" });

    setKaydediliyor(false);
    router.back();
  }

  return (
    <SafeScreen className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-4">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#eef2e4" />
        </Pressable>
        <Text className="text-foreground text-lg font-bold">Grup Oluştur</Text>
      </View>

      <View className="px-5 pt-6 gap-4">
        <TextInput
          value={isim}
          onChangeText={setIsim}
          placeholder="Grup adı (ör. Kadıköy Koşu Ekibi)"
          placeholderTextColor="#9aa389"
          className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
        />

        <View className="flex-row flex-wrap gap-2">
          {SPOR_TURLERI.map((s) => {
            const secili = s.deger === sporTuru;
            return (
              <Pressable
                key={s.deger}
                onPress={() => setSporTuru(s.deger)}
                className={
                  secili
                    ? "bg-accent rounded-full px-4 py-2"
                    : "bg-surface border border-border rounded-full px-4 py-2"
                }
              >
                <Text className={secili ? "text-accent-ink text-xs font-semibold" : "text-muted text-xs font-semibold"}>
                  {s.etiket}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          value={konum}
          onChangeText={setKonum}
          placeholder="Konum (opsiyonel, ör. Kadıköy)"
          placeholderTextColor="#9aa389"
          className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
        />

        {hata ? <Text className="text-red-400 text-xs">{hata}</Text> : null}

        <Pressable
          onPress={olustur}
          disabled={kaydediliyor}
          className="bg-accent rounded-full py-4 items-center mt-1"
        >
          <Text className="text-accent-ink font-semibold text-base">
            {kaydediliyor ? "Oluşturuluyor..." : "Grubu Oluştur"}
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}
