import "./global.css";
import { StatusBar } from "expo-status-bar";
import { Pressable, SafeAreaView, Text, View } from "react-native";

const STEP_GOAL = 10000;
const STEPS_TODAY = 7842;
const REMAINING = STEP_GOAL - STEPS_TODAY;
const PROGRESS = Math.round((STEPS_TODAY / STEP_GOAL) * 100);

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-4 px-5 pt-4">
        <Text className="text-muted text-xs uppercase tracking-widest">
          Bugünkü Hareket
        </Text>

        <View className="bg-surface border border-border rounded-card p-6 gap-1">
          <Text className="text-accent text-4xl font-bold">
            {STEPS_TODAY.toLocaleString("tr-TR")}
          </Text>
          <Text className="text-muted text-xs">
            adım · %{PROGRESS} tamamlandı
          </Text>
        </View>

        <View className="bg-surface-2 border border-border rounded-card p-4">
          <Text className="text-foreground text-sm">
            Bugünkü hedefe {REMAINING.toLocaleString("tr-TR")} adım kaldı
          </Text>
        </View>

        <Pressable className="bg-accent rounded-full py-4 items-center mt-auto mb-6">
          <Text className="text-accent-ink font-semibold text-base">
            Aktiviteyi Başlat
          </Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
