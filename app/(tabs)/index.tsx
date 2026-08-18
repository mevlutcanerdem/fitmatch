import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STEP_GOAL = 10000;
const STEPS_TODAY = 7842;
const REMAINING = STEP_GOAL - STEPS_TODAY;
const PROGRESS = Math.round((STEPS_TODAY / STEP_GOAL) * 100);

const MET = { kosu: 9.8, yuruyus: 3.5, bisiklet: 7.5 };
const WEIGHT_KG = 70;
const RUN_MINUTES = 32;
const CALORIES = Math.round((MET.kosu * WEIGHT_KG * RUN_MINUTES) / 60);

export default function BugunScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-xs uppercase tracking-widest">Bugünkü Hareket</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">Merhaba, Ece</Text>
          </View>
          <Pressable
            onPress={() => router.push("/profil")}
            className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
          >
            <Ionicons name="person-outline" size={18} color="#eef2e4" />
          </Pressable>
        </View>

        <View className="bg-surface border border-border rounded-card p-6 gap-1">
          <Text className="text-accent text-4xl font-bold">
            {STEPS_TODAY.toLocaleString("tr-TR")}
          </Text>
          <Text className="text-muted text-xs">adım · %{PROGRESS} tamamlandı</Text>
          <View className="h-2 bg-surface-2 rounded-full mt-3 overflow-hidden">
            <View
              className="h-2 bg-accent rounded-full"
              style={{ width: `${PROGRESS}%` }}
            />
          </View>
        </View>

        <View className="bg-surface-2 border border-border rounded-card p-4">
          <Text className="text-foreground text-sm">
            Bugünkü hedefe {REMAINING.toLocaleString("tr-TR")} adım kaldı
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 bg-surface border border-border rounded-card p-4 gap-1">
            <Text className="text-muted text-xs">Son Koşu</Text>
            <Text className="text-foreground text-lg font-bold">{RUN_MINUTES} dk</Text>
            <Text className="text-muted text-xs">5,2 km · 6:09/km</Text>
          </View>
          <View className="flex-1 bg-surface border border-border rounded-card p-4 gap-1">
            <Text className="text-muted text-xs">Yakılan Kalori</Text>
            <Text className="text-accent text-lg font-bold">{CALORIES} kcal</Text>
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
    </SafeAreaView>
  );
}
