import { motion } from "framer-motion";
import { SHORTCUTS } from "../../data/dashboard";

/* ================================================================
   QUICK ACTIONS — raccourcis rapides du tableau de bord.
   ================================================================ */

export default function QuickActions() {
  return (
    <section aria-label="Raccourcis rapides" className="grid grid-cols-4 gap-3">
      {SHORTCUTS.map(({ id, label, icon: Icon }, i) => (
        <motion.button
          key={id}
          type="button"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          className="cc-glass flex flex-col items-center gap-2 px-1 py-3 text-[0.68rem] font-bold"
          style={{ borderRadius: "1.15rem" }}
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ background: "linear-gradient(135deg, var(--cc-brand), var(--cc-brand-2))" }}
          >
            <Icon size={18} />
          </span>
          {label}
        </motion.button>
      ))}
    </section>
  );
}
