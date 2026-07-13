import type { LucideIcon } from "lucide-react";
import {
  GraduationCap, Dog, Headset, Palette, CupSoda, Accessibility,
  Landmark, BookOpen, Megaphone, PiggyBank, FileStack, Workflow, Radar,
} from "lucide-react";

/* ================================================================
   AGENTS IA — annuaire du Centre de Commandement.
   Chaque agent porte son identité visuelle : portrait photographique,
   couleur dédiée, icône, statut et description.

   PORTRAITS : photos professionnelles libres de droits, embarquées
   dans `src/assets/agents/` (chargement garanti, y compris hors-ligne).
   Pour remplacer un portrait, écrasez simplement le fichier .jpg du
   même nom — aucune modification de code nécessaire.
   ================================================================ */

import portraitCoachBac from "../../assets/agents/coach-bac.jpg";
import portraitUlysse from "../../assets/agents/ulysse-canin.jpg";
import portraitAssistante from "../../assets/agents/assistante-virtuelle.jpg";
import portraitCrearts from "../../assets/agents/diyiah-crearts.jpg";
import portraitPunch from "../../assets/agents/diyiah-punch.jpg";
import portraitEmploi from "../../assets/agents/emploi-rqth.jpg";
import portraitGuyane from "../../assets/agents/guyane-dev.jpg";
import portraitEtudes from "../../assets/agents/etudes-formations.jpg";
import portraitMarketing from "../../assets/agents/marketing-social.jpg";
import portraitFinances from "../../assets/agents/finances.jpg";
import portraitDocuments from "../../assets/agents/documents-admin.jpg";
import portraitAutomatisations from "../../assets/agents/automatisations.jpg";
import portraitVeille from "../../assets/agents/veille-recherche.jpg";

export type AgentStatus = "online" | "busy" | "standby";

export interface Agent {
  /** Identifiant stable (slug) */
  id: string;
  /** Nom affiché sur la carte */
  name: string;
  /** Domaine court (sur-titre coloré) */
  domain: string;
  /** Description en une phrase */
  description: string;
  /** Icône lucide dédiée */
  icon: LucideIcon;
  /** Couleur dédiée + dégradé d'identité */
  accent: string;
  gradient: [string, string];
  /** Portrait photographique embarqué */
  portrait: string;
  status: AgentStatus;
  /** Route interne ouverte par « Ouvrir » (hash) ; sinon écran de lancement */
  route?: string;
  /** Mots-clés supplémentaires pour la recherche intelligente */
  keywords: string[];
}

export const AGENTS: Agent[] = [
  {
    id: "coach-bac",
    name: "Coach Bac IA",
    domain: "Éducation · Baccalauréat",
    description:
      "Enseignante virtuelle bienveillante : calcul des points, plan de révision et coaching jusqu'au jour J.",
    icon: GraduationCap,
    accent: "#7c3aed",
    gradient: ["#312e81", "#7c3aed"],
    portrait: portraitCoachBac,
    status: "online",
    route: "#/coach-bac",
    keywords: ["bac", "révisions", "lycée", "examens", "mentions", "école"],
  },
  {
    id: "ulysse-canin",
    name: "Ulysse — Éducation Canine",
    domain: "Bien-être animal",
    description:
      "Éducateur canin professionnel : éducation positive pour rottweilers, bergers allemands et compagnie.",
    icon: Dog,
    accent: "#d97706",
    gradient: ["#7c2d12", "#d97706"],
    portrait: portraitUlysse,
    status: "online",
    keywords: ["chien", "dressage", "rottweiler", "berger allemand", "animaux"],
  },
  {
    id: "assistante-virtuelle",
    name: "Assistante Virtuelle IA",
    domain: "Organisation & secrétariat",
    description:
      "Assistante administrative dédiée : agenda, courriers, prise de rendez-vous et suivi de vos priorités.",
    icon: Headset,
    accent: "#0d9488",
    gradient: ["#0f766e", "#14b8a6"],
    portrait: portraitAssistante,
    status: "busy",
    keywords: ["agenda", "emails", "secrétariat", "rendez-vous", "organisation"],
  },
  {
    id: "diyiah-crearts",
    name: "DIYIAH CréArt's",
    domain: "Création artistique",
    description:
      "Artiste plasticienne en atelier : idées créatives, DIY, identité visuelle et accompagnement de vos projets d'art.",
    icon: Palette,
    accent: "#db2777",
    gradient: ["#9d174d", "#ec4899"],
    portrait: portraitCrearts,
    status: "online",
    keywords: ["art", "diy", "créativité", "atelier", "design", "loisirs créatifs"],
  },
  {
    id: "diyiah-punch",
    name: "DIYIAH Punch",
    domain: "Saveurs tropicales premium",
    description:
      "Entrepreneure épicurienne : recettes de punchs artisanaux, image de marque et développement de la gamme.",
    icon: CupSoda,
    accent: "#ea580c",
    gradient: ["#b45309", "#f59e0b"],
    portrait: portraitPunch,
    status: "standby",
    keywords: ["punch", "cocktails", "tropical", "artisanat", "marque", "guyane"],
  },
  {
    id: "emploi-rqth",
    name: "Emploi & RQTH",
    domain: "Insertion professionnelle",
    description:
      "Conseiller en insertion : candidatures, droits RQTH, aménagements de poste et stratégie de retour à l'emploi.",
    icon: Accessibility,
    accent: "#2563eb",
    gradient: ["#1e3a8a", "#3b82f6"],
    portrait: portraitEmploi,
    status: "online",
    keywords: ["emploi", "handicap", "rqth", "cv", "candidature", "droits"],
  },
  {
    id: "guyane-dev",
    name: "Guyane Développement",
    domain: "Économie territoriale",
    description:
      "Expert du développement économique guyanais : aides locales, réseaux d'entrepreneurs et opportunités du territoire.",
    icon: Landmark,
    accent: "#16a34a",
    gradient: ["#14532d", "#22c55e"],
    portrait: portraitGuyane,
    status: "online",
    keywords: ["guyane", "économie", "subventions", "territoire", "entreprise"],
  },
  {
    id: "etudes-formations",
    name: "Études & Formations",
    domain: "Apprentissage continu",
    description:
      "Formateur moderne : parcours de formation sur mesure, financement CPF et montée en compétences accélérée.",
    icon: BookOpen,
    accent: "#4f46e5",
    gradient: ["#4338ca", "#818cf8"],
    portrait: portraitEtudes,
    status: "standby",
    keywords: ["formation", "cpf", "diplôme", "compétences", "cours", "études"],
  },
  {
    id: "marketing-social",
    name: "Marketing & Réseaux Sociaux",
    domain: "Croissance digitale",
    description:
      "Spécialiste du marketing digital : calendrier éditorial, campagnes ciblées et croissance de vos audiences.",
    icon: Megaphone,
    accent: "#c026d3",
    gradient: ["#701a75", "#d946ef"],
    portrait: portraitMarketing,
    status: "busy",
    keywords: ["marketing", "instagram", "tiktok", "contenu", "publicité", "seo"],
  },
  {
    id: "finances",
    name: "Finances",
    domain: "Pilotage financier",
    description:
      "Analyste financier personnel : budgets, trésorerie, prévisionnels et décisions d'investissement éclairées.",
    icon: PiggyBank,
    accent: "#059669",
    gradient: ["#064e3b", "#10b981"],
    portrait: portraitFinances,
    status: "online",
    keywords: ["budget", "argent", "épargne", "comptabilité", "impôts", "banque"],
  },
  {
    id: "documents-admin",
    name: "Documents Administratifs",
    domain: "Gestion documentaire",
    description:
      "Gestionnaire administrative : rédaction, classement intelligent et suivi de toutes vos démarches officielles.",
    icon: FileStack,
    accent: "#475569",
    gradient: ["#334155", "#64748b"],
    portrait: portraitDocuments,
    status: "online",
    keywords: ["papiers", "caf", "dossier", "courrier", "démarches", "administratif"],
  },
  {
    id: "automatisations",
    name: "Automatisations IA",
    domain: "Ingénierie d'agents",
    description:
      "Expert IA & automatisation : workflows no-code, agents connectés et gains de temps mesurables chaque semaine.",
    icon: Workflow,
    accent: "#6366f1",
    gradient: ["#111827", "#6366f1"],
    portrait: portraitAutomatisations,
    status: "busy",
    keywords: ["automation", "make", "zapier", "workflow", "api", "robots"],
  },
  {
    id: "veille-recherche",
    name: "Veille & Recherche IA",
    domain: "Intelligence stratégique",
    description:
      "Analyste de recherche : veille quotidienne, synthèses sourcées et signaux faibles détectés avant tout le monde.",
    icon: Radar,
    accent: "#0284c7",
    gradient: ["#0c4a6e", "#38bdf8"],
    portrait: portraitVeille,
    status: "online",
    keywords: ["veille", "recherche", "actualités", "synthèse", "tendances"],
  },
];

/** Libellés et couleurs des statuts (jamais la couleur seule : point + texte) */
export const STATUS_META: Record<AgentStatus, { label: string; varColor: string; varSoft: string }> = {
  online: { label: "En ligne", varColor: "var(--cc-online)", varSoft: "var(--cc-online-soft)" },
  busy: { label: "En mission", varColor: "var(--cc-busy)", varSoft: "var(--cc-busy-soft)" },
  standby: { label: "En veille", varColor: "var(--cc-idle)", varSoft: "var(--cc-idle-soft)" },
};
