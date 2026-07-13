/* ============================================================
   COACH ULYSSE — mascotte officielle de Coach Bac IA.
   Illustrations originales (dessin de la fille du fondateur),
   découpées telles quelles depuis la planche de référence
   (docs/mascotte-coach-ulysse-originale.png) : aucun redessin,
   aucune réinterprétation. Composant purement visuel.
   ============================================================ */
import content from "../assets/ulysse/content.webp";
import concentre from "../assets/ulysse/concentre.webp";
import encourageant from "../assets/ulysse/encourageant.webp";
import reflechi from "../assets/ulysse/reflechi.webp";
import surpris from "../assets/ulysse/surpris.webp";
import fatigue from "../assets/ulysse/fatigue.webp";
import fier from "../assets/ulysse/fier.webp";
import bienveillant from "../assets/ulysse/bienveillant.webp";

export type UlysseMood =
  | "content"
  | "concentre"
  | "encourageant"
  | "reflechi"
  | "surpris"
  | "fatigue"
  | "fier"
  | "bienveillant";

const SRC: Record<UlysseMood, string> = {
  content, concentre, encourageant, reflechi, surpris, fatigue, fier, bienveillant,
};

const LABEL: Record<UlysseMood, string> = {
  content: "content",
  concentre: "concentré",
  encourageant: "encourageant",
  reflechi: "réfléchi",
  surpris: "surpris",
  fatigue: "fatigué",
  fier: "fier",
  bienveillant: "bienveillant",
};

export default function Ulysse({ mood = "content", size = 64, className = "", title }:
  { mood?: UlysseMood; size?: number; className?: string; title?: string }) {
  return (
    <img src={SRC[mood]} width={size} height={size} className={className}
      alt={title ?? `Coach Ulysse, ${LABEL[mood]}`} draggable={false}
      style={{ objectFit: "contain", userSelect: "none" }} />
  );
}
