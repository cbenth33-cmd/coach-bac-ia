/* ============================================================
   Chat Coach IA — client.
   SÉCURITÉ : la clé API Anthropic ne doit JAMAIS être exposée
   côté client. On appelle un proxy serveur (Supabase Edge
   Function fournie dans /supabase/functions/coach-chat) qui
   détient la clé. Configurer VITE_CLAUDE_PROXY_URL dans .env.
   ============================================================ */
import type { StudentProfile, Results } from "../core/bac-engine";
import { coachAnalysis } from "../coach/analysis";

export interface ChatMessage { role: "user" | "assistant"; content: string }

const PROXY = import.meta.env.VITE_CLAUDE_PROXY_URL as string | undefined;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function buildSystemPrompt(p: StudentProfile, res: Results): string {
  const a = coachAnalysis(p, res);
  const notes = res.rows
    .map((r) => `${r.nom} (coef ${r.coef}) : ${r.note != null ? r.note + "/20" : "non renseignée"}`)
    .join("; ");
  return `Tu es Coach Bac IA, un coach bienveillant, concret et exigeant qui aide un élève à préparer le baccalauréat français.
CONTEXTE ÉLÈVE (utilise-le, ne le récite pas) :
- Prénom : ${p.prenom} · Bac ${p.session}, académie de ${p.academie}, candidat ${p.statut}, voie ${p.voie === "generale" ? "générale" : "technologique " + (p.serie || "")}.
- Spécialités : ${p.spe1} et ${p.spe2}${p.spe3 ? ` (abandonnée en 1re : ${p.spe3})` : ""}.
- Notes : ${notes}.
- Moyenne projetée : ${res.moyenne != null ? res.moyenne.toFixed(2) + "/20 (" + res.mention?.label + ")" : "aucune note saisie"}. Objectif : ${res.target}/20. Points manquants : ${res.ptsManquants}.
- Priorités calculées : ${a.weak.slice(0, 3).map((w) => w.nom).join(", ") || "aucune"}. Points forts : ${a.strong.map((s) => s.nom).join(", ") || "aucun identifié"}.
- Disponibilité : ${p.heuresSemaine} h de révision/semaine.
RÈGLES : réponds en français, de façon courte et actionnable (max ~150 mots sauf si on te demande un plan détaillé). Tutoie l'élève. Appuie-toi sur les coefficients officiels du bac. Propose des actions datées et mesurables. Si la question sort du cadre scolaire (santé, détresse), invite avec bienveillance à parler à un adulte de confiance ou un professionnel. Ne donne jamais de fausse information sur les règles officielles : si tu n'es pas sûr, dis de vérifier auprès du rectorat.`;
}

export async function askCoach(system: string, messages: ChatMessage[]): Promise<string> {
  if (!PROXY) {
    return "Le chat IA n'est pas encore configuré : renseigne VITE_CLAUDE_PROXY_URL dans le fichier .env (voir README §Chat IA), puis redémarre l'application.";
  }
  const r = await fetch(PROXY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(ANON ? { Authorization: `Bearer ${ANON}`, apikey: ANON } : {}),
    },
    body: JSON.stringify({ system, messages }),
  });
  if (!r.ok) throw new Error(`Proxy ${r.status}`);
  const data = await r.json();
  const text = (data.content || [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("\n")
    .trim();
  return text || "Je n'ai pas réussi à formuler une réponse — reformule ta question.";
}
