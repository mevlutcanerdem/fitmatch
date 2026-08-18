import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../lib/auth-context";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const MET_KOSU = 9.8;
const VARSAYILAN_KILO_KG = 70;

function haversineMetre(a: Location.LocationObjectCoords, b: Location.LocationObjectCoords) {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function sureFormatla(saniye: number) {
  const dk = Math.floor(saniye / 60)
    .toString()
    .padStart(2, "0");
  const sn = Math.floor(saniye % 60)
    .toString()
    .padStart(2, "0");
  return `${dk}:${sn}`;
}

type Durum = "hazir" | "izin_bekleniyor" | "kayitta" | "bitti";

export default function KosuKaydetScreen() {
  const { session } = useAuth();
  const [durum, setDurum] = useState<Durum>("hazir");
  const [mesafeM, setMesafeM] = useState(0);
  const [saniye, setSaniye] = useState(0);
  const [hata, setHata] = useState<string | null>(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);

  const sonKonum = useRef<Location.LocationObjectCoords | null>(null);
  const izlemeRef = useRef<Location.LocationSubscription | null>(null);
  const zamanlayiciRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      izlemeRef.current?.remove();
      if (zamanlayiciRef.current) clearInterval(zamanlayiciRef.current);
    };
  }, []);

  async function baslat() {
    setHata(null);
    setDurum("izin_bekleniyor");
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setHata("Konum izni verilmedi. Koşu kaydı için konum izni gerekli.");
      setDurum("hazir");
      return;
    }

    setMesafeM(0);
    setSaniye(0);
    sonKonum.current = null;

    izlemeRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5, timeInterval: 2000 },
      (konum) => {
        if (sonKonum.current) {
          setMesafeM((m) => m + haversineMetre(sonKonum.current!, konum.coords));
        }
        sonKonum.current = konum.coords;
      }
    );

    zamanlayiciRef.current = setInterval(() => setSaniye((s) => s + 1), 1000);
    setDurum("kayitta");
  }

  function durdur() {
    izlemeRef.current?.remove();
    if (zamanlayiciRef.current) clearInterval(zamanlayiciRef.current);
    setDurum("bitti");
  }

  const mesafeKm = mesafeM / 1000;
  const kalori = Math.round((MET_KOSU * VARSAYILAN_KILO_KG * saniye) / 3600);
  const tempoDk = mesafeKm > 0 ? saniye / 60 / mesafeKm : 0;

  async function kaydet() {
    if (!isSupabaseConfigured || !session) {
      router.replace("/(tabs)");
      return;
    }
    setKaydediliyor(true);
    await supabase.from("activities").insert({
      user_id: session.user.id,
      tur: "kosu",
      mesafe_km: Number(mesafeKm.toFixed(2)),
      sure_sn: saniye,
      kalori,
    });
    setKaydediliyor(false);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="flex-row items-center gap-3 px-5 pt-4">
        <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
          <Ionicons name="chevron-back" size={22} color="#eef2e4" />
        </Pressable>
        <Text className="text-foreground text-lg font-bold">Koşu Kaydet</Text>
      </View>

      <View className="flex-1 items-center justify-center gap-8 px-6">
        <Text className="text-foreground text-6xl font-bold tabular-nums">
          {sureFormatla(saniye)}
        </Text>

        <View className="flex-row gap-3 w-full">
          <View className="flex-1 bg-surface border border-border rounded-card p-4 items-center gap-1">
            <Text className="text-accent text-2xl font-bold">{mesafeKm.toFixed(2)}</Text>
            <Text className="text-muted text-xs">km</Text>
          </View>
          <View className="flex-1 bg-surface border border-border rounded-card p-4 items-center gap-1">
            <Text className="text-foreground text-2xl font-bold">
              {tempoDk > 0 ? tempoDk.toFixed(1) : "–"}
            </Text>
            <Text className="text-muted text-xs">dk/km</Text>
          </View>
          <View className="flex-1 bg-surface border border-border rounded-card p-4 items-center gap-1">
            <Text className="text-foreground text-2xl font-bold">{kalori}</Text>
            <Text className="text-muted text-xs">kcal</Text>
          </View>
        </View>

        {hata ? <Text className="text-red-400 text-xs text-center">{hata}</Text> : null}

        {durum === "hazir" || durum === "izin_bekleniyor" ? (
          <Pressable
            onPress={baslat}
            disabled={durum === "izin_bekleniyor"}
            className="bg-accent rounded-full py-4 px-10 items-center"
          >
            <Text className="text-accent-ink font-semibold text-base">
              {durum === "izin_bekleniyor" ? "İzin bekleniyor..." : "Başlat"}
            </Text>
          </Pressable>
        ) : durum === "kayitta" ? (
          <Pressable onPress={durdur} className="bg-surface border border-border rounded-full py-4 px-10 items-center">
            <Text className="text-foreground font-semibold text-base">Bitir</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={kaydet}
            disabled={kaydediliyor}
            className="bg-accent rounded-full py-4 px-10 items-center"
          >
            <Text className="text-accent-ink font-semibold text-base">
              {kaydediliyor ? "Kaydediliyor..." : "Kaydet"}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
