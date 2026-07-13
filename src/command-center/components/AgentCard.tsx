import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Agent } from "../data/agents";
import { STATUS_META } from "../data/agents";

/* ================================================================
   AGENT CARD — carte interactive d'un agent IA.
   Portrait photographique (fallback monogramme premium si l'image
   ne charge pas), icône dédiée, statut, bouton « Ouvrir »,
   survol avec profondeur et zoom doux, animation au clic.
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
  const [imgFailed, setImgFailed] = useState(false);
  const status = STATUS_META[agent.status];
  const Icon = agent.icon;

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      layout
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.965 }}
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
      {/* Portrait */}
      <div className="cc-agent-media">
        {!imgFailed ? (
          <img
            src={agent.portrait}
            alt={`Portrait de l'agent ${agent.name}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="cc-agent-fallback" aria-hidden="true">
            <span>{agent.initials}</span>
          </div>
        )}

        {/* Icône dédiée */}
        <span className="cc-agent-ico">
          <Icon size={19} strokeWidth={2.2} />
        </span>

        {/* Indicateur de statut (point + libellé, jamais la couleur seule) */}
        <span
          className="cc-status absolute right-3 top-3"
          style={{ color: "#fff", background: "rgba(10, 12, 26, 0.5)", border: "1px solid rgba(255,255,255,0.25)" }}
        >
          <span
            className={`cc-status-dot ${agent.status === "online" ? "is-live" : ""}`}
            style={{ color: status.varColor, background: status.varColor }}
          />
          {status.label}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="cc-kicker" style={{ color: agent.accent }}>
          {agent.domain}
        </p>
        <h3 className="cc-display text-[1.02rem] font-extrabold leading-snug">{agent.name}</h3>
        <p className="text-[0.8rem] leading-relaxed" style={{ color: "var(--cc-ink-2)" }}>
          {agent.description}
        </p>

        <span className="cc-btn cc-btn-ghost mt-3 self-start" aria-hidden="true">
          Ouvrir
          <ArrowUpRight size={15} strokeWidth={2.4} />
        </span>
      </div>
    </motion.button>
  );
}
