import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";
import { useAuth } from "../../lib/auth-context";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

type Sporcu = {
  id: string;
  ad: string;
  ilgi_alanlari: string[];
  takipEdiliyor: boolean;
};

const MOCK_SPORCULAR: Sporcu[] = [
  { id: "1", ad: "Duru A.", ilgi_alanlari: ["Sabah koşusu", "5-10km"], takipEdiliyor: false },
  { id: "2", ad: "Mert K.", ilgi_alanlari: ["Ağırlık antrenmanı", "Akşamları"], takipEdiliyor: false },
  { id: "3", ad: "Selin Y.", ilgi_alanlari: ["Hafta sonu turu", "40km+"], takipEdiliyor: false },
];

export default function KesfetScreen() {
  const { session } = useAuth();
  const canliVeri = isSupabaseConfigured && !!session;

  const [arama, setArama] = useState("");
  const [sporcular, setSporcular] = useState<Sporcu[]>(MOCK_SPORCULAR);
  const [yukleniyor, setYukleniyor] = useState(false);

  const veriYukle = useCallback(async () => {
    if (!canliVeri) return;
    setYukleniyor(true);

    const { data: profiller } = await supabase
      .from("profiles")
      .select("id, ad, ilgi_alanlari")
      .neq("id", session!.user.id)
      .limit(30);

    const { data: takipler } = await supabase
      .from("takipler")
      .select("takip_edilen_id")
      .eq("takip_eden_id", session!.user.id);

    const takipEdilenIdler = new Set((takipler ?? []).map((t) => t.takip_edilen_id));

    setSporcular(
      (profiller ?? []).map((p) => ({
        id: p.id,
        ad: p.ad,
        ilgi_alanlari: p.ilgi_alanlari ?? [],
        takipEdiliyor: takipEdilenIdler.has(p.id),
      }))
    );
    setYukleniyor(false);
  }, [canliVeri, session]);

  useFocusEffect(
    useCallback(() => {
      veriYukle();
    }, [veriYukle])
  );

  async function takibiDegistir(sporcuId: string, suAndaTakipte: boolean) {
    if (!session) return;
    if (suAndaTakipte) {
      await supabase
        .from("takipler")
        .delete()
        .eq("takip_eden_id", session.user.id)
        .eq("takip_edilen_id", sporcuId);
    } else {
      await supabase
        .from("takipler")
        .insert({ takip_eden_id: session.user.id, takip_edilen_id: sporcuId });
    }
    setSporcular((liste) =>
      liste.map((s) => (s.id === sporcuId ? { ...s, takipEdiliyor: !suAndaTakipte } : s))
    );
  }

  const filtrelenmis = sporcular.filter((s) =>
    s.ad.toLocaleLowerCase("tr").includes(arama.toLocaleLowerCase("tr"))
  );

  return (
    <SafeScreen className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-4" contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <View>
          <Text className="text-muted text-xs uppercase tracking-widest">Hareketini Bul</Text>
          <Text className="text-foreground text-2xl font-bold mt-1">Keşfet</Text>
          <Text className="text-muted text-sm mt-1">
            Sana iyi gelecek sporcuları keşfet ve takip et
          </Text>
        </View>

        <View className="flex-row items-center bg-surface border border-border rounded-full px-4 py-3 gap-2">
          <Ionicons name="search" size={18} color="#9aa389" />
          <TextInput
            value={arama}
            onChangeText={setArama}
            placeholder="Sporcu ara"
            placeholderTextColor="#9aa389"
            className="flex-1 text-foreground"
          />
        </View>

        <View className="gap-1">
          <Text className="text-muted text-xs uppercase tracking-widest">
            {canliVeri ? "Topluluk" : "Örnek"}
          </Text>
          <Text className="text-foreground text-lg font-bold">Senin İçin Sporcular</Text>
        </View>

        {!yukleniyor && filtrelenmis.length === 0 ? (
          <Text className="text-muted text-sm px-1">Henüz başka sporcu yok.</Text>
        ) : (
          <View className="gap-3">
            {filtrelenmis.map((s) => (
              <View key={s.id} className="bg-surface border border-border rounded-card p-4 flex-row gap-3">
                <View className="w-12 h-12 rounded-full bg-surface-2 border border-border items-center justify-center">
                  <Text className="text-accent font-bold">{s.ad.charAt(0)}</Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-foreground font-semibold">{s.ad}</Text>
                  {s.ilgi_alanlari.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-1">
                      {s.ilgi_alanlari.map((e) => (
                        <View key={e} className="bg-surface-2 rounded-full px-2 py-1">
                          <Text className="text-muted text-[10px]">{e}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <Pressable
                    onPress={() => canliVeri && takibiDegistir(s.id, s.takipEdiliyor)}
                    className={
                      s.takipEdiliyor
                        ? "border border-border rounded-full px-3 py-1.5 items-center mt-2 self-start"
                        : "bg-accent rounded-full px-3 py-1.5 items-center mt-2 self-start"
                    }
                  >
                    <Text
                      className={
                        s.takipEdiliyor
                          ? "text-foreground text-xs font-semibold"
                          : "text-accent-ink text-xs font-semibold"
                      }
                    >
                      {s.takipEdiliyor ? "Takip Ediliyor ✓" : "Takip Et"}
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
