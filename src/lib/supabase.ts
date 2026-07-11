/* ============================================================
   Client Supabase — comptes utilisateurs et synchronisation.
   Si les variables d'environnement manquent, l'app fonctionne
   en mode local uniquement (localStorage), sans planter.
   ============================================================ */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;

import type { AppState } from "./storage";

/** Charge l'état sauvegardé dans le cloud pour l'utilisateur connecté. */
export async function cloudLoad(userId: string): Promise<AppState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("account_state")
    .select("state")
    .eq("owner", userId)
    .maybeSingle();
  if (error) return null;
  return (data?.state as AppState) ?? null;
}

/** Sauvegarde l'état dans le cloud (dernière écriture gagnante). */
export async function cloudSave(userId: string, state: AppState): Promise<void> {
  if (!supabase) return;
  await supabase
    .from("account_state")
    .upsert({ owner: userId, state, updated_at: new Date().toISOString() });
}
