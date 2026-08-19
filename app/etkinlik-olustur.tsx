import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeScreen } from "../components/SafeScreen";
import { useAuth } from "../lib/auth-context";
import { supabase } from "../lib/supabase";

export default function EtkinlikOlusturScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { session } = useAuth();

  const [baslik, setBaslik] = useState("");
  const [konum, setKonum] = useState("");
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  async function olustur() {
    if (!baslik.trim()) {
      setHata("Etkinlik başlığı gerekli");
      return;
    }
    if (!tarih.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(tarih.trim())) {
      setHata("Tarihi YYYY-AA-GG biçiminde gir (ör. 2026-08-25)");
      return;
    }
    if (!session || !groupId) {
      router.back();
      return;
    }

    const saatDegeri = /^\d{2}:\d{2}$/.test(saat.trim()) ? saat.trim() : "09:00";
    const tarihSaat = new Date(`${tarih.trim()}T${saatDegeri}:00`);
    if (Number.isNaN(tarihSaat.getTime())) {
      setHata("Geçersiz tarih/saat");
      return;
    }

    setHata(null);
    setKaydediliyor(true);
    const { error } = await supabase.from("events").insert({
      group_id: groupId,
      baslik: baslik.trim(),
      konum: konum.trim() || null,
      tarih: tarihSaat.toISOString(),
      olusturan_id: session.user.id,
    });
    setKaydediliyor(false);

    if (error) {
      setHata(error.message);
      return;
    }
    router.back();
  }

  return (
    <SafeScreen className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-4">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#eef2e4" />
        </Pressable>
        <Text className="text-foreground text-lg font-bold">Etkinlik Oluştur</Text>
      </View>

      <View className="px-5 pt-6 gap-4">
        <TextInput
          value={baslik}
          onChangeText={setBaslik}
          placeholder="Etkinlik başlığı (ör. Pazar Sabahı Koşusu)"
          placeholderTextColor="#9aa389"
          className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
        />

        <View className="flex-row gap-3">
          <TextInput
            value={tarih}
            onChangeText={setTarih}
            placeholder="YYYY-AA-GG"
            placeholderTextColor="#9aa389"
            className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
          />
          <TextInput
            value={saat}
            onChangeText={setSaat}
            placeholder="SS:DD"
            placeholderTextColor="#9aa389"
            className="w-28 bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
          />
        </View>

        <TextInput
          value={konum}
          onChangeText={setKonum}
          placeholder="Konum (opsiyonel)"
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
            {kaydediliyor ? "Oluşturuluyor..." : "Etkinliği Oluştur"}
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}
