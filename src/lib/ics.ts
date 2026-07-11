/* ============================================================
   Export des échéances Rectorat vers le calendrier du téléphone
   (fichier .ics standard, avec rappel 7 jours avant).
   ============================================================ */
import type { StudentProfile } from "../core/bac-engine";
import { rectoratItems } from "../data/referentiels";

/** Dates indicatives (calendrier national) pour chaque échéance. */
function dateOf(id: string, session: number): string {
  const y = session, p = y - 1;
  const map: Record<string, string> = {
    insc: `${p}1105`, amenag: `${p}1215`, convoc_spe: `${y}0515`, id: `${y}0501`,
    ep_spe: `${y}0615`, ep_philo: `${y}0616`, ep_go: `${y}0625`,
    resultats: `${y}0704`, rattrap: `${y}0708`, diplome: `${y}0715`,
  };
  return map[id] ?? `${y}0601`;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildIcs(p: StudentProfile): string {
  const items = rectoratItems(p);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const events = items.map((it) => {
    const d = dateOf(it.id, p.session);
    return [
      "BEGIN:VEVENT",
      `UID:coachbac-${p.id}-${it.id}@coach-bac-ia`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${d}`,
      `SUMMARY:${esc(`Bac ${p.session} · ${it.titre}`)}`,
      `DESCRIPTION:${esc(it.desc + " (Date indicative — vérifie ta convocation.)")}`,
      "BEGIN:VALARM",
      "TRIGGER:-P7D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc("Dans 7 jours : " + it.titre)}`,
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DIYIAH CREARTS//Coach Bac IA//FR",
    "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(p: StudentProfile): void {
  const blob = new Blob([buildIcs(p)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bac-${p.session}-echeances.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
