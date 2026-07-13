import { motion } from "framer-motion";
import { ArrowUpRight, Minus } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { STATS } from "../../data/dashboard";

/* ================================================================
   STAT TILES — 4 tuiles de statistiques avec sparkline 7 jours.
   Règles data-viz : valeur en encre de texte (jamais en couleur de
   série), tendance = icône + texte (pas la couleur seule),
   sparkline 2px sans axes.
   ================================================================ */

export default function StatTiles() {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {STATS.map((stat, i) => (
        <motion.article
          key={stat.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, type: "spring", stiffness: 260, damping: 24 }}
          whileHover={{ y: -3 }}
          className="cc-panel cc-widget flex flex-col gap-1"
        >
          <p className="text-[0.72rem] font-bold leading-snug" style={{ color: "var(--cc-mute)" }}>
            {stat.label}
          </p>
          <div className="flex items-end justify-between gap-2">
            <p className="cc-display whitespace-nowrap text-[1.7rem] font-extrabold leading-none">{stat.value}</p>
            <div className="h-9 w-20 shrink-0" aria-hidden="true">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stat.spark.map((v, idx) => ({ idx, v }))} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <Line type="monotone" dataKey="v" stroke="var(--cc-series-1)" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.72rem] font-bold">
            <span className="flex items-center gap-1 whitespace-nowrap" style={{ color: stat.up ? "var(--cc-online)" : "var(--cc-mute)" }}>
              {stat.delta === "stable" ? <Minus size={13} /> : <ArrowUpRight size={13} strokeWidth={2.6} />}
              {stat.delta}
            </span>
            <span className="whitespace-nowrap font-semibold" style={{ color: "var(--cc-mute)" }}>vs sem. passée</span>
          </p>
        </motion.article>
      ))}
    </div>
  );
}
