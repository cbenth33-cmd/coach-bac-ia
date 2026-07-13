import type { LucideIcon } from "lucide-react";
import {
  GraduationCap, Dog, Headset, Palette, CupSoda, Accessibility,
  Landmark, BookOpen, Megaphone, PiggyBank, FileStack, Workflow, Radar,
} from "lucide-react";

/* ================================================================
   AGENTS IA — annuaire du Centre de Commandement
   Chaque agent porte son identité visuelle : palette dédiée, icône,
   portrait photographique et statut temps réel (fictif pour la démo).

   ⚠️ PORTRAITS : les URLs pointent vers des photos libres de droits
   (Unsplash). Pour utiliser vos propres portraits, déposez une image
   dans `src/assets/agents/` puis remplacez `portrait` par un import :
     import coachBac from "../../assets/agents/coach-bac.jpg";
   Si une URL ne charge pas, la carte affiche automatiquement un
   monogramme premium aux couleurs de l'agent (aucune carte cassée).
   ================================================================ */

export type AgentStatus = "online" | "busy" | "standby";

export interface Agent {
  /** Identifiant stable (slug) */
  id: string;
  /** Nom affiché sur la carte */
  name: string;
  /** Domaine court (sous-titre) */
  domain: string;
  /** Description en une phrase */
  description: string;
  /** Icône lucide dédiée */
  icon: LucideIcon;
  /** Palette dédiée : dégradé du média + couleur d'accent */
  gradient: [string, string];
  accent: string;
  /** Portrait photoréaliste (voir note ci-dessus) */
  portrait: string;
  /** Initiales du monogramme de secours */
  initials: string;
  status: AgentStatus;
  /** Route interne ouverte par « Ouvrir » (hash), sinon écran de lancement */
  route?: string;
  /** Mots-clés supplémentaires pour la recherche intelligente */
  keywords: string[];
}

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&crop=faces&w=900&q=80`;

export const AGENTS: Agent[] = [
  {
    id: "coach-bac",
    name: "Coach Bac IA",
    domain: "Éducation · Baccalauréat",
    description:
      "Enseignante virtuelle bienveillante : calcul des points, plan de révision et coaching jusqu'au jour J.",
    icon: GraduationCap,
    gradient: ["#312e81", "#7c3aed"],
    accent: "#7c3aed",
    portrait: unsplash("photo-1573497019940-1c28c88b4f3e"),
    initials: "CB",
    status: "online",
    route: "#/coach-bac",
    keywords: ["bac", "révisions", "lycée", "examens", "mentions", "école"],
  },
  {
    id: "ulysse-canin",
    name: "Ulysse — Éducation Canine",
    domain: "Bien-être animal",
    description:
      "Éducateur canin professionnel : protocoles d'éducation positive pour rottweilers, bergers allemands et compagnie.",
    icon: Dog,
    gradient: ["#7c2d12", "#d97706"],
    accent: "#d97706",
    portrait: unsplash("photo-1605568427561-40dd23c2acea"),
    initials: "UL",
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
    gradient: ["#0f766e", "#14b8a6"],
    accent: "#0d9488",
    portrait: unsplash("photo-1580489944761-15a19d654956"),
    initials: "AV",
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
    gradient: ["#9d174d", "#ec4899"],
    accent: "#db2777",
    portrait: unsplash("photo-1487412720507-e7ab37603c6f"),
    initials: "DC",
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
    gradient: ["#b45309", "#f59e0b"],
    accent: "#ea580c",
    portrait: unsplash("photo-1531123897727-8f129e1688ce"),
    initials: "DP",
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
    gradient: ["#1e3a8a", "#3b82f6"],
    accent: "#2563eb",
    portrait: unsplash("photo-1560250097-0b93528c311a"),
    initials: "ER",
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
    gradient: ["#14532d", "#22c55e"],
    accent: "#16a34a",
    portrait: unsplash("photo-1507003211169-0a1dd7228f2d"),
    initials: "GD",
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
    gradient: ["#4338ca", "#818cf8"],
    accent: "#4f46e5",
    portrait: unsplash("photo-1472099645785-5658abf4ff4e"),
    initials: "EF",
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
    gradient: ["#701a75", "#d946ef"],
    accent: "#c026d3",
    portrait: unsplash("photo-1500648767791-00dcc994a43e"),
    initials: "MS",
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
    gradient: ["#064e3b", "#10b981"],
    accent: "#059669",
    portrait: unsplash("photo-1519085360753-af0119f7cbe7"),
    initials: "FI",
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
    gradient: ["#334155", "#64748b"],
    accent: "#475569",
    portrait: unsplash("photo-1573496359142-b8d87734a5a2"),
    initials: "DA",
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
    gradient: ["#111827", "#6366f1"],
    accent: "#6366f1",
    portrait: unsplash("photo-1506794778202-cad84cf45f1d"),
    initials: "AI",
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
    gradient: ["#0c4a6e", "#38bdf8"],
    accent: "#0284c7",
    portrait: unsplash("photo-1438761681033-6461ffad8d80"),
    initials: "VR",
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
