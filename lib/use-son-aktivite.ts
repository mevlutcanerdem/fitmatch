import { useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { isSupabaseConfigured, supabase } from "./supabase";

export type Aktivite = {
  tur: string;
  mesafe_km: number;
  sure_sn: number;
  kalori: number | null;
  tarih: string;
};

export function useSonAktivite() {
  const { session } = useAuth();
  const [aktivite, setAktivite] = useState<Aktivite | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !session) return;
    supabase
      .from("activities")
      .select("tur, mesafe_km, sure_sn, kalori, tarih")
      .eq("user_id", session.user.id)
      .order("tarih", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setAktivite(data));
  }, [session]);

  return aktivite;
}
