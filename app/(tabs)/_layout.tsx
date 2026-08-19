import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { View } from "react-native";
import { useAuth } from "../../lib/auth-context";
import { isSupabaseConfigured } from "../../lib/supabase";

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View
      className={
        focused
          ? "w-11 h-11 rounded-full bg-accent items-center justify-center"
          : "w-11 h-11 rounded-full items-center justify-center"
      }
    >
      <Ionicons name={name} size={22} color={focused ? "#10140a" : "#9aa389"} />
    </View>
  );
}

export default function TabsLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return <View className="flex-1 bg-background" />;
  }

  if (isSupabaseConfigured && !session) {
    return <Redirect href="/(auth)/giris" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#161911",
          borderTopWidth: 1,
          borderTopColor: "#2a2f1e",
          height: 68,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Bugün",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="kesfet"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "search" : "search-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="topluluklar"
        options={{
          title: "Topluluklar",
          tabBarIcon: ({ focused }) => (
            <TabIcon name={focused ? "people" : "people-outline"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
