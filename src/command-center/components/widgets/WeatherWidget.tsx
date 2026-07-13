import { CloudSun, Droplets, Wind } from "lucide-react";
import { WEATHER } from "../../data/dashboard";

/* ================================================================
   WEATHER WIDGET — météo (données fictives, Cayenne).
   Prêt à être branché sur une vraie API météo plus tard.
   ================================================================ */

export default function WeatherWidget() {
  return (
    <section
      className="cc-widget relative overflow-hidden rounded-3xl border text-white"
      style={{
        borderColor: "var(--cc-border)",
        background: "linear-gradient(140deg, #0ea5e9 0%, #2563eb 55%, #4f46e5 100%)",
        boxShadow: "var(--cc-shadow)",
      }}
      aria-label={`Météo à ${WEATHER.city}`}
    >
      {/* halo décoratif */}
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.35), transparent)" }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] opacity-80">{WEATHER.city}</p>
          <p className="cc-display mt-1 text-[2.4rem] font-extrabold leading-none">{WEATHER.temp}°</p>
          <p className="mt-1 text-[0.8rem] font-semibold opacity-90">{WEATHER.condition}</p>
        </div>
        <CloudSun size={44} strokeWidth={1.6} className="shrink-0 opacity-95" aria-hidden="true" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.74rem] font-semibold opacity-90">
        <span className="flex items-center gap-1"><Droplets size={14} /> {WEATHER.humidity} %</span>
        <span className="flex items-center gap-1"><Wind size={14} /> {WEATHER.wind} km/h</span>
        <span>↑ {WEATHER.high}° · ↓ {WEATHER.low}°</span>
      </div>
    </section>
  );
}
