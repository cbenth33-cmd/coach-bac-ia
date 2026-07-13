import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ACTIVITY } from "../../data/dashboard";

/* ================================================================
   ACTIVITY CHART — interactions IA sur 7 jours (série unique :
   le titre nomme la série, pas de légende). Aires dégradées,
   ligne 2px, grille en filigrane, infobulle au survol.
   ================================================================ */

/** Infobulle sur mesure, alignée sur le design system. */
function ActivityTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="cc-glass px-3 py-2" style={{ borderRadius: "0.8rem" }}>
      <p className="text-[0.68rem] font-bold" style={{ color: "var(--cc-mute)" }}>{label}</p>
      <p className="cc-display text-sm font-extrabold">{payload[0].value} interactions</p>
    </div>
  );
}

export default function ActivityChart() {
  return (
    <section className="cc-panel cc-widget" aria-label="Interactions IA des 7 derniers jours">
      <div className="cc-widget-title">
        <div>
          <h2 className="cc-display text-[0.95rem] font-extrabold">Interactions IA</h2>
          <p className="text-[0.72rem] font-semibold" style={{ color: "var(--cc-mute)" }}>7 derniers jours</p>
        </div>
        <span className="cc-status" style={{ color: "var(--cc-online)", background: "var(--cc-online-soft)" }}>
          <span className="cc-status-dot" />
          +21 % cette semaine
        </span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ACTIVITY} margin={{ top: 6, right: 4, bottom: 0, left: -4 }}>
            <defs>
              <linearGradient id="cc-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--cc-series-1)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--cc-series-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--cc-grid-line)" strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--cc-mute)", fontSize: 11, fontWeight: 600 }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--cc-mute)", fontSize: 11, fontWeight: 600 }}
              width={44}
            />
            <Tooltip content={<ActivityTooltip />} cursor={{ stroke: "var(--cc-border-strong)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="interactions"
              stroke="var(--cc-series-1)"
              strokeWidth={2}
              fill="url(#cc-area)"
              activeDot={{ r: 4.5, strokeWidth: 2, stroke: "var(--cc-card)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
