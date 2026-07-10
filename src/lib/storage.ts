/* ============================================================
   Persistance locale (localStorage).
   Remplacée par Supabase en phase 2 : seul ce module change,
   le reste de l'application ne touche jamais au stockage.
   ============================================================ */
import type { StudentProfile } from "../core/bac-engine";

export interface AppState {
  profiles: StudentProfile[];
  activeId: string;
}

const KEY = "coachbac_v1";

export const store = {
  async load(): Promise<AppState | null> {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AppState) : null;
    } catch {
      return null;
    }
  },
  async save(s: AppState): Promise<void> {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* stockage indisponible : l'app fonctionne en mode éphémère */
    }
  },
};
