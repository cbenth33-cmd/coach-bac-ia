import type { LucideIcon } from "lucide-react";
import {
  Sparkles, CalendarPlus, FileText, Mic, Bot, Bell, CheckCircle2,
  MessageSquare, TrendingUp, FolderKanban,
} from "lucide-react";

/* ================================================================
   DONNÉES DE DÉMONSTRATION du tableau de bord.
   Tout est fictif et centralisé ici pour être branché plus tard
   sur de vraies sources (Supabase, APIs météo, analytics…).
   ================================================================ */

/* ---------- statistiques (tuiles) ---------- */
export interface Stat {
  id: string;
  label: string;
  value: string;
  delta: string;
  /** true = évolution positive (flèche haute) */
  up: boolean;
  /** mini-série pour le sparkline (7 derniers jours) */
  spark: number[];
}

export const STATS: Stat[] = [
  { id: "sessions", label: "Sessions IA cette semaine", value: "128", delta: "+18 %", up: true, spark: [12, 15, 11, 18, 22, 24, 26] },
  { id: "tasks", label: "Tâches automatisées", value: "342", delta: "+9 %", up: true, spark: [38, 42, 40, 51, 47, 58, 66] },
  { id: "hours", label: "Heures économisées", value: "31 h", delta: "+4 h", up: true, spark: [3, 4, 3.5, 4.5, 5, 5.5, 5.5] },
  { id: "projects", label: "Projets actifs", value: "7", delta: "stable", up: true, spark: [6, 6, 7, 7, 7, 7, 7] },
];

/* ---------- activité (graphique en aires) ---------- */
export interface ActivityPoint {
  day: string;
  interactions: number;
}

export const ACTIVITY: ActivityPoint[] = [
  { day: "Lun", interactions: 42 },
  { day: "Mar", interactions: 58 },
  { day: "Mer", interactions: 47 },
  { day: "Jeu", interactions: 71 },
  { day: "Ven", interactions: 64 },
  { day: "Sam", interactions: 89 },
  { day: "Dim", interactions: 76 },
];

/* ---------- notifications ---------- */
export interface Notification {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    icon: Bot,
    title: "Automatisations IA",
    body: "Le workflow « Tri des emails » a traité 47 messages cette nuit.",
    time: "il y a 12 min",
    unread: true,
  },
  {
    id: "n2",
    icon: TrendingUp,
    title: "Marketing & Réseaux",
    body: "Votre dernier post dépasse les 2 400 impressions (+62 %).",
    time: "il y a 1 h",
    unread: true,
  },
  {
    id: "n3",
    icon: CheckCircle2,
    title: "Documents Administratifs",
    body: "Dossier CAF : toutes les pièces sont complètes et archivées.",
    time: "il y a 3 h",
    unread: false,
  },
  {
    id: "n4",
    icon: MessageSquare,
    title: "Coach Bac IA",
    body: "Nouvelle session de révision planifiée demain à 17 h 30.",
    time: "hier",
    unread: false,
  },
];

/* ---------- projets récents ---------- */
export interface Project {
  id: string;
  name: string;
  agent: string;
  progress: number; // 0..100
  color: string;
}

export const PROJECTS: Project[] = [
  { id: "p1", name: "Lancement gamme Punch Passion", agent: "DIYIAH Punch", progress: 72, color: "#ea580c" },
  { id: "p2", name: "Plan de révision — Bac 2027", agent: "Coach Bac IA", progress: 45, color: "#7c3aed" },
  { id: "p3", name: "Refonte identité CréArt's", agent: "DIYIAH CréArt's", progress: 88, color: "#db2777" },
  { id: "p4", name: "Dossier RQTH — renouvellement", agent: "Emploi & RQTH", progress: 30, color: "#2563eb" },
];

/* ---------- raccourcis rapides ---------- */
export interface Shortcut {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const SHORTCUTS: Shortcut[] = [
  { id: "s1", label: "Nouvelle session", icon: Sparkles },
  { id: "s2", label: "Planifier", icon: CalendarPlus },
  { id: "s3", label: "Rédiger", icon: FileText },
  { id: "s4", label: "Dicter", icon: Mic },
];

/* ---------- météo (fictive) ---------- */
export const WEATHER = {
  city: "Cayenne, Guyane",
  temp: 29,
  feels: 33,
  condition: "Éclaircies tropicales",
  humidity: 78,
  wind: 14, // km/h
  high: 31,
  low: 24,
};

/* ---------- calendrier : jours du mois portant un événement ---------- */
export const EVENT_DAYS = [3, 9, 14, 17, 21, 26];

export const NOTIF_ICON = Bell;
export const PROJECTS_ICON = FolderKanban;
