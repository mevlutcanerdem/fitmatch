import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const GRUPLAR = [
  { id: "1", ad: "Kadıköy Koşu Ekibi", uye: 246, km: "184,8 km", etiket: "Bu hafta" },
  { id: "2", ad: "Pazar 5K", uye: 72, km: "72,4 km", etiket: "14 kişi katıldı" },
];

const LIDERLIK = [
  { id: "1", ad: "Zeynep T.", km: 41.2, sen: false },
  { id: "2", ad: "Ece", km: 37.8, sen: true },
  { id: "3", ad: "Barış K.", km: 33.1, sen: false },
  { id: "4", ad: "Ali D.", km: 28.6, sen: false },
  { id: "5", ad: "Nil S.", km: 24.9, sen: false },
];

export default function TopluluklarScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-xs uppercase tracking-widest">Birlikte Hareket Et</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">Topluluklarım</Text>
          </View>
          <Pressable className="w-10 h-10 rounded-full bg-accent items-center justify-center">
            <Ionicons name="add" size={22} color="#10140a" />
          </Pressable>
        </View>

        <View className="gap-3">
          {GRUPLAR.map((g) => (
            <View key={g.id} className="bg-surface border border-border rounded-card p-4 gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold text-base">{g.ad}</Text>
                <View className="bg-surface-2 rounded-full px-2 py-1">
                  <Text className="text-muted text-[10px]">{g.etiket}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-4">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="people-outline" size={14} color="#9aa389" />
                  <Text className="text-muted text-xs">{g.uye} üye</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Ionicons name="trending-up-outline" size={14} color="#9aa389" />
                  <Text className="text-muted text-xs">{g.km}</Text>
                </View>
              </View>
            </View>
          ))}

          <Pressable className="border border-dashed border-border rounded-card p-4 items-center">
            <Text className="text-accent text-sm font-semibold">+ Grup Oluştur</Text>
          </Pressable>
        </View>

        <View className="gap-1 mt-2">
          <Text className="text-muted text-xs uppercase tracking-widest">Kadıköy Koşu Ekibi</Text>
          <Text className="text-foreground text-lg font-bold">Haftalık Liderlik Tablosu</Text>
        </View>

        <View className="bg-surface border border-border rounded-card overflow-hidden">
          {LIDERLIK.map((k, i) => (
            <View
              key={k.id}
              className={
                "flex-row items-center gap-3 px-4 py-3" +
                (i !== LIDERLIK.length - 1 ? " border-b border-border" : "") +
                (k.sen ? " bg-surface-2" : "")
              }
            >
              <Text className={i < 3 ? "text-accent font-bold w-5" : "text-muted font-bold w-5"}>
                {i + 1}
              </Text>
              <View className="w-9 h-9 rounded-full bg-surface-2 border border-border items-center justify-center">
                <Text className="text-accent text-xs font-bold">{k.ad.charAt(0)}</Text>
              </View>
              <Text className={k.sen ? "text-foreground font-semibold flex-1" : "text-foreground flex-1"}>
                {k.sen ? `${k.ad} (sen)` : k.ad}
              </Text>
              <Text className="text-foreground font-semibold">{k.km.toFixed(1)} km</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
