import { CalendarDays } from "lucide-react";
import { EVENT_DAYS } from "../../data/dashboard";

/* ================================================================
   CALENDAR WIDGET — mini calendrier du mois courant.
   Semaine commençant le lundi, jour actuel en dégradé de marque,
   points d'événements sous les dates concernées.
   ================================================================ */

const DAY_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

/** Construit la grille du mois : cases vides avant le 1er (lundi = colonne 0). */
function buildMonthGrid(ref: Date): Array<number | null> {
  const first = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // getDay(): 0 = dimanche → décalage lundi
  return [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
}

export default function CalendarWidget() {
  const now = new Date();
  const grid = buildMonthGrid(now);
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <section className="cc-panel cc-widget" aria-label={`Calendrier — ${monthLabel}`}>
      <div className="cc-widget-title">
        <h2 className="cc-display text-[0.95rem] font-extrabold capitalize">{monthLabel}</h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--cc-brand-soft)", color: "var(--cc-brand)" }}>
          <CalendarDays size={16} />
        </span>
      </div>

      <div className="cc-cal-grid mb-1" aria-hidden="true">
        {DAY_HEADERS.map((d, i) => (
          <span key={i} className="cc-kicker py-1">{d}</span>
        ))}
      </div>
      <div className="cc-cal-grid">
        {grid.map((day, i) =>
          day === null ? (
            <span key={`x${i}`} />
          ) : (
            <span
              key={day}
              className={`cc-cal-day ${day === now.getDate() ? "is-today" : ""} ${EVENT_DAYS.includes(day) ? "has-event" : ""}`}
              aria-current={day === now.getDate() ? "date" : undefined}
            >
              {day}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
