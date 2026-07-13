import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import type { Agent } from "../data/agents";
import { STATUS_META } from "../data/agents";

/* ================================================================
   AGENT LAUNCHER — écran de lancement plein verre affiché au clic
   sur une carte. Si l'agent possède une route interne (Coach Bac),
   « Lancer » y navigue ; sinon l'espace de travail arrive bientôt.
   ================================================================ */

interface AgentLauncherProps {
  agent: Agent | null;
  onClose: () => void;
}

export default function AgentLauncher({ agent, onClose }: AgentLauncherProps) {
  /* Échap ferme le lanceur */
  useEffect(() => {
    if (!agent) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [agent, onClose]);

  const launch = () => {
    if (agent?.route) {
      window.location.hash = agent.route.replace(/^#/, "");
    }
  };

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: "color-mix(in srgb, var(--cc-bg) 55%, transparent)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`Lancement de ${agent.name}`}
        >
          <motion.div
            initial={{ opacity: 0, y: 34, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="cc-panel w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bandeau aux couleurs de l'agent, avec portrait */}
            <div
              className="relative flex items-center gap-4 p-5 text-white"
              style={{ background: `linear-gradient(135deg, ${agent.gradient[0]}, ${agent.gradient[1]})` }}
            >
              <img
                src={agent.portrait}
                alt=""
                className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white/50 object-cover shadow-lg"
                style={{ objectPosition: "center 18%" }}
              />
              <span
                className="absolute left-[4.6rem] top-[4.4rem] flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/20"
                style={{ backdropFilter: "blur(8px)" }}
                aria-hidden="true"
              >
                <agent.icon size={16} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] opacity-80">{agent.domain}</p>
                <h2 className="cc-display truncate text-lg font-extrabold">{agent.name}</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/10 transition hover:bg-white/25"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-5">
              <p className="text-[0.86rem] leading-relaxed" style={{ color: "var(--cc-ink-2)" }}>
                {agent.description}
              </p>

              <div className="flex items-center gap-2">
                <span
                  className="cc-status"
                  style={{ color: STATUS_META[agent.status].varColor, background: STATUS_META[agent.status].varSoft }}
                >
                  <span className="cc-status-dot" />
                  {STATUS_META[agent.status].label}
                </span>
                {!agent.route && (
                  <span className="cc-status" style={{ color: "var(--cc-mute)", background: "var(--cc-idle-soft)" }}>
                    Espace de travail en préparation
                  </span>
                )}
              </div>

              {agent.route ? (
                <button type="button" onClick={launch} className="cc-btn cc-btn-brand w-full py-3">
                  Lancer l'espace de travail
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button type="button" onClick={onClose} className="cc-btn cc-btn-ghost w-full py-3">
                  Revenir au tableau de bord
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
