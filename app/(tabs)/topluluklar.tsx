import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";
import { useAuth } from "../../lib/auth-context";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

const MOCK_GRUPLAR = [
  { id: "1", ad: "Kadıköy Koşu Ekibi", uye: 246, km: "184,8 km", etiket: "Bu hafta" },
  { id: "2", ad: "Pazar 5K", uye: 72, km: "72,4 km", etiket: "14 kişi katıldı" },
];

const MOCK_LIDERLIK = [
  { id: "1", ad: "Zeynep T.", km: 41.2, sen: false },
  { id: "2", ad: "Ece", km: 37.8, sen: true },
  { id: "3", ad: "Barış K.", km: 33.1, sen: false },
  { id: "4", ad: "Ali D.", km: 28.6, sen: false },
  { id: "5", ad: "Nil S.", km: 24.9, sen: false },
];

type Grup = { id: string; ad: string; uye: number; km: string; etiket: string };
type Liderlik = { id: string; ad: string; km: number; sen: boolean };

export default function TopluluklarScreen() {
  const { session } = useAuth();
  const canliVeri = isSupabaseConfigured && !!session;

  const [gruplar, setGruplar] = useState<Grup[]>(MOCK_GRUPLAR);
  const [liderlikBasligi, setLiderlikBasligi] = useState("Kadıköy Koşu Ekibi");
  const [liderlik, setLiderlik] = useState<Liderlik[]>(MOCK_LIDERLIK);
  const [yenileniyor, setYenileniyor] = useState(false);

  async function veriYukle() {
    if (!canliVeri) return;
    setYenileniyor(true);

    const { data: uyelikler } = await supabase
      .from("group_members")
      .select("groups(id, isim)")
      .eq("user_id", session!.user.id);

    const kullaniciGruplari = (uyelikler ?? [])
      .map((u: any) => u.groups)
      .filter(Boolean) as { id: string; isim: string }[];

    if (kullaniciGruplari.length > 0) {
      const gruplarVerisi: Grup[] = await Promise.all(
        kullaniciGruplari.map(async (g) => {
          const { count } = await supabase
            .from("group_members")
            .select("*", { count: "exact", head: true })
            .eq("group_id", g.id);
          const { data: aktiviteler } = await supabase
            .from("activities")
            .select("mesafe_km")
            .eq("group_id", g.id);
          const toplamKm = (aktiviteler ?? []).reduce((t, a) => t + Number(a.mesafe_km), 0);
          return {
            id: g.id,
            ad: g.isim,
            uye: count ?? 0,
            km: `${toplamKm.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`,
            etiket: "Toplam",
          };
        })
      );
      setGruplar(gruplarVerisi);

      const ilkGrup = kullaniciGruplari[0];
      setLiderlikBasligi(ilkGrup.isim);

      const haftaBasi = new Date();
      haftaBasi.setDate(haftaBasi.getDate() - 7);

      const { data: aktiviteler } = await supabase
        .from("activities")
        .select("user_id, mesafe_km, profiles(ad)")
        .eq("group_id", ilkGrup.id)
        .gte("tarih", haftaBasi.toISOString());

      const toplamlar = new Map<string, { ad: string; km: number }>();
      for (const a of aktiviteler ?? []) {
        const mevcut = toplamlar.get(a.user_id) ?? { ad: (a as any).profiles?.ad ?? "Sporcu", km: 0 };
        mevcut.km += Number(a.mesafe_km);
        toplamlar.set(a.user_id, mevcut);
      }
      const siraliListe: Liderlik[] = Array.from(toplamlar.entries())
        .map(([id, v]) => ({ id, ad: v.ad, km: v.km, sen: id === session!.user.id }))
        .sort((a, b) => b.km - a.km);
      setLiderlik(siraliListe);
    } else {
      setGruplar([]);
      setLiderlik([]);
    }

    setYenileniyor(false);
  }

  useEffect(() => {
    veriYukle();
  }, [session?.user.id]);

  return (
    <SafeScreen className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        refreshControl={
          canliVeri ? (
            <RefreshControl refreshing={yenileniyor} onRefresh={veriYukle} tintColor="#c6ff3d" />
          ) : undefined
        }
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-muted text-xs uppercase tracking-widest">Birlikte Hareket Et</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">Topluluklarım</Text>
          </View>
          <Pressable
            onPress={() => router.push("/grup-olustur")}
            className="w-10 h-10 rounded-full bg-accent items-center justify-center"
          >
            <Ionicons name="add" size={22} color="#10140a" />
          </Pressable>
        </View>

        <View className="gap-3">
          {gruplar.map((g) => (
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

          <Pressable
            onPress={() => router.push("/grup-olustur")}
            className="border border-dashed border-border rounded-card p-4 items-center"
          >
            <Text className="text-accent text-sm font-semibold">+ Grup Oluştur</Text>
          </Pressable>
        </View>

        {liderlik.length > 0 && (
          <>
            <View className="gap-1 mt-2">
              <Text className="text-muted text-xs uppercase tracking-widest">{liderlikBasligi}</Text>
              <Text className="text-foreground text-lg font-bold">Haftalık Liderlik Tablosu</Text>
            </View>

            <View className="bg-surface border border-border rounded-card overflow-hidden">
              {liderlik.map((k, i) => (
                <View
                  key={k.id}
                  className={
                    "flex-row items-center gap-3 px-4 py-3" +
                    (i !== liderlik.length - 1 ? " border-b border-border" : "") +
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
          </>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
