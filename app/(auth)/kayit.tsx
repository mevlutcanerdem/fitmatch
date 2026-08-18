import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../lib/auth-context";

export default function KayitScreen() {
  const { signUp } = useAuth();
  const [ad, setAd] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function kayitOl() {
    if (!ad || !email || !sifre) {
      setHata("Tüm alanları doldur");
      return;
    }
    if (sifre.length < 6) {
      setHata("Şifre en az 6 karakter olmalı");
      return;
    }
    setHata(null);
    setYukleniyor(true);
    const mesaj = await signUp(ad.trim(), email.trim(), sifre);
    setYukleniyor(false);
    if (mesaj) setHata(mesaj);
    else router.replace("/(tabs)");
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6 gap-4"
      >
        <View className="mb-4">
          <Text className="text-accent text-3xl font-bold">Hesap Oluştur</Text>
          <Text className="text-muted text-sm mt-1">Spor arkadaşlarını bulmaya başla</Text>
        </View>

        <View className="gap-3">
          <TextInput
            value={ad}
            onChangeText={setAd}
            placeholder="Ad Soyad"
            placeholderTextColor="#9aa389"
            className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta"
            placeholderTextColor="#9aa389"
            autoCapitalize="none"
            keyboardType="email-address"
            className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
          />
          <TextInput
            value={sifre}
            onChangeText={setSifre}
            placeholder="Şifre (en az 6 karakter)"
            placeholderTextColor="#9aa389"
            secureTextEntry
            className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
          />
        </View>

        {hata ? <Text className="text-red-400 text-xs">{hata}</Text> : null}

        <Pressable
          onPress={kayitOl}
          disabled={yukleniyor}
          className="bg-accent rounded-full py-4 items-center mt-1"
        >
          <Text className="text-accent-ink font-semibold text-base">
            {yukleniyor ? "Oluşturuluyor..." : "Kayıt Ol"}
          </Text>
        </Pressable>

        <Link href="/(auth)/giris" asChild>
          <Pressable className="items-center py-3">
            <Text className="text-muted text-sm">
              Zaten hesabın var mı? <Text className="text-accent font-semibold">Giriş yap</Text>
            </Text>
          </Pressable>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
