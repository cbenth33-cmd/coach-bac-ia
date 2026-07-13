import { motion } from "framer-motion";
import {
  LayoutGrid, Users, FolderKanban, Workflow, BarChart3,
  CalendarDays, Settings, LifeBuoy, Command, X,
} from "lucide-react";
import { AGENTS } from "../data/agents";

/* ================================================================
   SIDEBAR — navigation principale du « système d'exploitation ».
   Desktop : colonne fixe (icônes seules sous 1280 px).
   Mobile : tiroir animé (voir CommandCenter).
   ================================================================ */

const NAV = [
  { id: "home", label: "Accueil", icon: LayoutGrid, current: true },
  { id: "agents", label: "Agents IA", icon: Users, badge: String(AGENTS.length) },
  { id: "projects", label: "Projets", icon: FolderKanban },
  { id: "automations", label: "Automatisations", icon: Workflow },
  { id: "analytics", label: "Statistiques", icon: BarChart3 },
  { id: "calendar", label: "Calendrier", icon: CalendarDays },
] as const;

const FOOTER_NAV = [
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "help", label: "Assistance", icon: LifeBuoy },
] as const;

interface SidebarProps {
  /** Rendu en tiroir mobile (affiche libellés + bouton fermer) */
  asDrawer?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ asDrawer = false, onClose }: SidebarProps) {
  return (
    <nav
      aria-label="Navigation principale"
      className={`cc-glass flex h-full flex-col gap-1 p-4 ${asDrawer ? "" : "cc-sidebar-desktop sticky top-5 max-h-[calc(100dvh-2.5rem)]"}`}
    >
      {/* Marque */}
      <div className="mb-4 flex items-center gap-3 px-1">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.06 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, var(--cc-brand), var(--cc-brand-2))" }}
        >
          <Command size={22} strokeWidth={2.4} />
        </motion.div>
        <div className="cc-nav-label min-w-0">
          <p className="cc-display truncate text-[0.95rem] font-extrabold leading-tight">DIYIAH OS</p>
          <p className="cc-kicker">Command Center</p>
        </div>
        {asDrawer && (
          <button type="button" onClick={onClose} className="cc-iconbtn ml-auto" aria-label="Fermer le menu">
            <X size={18} />
          </button>
        )}
      </div>

      {NAV.map(({ id, label, icon: Icon, ...rest }) => (
        <a key={id} href="#" onClick={(e) => e.preventDefault()} className="cc-nav-item" aria-current={"current" in rest && rest.current ? "page" : undefined}>
          <Icon size={19} strokeWidth={2.1} className="shrink-0" />
          <span className="cc-nav-label">{label}</span>
          {"badge" in rest && rest.badge && (
            <span
              className="cc-nav-extra ml-auto rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold"
              style={{ background: "var(--cc-brand-soft)", color: "var(--cc-brand)" }}
            >
              {rest.badge}
            </span>
          )}
        </a>
      ))}

      <div className="mt-auto flex flex-col gap-1 border-t pt-3" style={{ borderColor: "var(--cc-border)" }}>
        {FOOTER_NAV.map(({ id, label, icon: Icon }) => (
          <a key={id} href="#" onClick={(e) => e.preventDefault()} className="cc-nav-item">
            <Icon size={19} strokeWidth={2.1} className="shrink-0" />
            <span className="cc-nav-label">{label}</span>
          </a>
        ))}

        {/* Profil */}
        <div className="cc-nav-label mt-2 flex items-center gap-3 rounded-2xl p-2" style={{ background: "var(--cc-brand-soft)" }}>
          <div
            className="cc-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.8rem] font-extrabold text-white"
            style={{ background: "linear-gradient(135deg, #0e7490, #22d3ee)" }}
          >
            CB
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.8rem] font-bold">Christopher</p>
            <p className="truncate text-[0.68rem] font-semibold" style={{ color: "var(--cc-mute)" }}>
              Plan Commandeur
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
}
