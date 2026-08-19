import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";
import { useAuth } from "../../lib/auth-context";
import { supabase } from "../../lib/supabase";

type Grup = { id: string; isim: string; spor_turu: string; konum: string | null };
type Etkinlik = {
  id: string;
  baslik: string;
  konum: string | null;
  tarih: string;
  katilimci_sayisi: number;
  katiliyorum: boolean;
};

const SPOR_ETIKET: Record<string, string> = {
  kosu: "Koşu",
  fitness: "Fitness",
  bisiklet: "Bisiklet",
  yuruyus: "Yürüyüş",
  diger: "Diğer",
};

function tarihFormatla(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" }) +
    " · " +
    d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export default function GrupDetayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [grup, setGrup] = useState<Grup | null>(null);
  const [uyeSayisi, setUyeSayisi] = useState(0);
  const [uye, setUye] = useState(false);
  const [etkinlikler, setEtkinlikler] = useState<Etkinlik[]>([]);
  const [yenileniyor, setYenileniyor] = useState(false);

  const veriYukle = useCallback(async () => {
    if (!id) return;
    setYenileniyor(true);

    const { data: grupData } = await supabase
      .from("groups")
      .select("id, isim, spor_turu, konum")
      .eq("id", id)
      .single();
    if (grupData) setGrup(grupData);

    const { count } = await supabase
      .from("group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", id);
    setUyeSayisi(count ?? 0);

    if (session) {
      const { data: uyelik } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("group_id", id)
        .eq("user_id", session.user.id)
        .maybeSingle();
      setUye(!!uyelik);
    }

    const { data: etkinlikData } = await supabase
      .from("events")
      .select("id, baslik, konum, tarih")
      .eq("group_id", id)
      .order("tarih", { ascending: true });

    if (etkinlikData) {
      const zenginlestirilmis = await Promise.all(
        etkinlikData.map(async (e) => {
          const { count: katilimciSayisi } = await supabase
            .from("event_participants")
            .select("*", { count: "exact", head: true })
            .eq("event_id", e.id)
            .eq("durum", "gidiyorum");
          let katiliyorum = false;
          if (session) {
            const { data: kayit } = await supabase
              .from("event_participants")
              .select("event_id")
              .eq("event_id", e.id)
              .eq("user_id", session.user.id)
              .maybeSingle();
            katiliyorum = !!kayit;
          }
          return { ...e, katilimci_sayisi: katilimciSayisi ?? 0, katiliyorum };
        })
      );
      setEtkinlikler(zenginlestirilmis);
    }

    setYenileniyor(false);
  }, [id, session]);

  useFocusEffect(
    useCallback(() => {
      veriYukle();
    }, [veriYukle])
  );

  async function grupaKatil() {
    if (!session || !id) return;
    if (uye) {
      await supabase.from("group_members").delete().eq("group_id", id).eq("user_id", session.user.id);
    } else {
      await supabase.from("group_members").insert({ group_id: id, user_id: session.user.id });
    }
    veriYukle();
  }

  async function etkinligeKatil(etkinlikId: string, suAndaKatiliyor: boolean) {
    if (!session) return;
    if (suAndaKatiliyor) {
      await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", etkinlikId)
        .eq("user_id", session.user.id);
    } else {
      await supabase
        .from("event_participants")
        .insert({ event_id: etkinlikId, user_id: session.user.id, durum: "gidiyorum" });
    }
    veriYukle();
  }

  if (!grup) {
    return (
      <SafeScreen className="flex-1 bg-background">
        <View className="flex-row items-center gap-3 px-5 pt-4">
          <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
            <Ionicons name="chevron-back" size={22} color="#eef2e4" />
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5 pt-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={yenileniyor} onRefresh={veriYukle} tintColor="#c6ff3d" />}
      >
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="w-9 h-9 items-center justify-center">
            <Ionicons name="chevron-back" size={22} color="#eef2e4" />
          </Pressable>
          <Text className="text-foreground text-lg font-bold flex-1">{grup.isim}</Text>
        </View>

        <View className="bg-surface border border-border rounded-card p-4 gap-2">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="barbell-outline" size={14} color="#9aa389" />
              <Text className="text-muted text-xs">{SPOR_ETIKET[grup.spor_turu] ?? grup.spor_turu}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="people-outline" size={14} color="#9aa389" />
              <Text className="text-muted text-xs">{uyeSayisi} üye</Text>
            </View>
            {grup.konum ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="location-outline" size={14} color="#9aa389" />
                <Text className="text-muted text-xs">{grup.konum}</Text>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={grupaKatil}
            className={
              uye
                ? "border border-border rounded-full py-2.5 items-center mt-2"
                : "bg-accent rounded-full py-2.5 items-center mt-2"
            }
          >
            <Text className={uye ? "text-foreground text-xs font-semibold" : "text-accent-ink text-xs font-semibold"}>
              {uye ? "Üyesin · Ayrıl" : "Gruba Katıl"}
            </Text>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-foreground text-lg font-bold">Etkinlikler</Text>
          <Pressable
            onPress={() => router.push({ pathname: "/etkinlik-olustur", params: { groupId: grup.id } })}
            className="flex-row items-center gap-1 bg-surface border border-border rounded-full px-3 py-1.5"
          >
            <Ionicons name="add" size={14} color="#eef2e4" />
            <Text className="text-foreground text-xs font-semibold">Etkinlik Oluştur</Text>
          </Pressable>
        </View>

        {etkinlikler.length === 0 ? (
          <Text className="text-muted text-sm px-1">Henüz planlanmış etkinlik yok.</Text>
        ) : (
          <View className="gap-3">
            {etkinlikler.map((e) => (
              <View key={e.id} className="bg-surface border border-border rounded-card p-4 gap-2">
                <Text className="text-foreground font-semibold">{e.baslik}</Text>
                <Text className="text-muted text-xs">{tarihFormatla(e.tarih)}</Text>
                {e.konum ? <Text className="text-muted text-xs">{e.konum}</Text> : null}
                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-muted text-xs">{e.katilimci_sayisi} kişi gidiyor</Text>
                  <Pressable
                    onPress={() => etkinligeKatil(e.id, e.katiliyorum)}
                    className={
                      e.katiliyorum
                        ? "border border-border rounded-full px-3 py-1.5"
                        : "bg-accent rounded-full px-3 py-1.5"
                    }
                  >
                    <Text
                      className={
                        e.katiliyorum
                          ? "text-foreground text-xs font-semibold"
                          : "text-accent-ink text-xs font-semibold"
                      }
                    >
                      {e.katiliyorum ? "Gidiyorum ✓" : "Katıl"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
