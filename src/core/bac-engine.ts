/* ============================================================
   CORE — Moteur de calcul officiel du baccalauréat (réforme)
   100 coefficients : 60 épreuves finales + 40 contrôle continu.
   Candidats individuels : CC remplacé par des évaluations
   ponctuelles aux mêmes coefficients.
   ============================================================ */

export type Voie = "generale" | "techno";
export type Statut = "scolaire" | "individuel";

export interface QuizResult { subj: string; score: number; total: number; date: number }

export interface StudentProfile {
  id: string;
  prenom: string;
  academie: string;
  session: number;
  statut: Statut;
  voie: Voie;
  serie?: string;
  spe1?: string;
  spe2?: string;
  spe3?: string;
  lva?: string;
  lvb?: string;
  objectif: number;
  heuresSemaine: number;
  notes: Record<string, number | null>;
  rectorat: Record<string, boolean>;
  quizHistory: QuizResult[];
}

export interface Subject { id: string; nom: string; coef: number; type: "EF" | "CC" }
export interface SubjectRow extends Subject { note: number | null }

export interface MentionInfo { label: string; short: string; color: string }

export interface Results {
  rows: SubjectRow[];
  moyenne: number | null;
  mention: MentionInfo | null;
  pointsAcquis: number;
  coefDone: number;
  coefTotal: number;
  totalProjete: number | null;
  ptsCible: number;
  ptsManquants: number;
  coefRestants: number;
  target: number;
}

const OK = "#1F9D6C", KO = "#E85D4A", NEUTRE = "#232B4A";

export function buildSubjects(p: StudentProfile): Subject[] {
  const g = p.voie === "generale";
  const EF: Subject[] = [
    { id: "fr_e", nom: "Français écrit (1re)", coef: 5, type: "EF" },
    { id: "fr_o", nom: "Français oral (1re)", coef: 5, type: "EF" },
    { id: "philo", nom: "Philosophie", coef: g ? 8 : 4, type: "EF" },
    { id: "go", nom: "Grand oral", coef: g ? 10 : 14, type: "EF" },
    { id: "spe1", nom: p.spe1 || "Spécialité 1", coef: 16, type: "EF" },
    { id: "spe2", nom: p.spe2 || "Spécialité 2", coef: 16, type: "EF" },
  ];
  const CC: Subject[] = [
    { id: "hg", nom: "Histoire-Géographie", coef: 6, type: "CC" },
    { id: "lva", nom: `LVA ${p.lva || "Anglais"}`, coef: 6, type: "CC" },
    { id: "lvb", nom: `LVB ${p.lvb || "Espagnol"}`, coef: 6, type: "CC" },
    g
      ? { id: "es", nom: "Enseignement scientifique", coef: 6, type: "CC" }
      : { id: "maths", nom: "Mathématiques", coef: 6, type: "CC" },
    { id: "eps", nom: "EPS", coef: 6, type: "CC" },
    { id: "emc", nom: "EMC", coef: 2, type: "CC" },
    { id: "spe3", nom: `${p.spe3 || "Spécialité abandonnée"} (1re)`, coef: 8, type: "CC" },
  ];
  return [...EF, ...CC];
}

export function mention(m: number | null): MentionInfo | null {
  if (m == null) return null;
  if (m >= 18) return { label: "Très bien avec félicitations*", short: "TB ★", color: OK };
  if (m >= 16) return { label: "Mention Très bien", short: "TB", color: OK };
  if (m >= 14) return { label: "Mention Bien", short: "B", color: OK };
  if (m >= 12) return { label: "Mention Assez bien", short: "AB", color: OK };
  if (m >= 10) return { label: "Admis", short: "Admis", color: NEUTRE };
  if (m >= 8) return { label: "Oral de rattrapage", short: "Rattrapage", color: KO };
  return { label: "Non admis", short: "Refusé", color: KO };
}

export const OBJECTIFS = [
  { id: 10, label: "Décrocher le bac", seuil: 10 },
  { id: 12, label: "Mention Assez bien", seuil: 12 },
  { id: 14, label: "Mention Bien", seuil: 14 },
  { id: 16, label: "Mention Très bien", seuil: 16 },
];

export function computeResults(p: StudentProfile): Results {
  const subjects = buildSubjects(p);
  let pts = 0, coefDone = 0, coefTotal = 0;
  const rows: SubjectRow[] = subjects.map((s) => {
    const raw = p.notes?.[s.id];
    coefTotal += s.coef;
    const filled = raw !== undefined && raw !== null && (raw as unknown) !== "";
    const note = filled ? Number(raw) : null;
    if (note != null) { pts += note * s.coef; coefDone += s.coef; }
    return { ...s, note };
  });
  const moyenne = coefDone > 0 ? pts / coefDone : null;
  const totalProj = moyenne != null ? pts + moyenne * (coefTotal - coefDone) : null;
  const target = p.objectif || 12;
  const ptsCible = target * coefTotal;
  return {
    rows,
    moyenne,
    mention: mention(moyenne),
    pointsAcquis: Math.round(pts * 10) / 10,
    coefDone,
    coefTotal,
    totalProjete: totalProj != null ? Math.round(totalProj) : null,
    ptsCible,
    ptsManquants: Math.max(0, Math.round((ptsCible - pts) * 10) / 10),
    coefRestants: coefTotal - coefDone,
    target,
  };
}
