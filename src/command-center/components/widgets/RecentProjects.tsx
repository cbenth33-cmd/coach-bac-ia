import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { PROJECTS, PROJECTS_ICON as FolderIcon } from "../../data/dashboard";

/* ================================================================
   RECENT PROJECTS — espace « Projets récents » avec progression.
   ================================================================ */

export default function RecentProjects() {
  return (
    <section className="cc-panel cc-widget" aria-label="Projets récents">
      <div className="cc-widget-title">
        <h2 className="cc-display text-[0.95rem] font-extrabold">Projets récents</h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--cc-brand-soft)", color: "var(--cc-brand)" }}>
          <FolderIcon size={16} />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {PROJECTS.map((p) => (
          <button key={p.id} type="button" className="cc-row w-full text-left">
            <span
              className="cc-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.66rem] font-extrabold text-white"
              style={{ background: p.color }}
              aria-hidden="true"
            >
              {p.progress}%
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.8rem] font-bold">{p.name}</span>
              <span className="block truncate text-[0.7rem] font-semibold" style={{ color: "var(--cc-mute)" }}>
                {p.agent}
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full" style={{ background: "var(--cc-brand-soft)" }}>
                <motion.span
                  className="block h-full rounded-full"
                  style={{ background: p.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${p.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            </span>
            <ChevronRight size={16} className="shrink-0" style={{ color: "var(--cc-mute)" }} />
          </button>
        ))}
      </div>
    </section>
  );
}
