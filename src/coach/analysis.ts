/* ============================================================
   COACH — Analyse par règles (v1). Priorisation :
   gain potentiel = coefficient × (objectif − note).
   En phase 3, l'API Claude s'appuie sur ces mêmes données.
   ============================================================ */
import type { StudentProfile, Results, SubjectRow } from "../core/bac-engine";

export interface WeakSubject extends SubjectRow { gain: number }
export interface Advice extends WeakSubject { tips: string[] }
export interface Allocation { id: string; nom: string; heures: number }
export interface Analysis {
  weak: WeakSubject[];
  strong: SubjectRow[];
  missing: SubjectRow[];
  advice: Advice[];
  alloc: Allocation[];
  target: number;
}

export const CONSEILS: Record<string, string[]> = {
  philo: ["Travaille 3 notions par semaine avec une fiche définition + 2 références.", "Rédige une dissertation complète tous les 15 jours en temps limité (4 h)."],
  go: ["Entraîne-toi à voix haute 10 min/jour, en te chronométrant (5 min de présentation).", "Enregistre-toi et corrige débit, posture et transitions."],
  fr_e: ["Refais les annales de commentaire et dissertation en conditions réelles.", "Constitue une banque de citations par objet d'étude."],
  fr_o: ["Relis tes textes à l'oral avec la grille officielle : lecture, explication, grammaire, entretien."],
  hg: ["Apprends les repères chronologiques et spatiaux avec des cartes mentales.", "Rédige un croquis de géographie par semaine."],
  lva: ["15 min/jour d'écoute active (podcast, série en VO) + 10 mots nouveaux.", "Rédige un essai argumenté de 200 mots par semaine."],
  lvb: ["Alterne compréhension orale et expression écrite courte chaque semaine."],
  es: ["Refais les exercices types (climat, énergie, son) et vérifie les ordres de grandeur."],
  maths: ["Refais les automatismes : 20 min de calcul par jour sans calculatrice.", "Traite un sujet d'annale par week-end, corrigé à l'appui."],
  eps: ["Régularité avant tout : la note CC récompense la progression sur l'année."],
  emc: ["Prépare tes argumentaires de débat avec des exemples d'actualité."],
  spe: ["Les spécialités pèsent 16 coefficients chacune : une annale complète par semaine, chronométrée.", "Fais des fiches d'erreurs : chaque exercice raté devient une carte de révision."],
};

export function coachAnalysis(p: StudentProfile, res: Results): Analysis {
  const target = res.target;
  const noted = res.rows.filter((r) => r.note != null);
  const weak: WeakSubject[] = noted
    .filter((r) => (r.note as number) < target)
    .map((r) => ({ ...r, gain: (target - (r.note as number)) * r.coef }))
    .sort((a, b) => b.gain - a.gain);
  const strong = noted
    .filter((r) => (r.note as number) >= target + 2)
    .sort((a, b) => b.coef - a.coef);
  const missing = res.rows.filter((r) => r.note == null);
  const advice: Advice[] = weak.slice(0, 3).map((w) => ({
    ...w,
    tips: CONSEILS[w.id] || (w.id.startsWith("spe") ? CONSEILS.spe : ["Reprends les bases du programme, puis annales progressives."]),
  }));
  const H = p.heuresSemaine || 8;
  const totalGain = weak.reduce((a, w) => a + w.gain, 0) || 1;
  const alloc: Allocation[] = weak.slice(0, 5).map((w) => ({
    id: w.id,
    nom: w.nom,
    heures: Math.max(1, Math.round((w.gain / totalGain) * H)),
  }));
  return { weak, strong, missing, advice, alloc, target };
}

export const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export interface DayPlan { jour: string; sessions: string[] }

export function buildPlanning(alloc: Allocation[], heuresSemaine: number): DayPlan[] {
  const slots: string[] = [];
  alloc.forEach((a) => { for (let i = 0; i < a.heures; i++) slots.push(a.nom); });
  while (slots.length < Math.min(heuresSemaine, 14)) slots.push("Révision libre / fiches");
  const week: DayPlan[] = JOURS.map((j) => ({ jour: j, sessions: [] }));
  const capacity = [1, 1, 2, 1, 1, 3, 3];
  let idx = 0;
  for (let pass = 0; pass < 3; pass++) {
    for (let d = 0; d < 7 && idx < slots.length; d++) {
      if (week[d].sessions.length < capacity[d]) week[d].sessions.push(slots[idx++]);
    }
  }
  return week;
}
