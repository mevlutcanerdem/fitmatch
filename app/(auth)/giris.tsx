import { Link, router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";
import { useAuth } from "../../lib/auth-context";

export default function GirisScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function girisYap() {
    if (!email || !sifre) {
      setHata("E-posta ve şifre gerekli");
      return;
    }
    setHata(null);
    setYukleniyor(true);
    const mesaj = await signIn(email.trim(), sifre);
    setYukleniyor(false);
    if (mesaj) setHata(mesaj);
    else router.replace("/(tabs)");
  }

  return (
    <SafeScreen className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center px-6 gap-4"
      >
        <View className="mb-4">
          <Text className="text-accent text-3xl font-bold">FitMatch</Text>
          <Text className="text-muted text-sm mt-1">Hareket etmeye devam et</Text>
        </View>

        <View className="gap-3">
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
            placeholder="Şifre"
            placeholderTextColor="#9aa389"
            secureTextEntry
            className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-foreground"
          />
        </View>

        {hata ? <Text className="text-red-400 text-xs">{hata}</Text> : null}

        <Pressable
          onPress={girisYap}
          disabled={yukleniyor}
          className="bg-accent rounded-full py-4 items-center mt-1"
        >
          <Text className="text-accent-ink font-semibold text-base">
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Text>
        </Pressable>

        <Link href="/(auth)/kayit" asChild>
          <Pressable className="items-center py-3">
            <Text className="text-muted text-sm">
              Hesabın yok mu? <Text className="text-accent font-semibold">Kayıt ol</Text>
            </Text>
          </Pressable>
        </Link>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
