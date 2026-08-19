import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { isSupabaseConfigured, supabase } from "./supabase";

export type Profile = {
  id: string;
  ad: string;
  kilo_kg: number | null;
  boy_cm: number | null;
};

const VARSAYILAN_PROFIL: Profile = { id: "demo", ad: "Ece", kilo_kg: 70, boy_cm: null };

export function useProfile() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(
    isSupabaseConfigured ? null : VARSAYILAN_PROFIL
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const yenile = useCallback(async () => {
    if (!isSupabaseConfigured || !session) return;
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, ad, kilo_kg, boy_cm")
      .eq("id", session.user.id)
      .single();
    if (data) setProfile(data);
    setLoading(false);
  }, [session]);

  useEffect(() => {
    yenile();
  }, [yenile]);

  async function guncelle(alanlar: Partial<Pick<Profile, "ad" | "kilo_kg" | "boy_cm">>) {
    if (!isSupabaseConfigured || !session) return null;
    const { data, error } = await supabase
      .from("profiles")
      .update(alanlar)
      .eq("id", session.user.id)
      .select("id, ad, kilo_kg, boy_cm")
      .single();
    if (data) setProfile(data);
    return error?.message ?? null;
  }

  return { profile: profile ?? VARSAYILAN_PROFIL, loading, guncelle, yenile };
}
