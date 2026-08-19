import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";

const KATEGORILER = ["Tümü", "Koşu", "Fitness", "Bisiklet"] as const;

const SPORCULAR = [
  {
    id: "1",
    ad: "Duru A.",
    ozellik: "Koşu · Orta seviye",
    etiketler: ["Sabah koşusu", "5-10km"],
    baslangic: "D",
  },
  {
    id: "2",
    ad: "Mert K.",
    ozellik: "Fitness · Salon takip",
    etiketler: ["Ağırlık antrenmanı", "Akşamları"],
    baslangic: "M",
  },
  {
    id: "3",
    ad: "Selin Y.",
    ozellik: "Bisiklet · İleri seviye",
    etiketler: ["Hafta sonu turu", "40km+"],
    baslangic: "S",
  },
];

export default function KesfetScreen() {
  const [aktif, setAktif] = useState<(typeof KATEGORILER)[number]>("Tümü");

  return (
    <SafeScreen className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View>
          <Text className="text-muted text-xs uppercase tracking-widest">Hareketini Bul</Text>
          <Text className="text-foreground text-2xl font-bold mt-1">Keşfet</Text>
          <Text className="text-muted text-sm mt-1">
            Sana iyi gelecek sporcuları, etkinlikleri ve rotaları keşfet
          </Text>
        </View>

        <View className="flex-row items-center bg-surface border border-border rounded-full px-4 py-3 gap-2">
          <Ionicons name="search" size={18} color="#9aa389" />
          <TextInput
            placeholder="Sporcu, grup veya spor ara"
            placeholderTextColor="#9aa389"
            className="flex-1 text-foreground"
          />
        </View>

        <View className="flex-row gap-2">
          {KATEGORILER.map((k) => {
            const secili = k === aktif;
            return (
              <Pressable
                key={k}
                onPress={() => setAktif(k)}
                className={
                  secili
                    ? "bg-accent rounded-full px-4 py-2"
                    : "bg-surface border border-border rounded-full px-4 py-2"
                }
              >
                <Text className={secili ? "text-accent-ink text-xs font-semibold" : "text-muted text-xs font-semibold"}>
                  {k}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-1">
          <Text className="text-muted text-xs uppercase tracking-widest">Uyumlu Ritimler</Text>
          <Text className="text-foreground text-lg font-bold">Senin İçin Sporcular</Text>
        </View>

        <View className="gap-3">
          {SPORCULAR.map((s) => (
            <View key={s.id} className="bg-surface border border-border rounded-card p-4 flex-row gap-3">
              <View className="w-12 h-12 rounded-full bg-surface-2 border border-border items-center justify-center">
                <Text className="text-accent font-bold">{s.baslangic}</Text>
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-foreground font-semibold">{s.ad}</Text>
                <Text className="text-muted text-xs">{s.ozellik}</Text>
                <View className="flex-row gap-2 mt-1">
                  {s.etiketler.map((e) => (
                    <View key={e} className="bg-surface-2 rounded-full px-2 py-1">
                      <Text className="text-muted text-[10px]">{e}</Text>
                    </View>
                  ))}
                </View>
                <View className="flex-row gap-2 mt-2">
                  <Pressable className="bg-accent rounded-full px-3 py-1.5">
                    <Text className="text-accent-ink text-xs font-semibold">Eşleş</Text>
                  </Pressable>
                  <Pressable className="border border-border rounded-full px-3 py-1.5">
                    <Text className="text-foreground text-xs font-semibold">Profili Gör</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
