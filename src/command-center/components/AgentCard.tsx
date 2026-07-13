import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Agent } from "../data/agents";
import { STATUS_META } from "../data/agents";

/* ================================================================
   AGENT CARD — grande carte premium d'un agent IA.
   Portrait photographique plein cadre, icône et couleur dédiées,
   indicateur de statut, bouton « Ouvrir », survol avec profondeur
   et zoom doux du portrait, animation au clic.
   ================================================================ */

interface AgentCardProps {
  agent: Agent;
  onOpen: (agent: Agent) => void;
}

/** Variants d'entrée : orchestrés en cascade par la grille parente. */
export const cardVariants = {
  hidden: { opacity: 0, y: 26, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

export default function AgentCard({ agent, onOpen }: AgentCardProps) {
  const status = STATUS_META[agent.status];
  const Icon = agent.icon;

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      layout
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="cc-agent"
      onClick={() => onOpen(agent)}
      style={
        {
          "--agent-accent": agent.accent,
          "--agent-from": agent.gradient[0],
          "--agent-to": agent.gradient[1],
        } as React.CSSProperties
      }
      aria-label={`Ouvrir l'agent ${agent.name}`}
    >
      {/* Portrait photographique */}
      <div className="cc-agent-media">
        <img src={agent.portrait} alt={`Portrait professionnel — ${agent.name}`} loading="lazy" />

        {/* Icône dédiée (verre teinté à la couleur de l'agent) */}
        <span className="cc-agent-ico">
          <Icon size={20} strokeWidth={2.2} />
        </span>

        {/* Indicateur de statut (point + libellé, jamais la couleur seule) */}
        <span
          className="cc-status absolute right-3 top-3"
          style={{ color: "#fff", background: "rgba(10, 12, 26, 0.52)", border: "1px solid rgba(255,255,255,0.28)" }}
        >
          <span
            className={`cc-status-dot ${agent.status === "online" ? "is-live" : ""}`}
            style={{ color: status.varColor, background: status.varColor }}
          />
          {status.label}
        </span>

        {/* Liseré d'identité */}
        <span
          className="absolute inset-x-0 bottom-0 h-1"
          style={{ background: `linear-gradient(90deg, ${agent.gradient[0]}, ${agent.gradient[1]})` }}
          aria-hidden="true"
        />
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <p className="cc-kicker" style={{ color: agent.accent }}>
          {agent.domain}
        </p>
        <h3 className="cc-display text-[1.1rem] font-extrabold leading-snug">{agent.name}</h3>
        <p className="line-clamp-2 text-[0.82rem] leading-relaxed" style={{ color: "var(--cc-ink-2)" }}>
          {agent.description}
        </p>

        <span className="cc-agent-open mt-3" aria-hidden="true">
          Ouvrir
          <ArrowUpRight size={16} strokeWidth={2.4} />
        </span>
      </div>
    </motion.button>
  );
}
