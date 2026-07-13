/* ============================================================
   COACH ULYSSE — personnage officiel de Coach Bac IA.
   Chiot rottweiler chibi 100 % SVG (aucune image bitmap).
   Composant purement visuel : aucune logique métier ici.
   Marqueurs d'identité : robe noir & feu, taches au-dessus des
   yeux, marque blanche au poitrail, museau et pattes feu,
   collier à médaille patte.
   ============================================================ */

export type UlysseMood =
  | "content"
  | "concentre"
  | "encourageant"
  | "reflechi"
  | "surpris"
  | "fatigue"
  | "fier";

const FUR = "#241E19";
const FUR_EDGE = "#3A312A";
const TAN = "#C9884A";
const TAN_DARK = "#A96F35";
const CREAM = "#F4EBDC";
const NOSE = "#15100D";
const IRIS = "#7A5233";
const COLLAR = "#5A4332";
const TONGUE = "#E7756A";
const SPARK = "#F0B90B";

/* Patte levée (encourageant / réfléchi) */
const Paw = ({ x, y, rot = 0 }: { x: number; y: number; rot?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-9} y={0} width={18} height={34} rx={9} fill={FUR} />
    <ellipse cx={0} cy={0} rx={12} ry={10} fill={TAN} />
    <circle cx={-5.5} cy={-4} r={2.6} fill={TAN_DARK} />
    <circle cx={0} cy={-5.5} r={2.6} fill={TAN_DARK} />
    <circle cx={5.5} cy={-4} r={2.6} fill={TAN_DARK} />
    <ellipse cx={0} cy={2.5} rx={4.6} ry={3.6} fill={TAN_DARK} />
  </g>
);

/* Un œil : iris ambré, pupille, reflets */
const Eye = ({ cx, cy, r = 10, pupil = 1, dx = 0, dy = 0 }:
  { cx: number; cy: number; r?: number; pupil?: number; dx?: number; dy?: number }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={IRIS} />
    <circle cx={cx + dx} cy={cy + 1 + dy} r={r * 0.62 * pupil} fill={NOSE} />
    <circle cx={cx + dx + r * 0.28} cy={cy + dy - r * 0.32} r={r * 0.3} fill="#fff" />
    <circle cx={cx + dx - r * 0.25} cy={cy + dy + r * 0.22} r={r * 0.14} fill="#fff" opacity={0.85} />
  </g>
);

/* Taches feu au-dessus des yeux (les « sourcils » d'Ulysse) */
const Spots = ({ ly = 0, ry = 0, lr = 0, rr = 0 }:
  { ly?: number; ry?: number; lr?: number; rr?: number }) => (
  <g>
    <ellipse cx={82} cy={60 + ly} rx={11} ry={6.5} fill={TAN} transform={`rotate(${lr} 82 ${60 + ly})`} />
    <ellipse cx={138} cy={60 + ry} rx={11} ry={6.5} fill={TAN} transform={`rotate(${rr} 138 ${60 + ry})`} />
  </g>
);

function Face({ mood }: { mood: UlysseMood }) {
  switch (mood) {
    case "fier":
      return (
        <g>
          <Spots ly={-4} ry={-4} />
          <path d="M73,82 q11,-11 22,0" stroke={CREAM} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <path d="M125,82 q11,-11 22,0" stroke={CREAM} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <path d="M94,114 q16,13 32,0" stroke={NOSE} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M30,44 l4,-10 4,10 10,4 -10,4 -4,10 -4,-10 -10,-4 Z" fill={SPARK} />
          <path d="M182,36 l3,-8 3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 Z" fill={SPARK} />
          <path d="M190,74 l2,-6 2,6 6,2 -6,2 -2,6 -2,-6 -6,-2 Z" fill={SPARK} opacity={0.85} />
        </g>
      );
    case "concentre":
      return (
        <g>
          <Spots ly={2} ry={2} lr={14} rr={-14} />
          <g>
            <Eye cx={84} cy={82} r={9} />
            <Eye cx={136} cy={82} r={9} />
            <path d="M73,76 h22 M125,76 h22" stroke={FUR} strokeWidth={9} strokeLinecap="round" />
            <path d="M74,78 q10,-3 20,0 M126,78 q10,-3 20,0" stroke={CREAM} strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.7} />
          </g>
          <path d="M102,116 h16" stroke={NOSE} strokeWidth={3.6} strokeLinecap="round" />
        </g>
      );
    case "encourageant":
      return (
        <g>
          <Spots ly={-3} ry={-5} rr={-8} />
          <Eye cx={84} cy={80} />
          <path d="M126,80 q10,-9 20,0" stroke={CREAM} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <path d="M95,113 q15,14 30,0" stroke={NOSE} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M107,116 q3,7 8,9" stroke={NOSE} strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.6} />
          <Paw x={166} y={128} rot={18} />
          <path d="M186,100 l3,-8 3,8 8,3 -8,3 -3,8 -3,-8 -8,-3 Z" fill={SPARK} />
        </g>
      );
    case "reflechi":
      return (
        <g>
          <Spots ly={-6} lr={-10} ry={1} />
          <Eye cx={84} cy={79} dx={2.5} dy={-2.5} />
          <Eye cx={136} cy={79} dx={2.5} dy={-2.5} />
          <path d="M100,116 q6,-4 13,0" stroke={NOSE} strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <Paw x={134} y={132} rot={-14} />
          <circle cx={178} cy={44} r={3.4} fill="none" stroke={TAN} strokeWidth={2.6} />
          <circle cx={190} cy={30} r={5} fill="none" stroke={TAN} strokeWidth={2.6} />
        </g>
      );
    case "surpris":
      return (
        <g>
          <Spots ly={-8} ry={-8} />
          <Eye cx={84} cy={81} r={12} pupil={0.62} />
          <Eye cx={136} cy={81} r={12} pupil={0.62} />
          <ellipse cx={110} cy={117} rx={6} ry={7.5} fill={NOSE} />
          <g fill={SPARK}>
            <rect x={181} y={22} width={7} height={20} rx={3.5} transform="rotate(14 184 32)" />
            <circle cx={190} cy={52} r={4} />
          </g>
        </g>
      );
    case "fatigue":
      return (
        <g>
          <Spots ly={4} ry={4} lr={-10} rr={10} />
          <path d="M74,84 q10,7 20,0" stroke={CREAM} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <path d="M126,84 q10,7 20,0" stroke={CREAM} strokeWidth={4.5} strokeLinecap="round" fill="none" />
          <path d="M103,117 q7,3 14,0" stroke={NOSE} strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <g stroke={TAN} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M172,34 h11 l-11,10 h11" />
            <path d="M190,18 h8 l-8,7 h8" />
          </g>
        </g>
      );
    case "content":
    default:
      return (
        <g>
          <Spots ly={-2} ry={-2} />
          <Eye cx={84} cy={80} />
          <Eye cx={136} cy={80} />
          <path d="M94,112 q7,9 16,9 q9,0 16,-9" stroke={NOSE} strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M103,119 q7,10 14,0 l0,4 q-7,8 -14,0 Z" fill={TONGUE} />
        </g>
      );
  }
}

export default function Ulysse({ mood = "content", size = 64, className = "", title }:
  { mood?: UlysseMood; size?: number; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 220 250" width={size} height={size * (250 / 220)} className={className}
      role="img" aria-label={title ?? `Coach Ulysse, ${mood}`}>
      {/* queue */}
      <ellipse cx={44} cy={196} rx={16} ry={9} fill={FUR} transform="rotate(-32 44 196)" />
      <circle cx={31} cy={188} r={5.5} fill={TAN} />
      {/* arrière-train */}
      <ellipse cx={64} cy={204} rx={27} ry={21} fill={FUR} />
      <ellipse cx={156} cy={204} rx={27} ry={21} fill={FUR} />
      {/* corps */}
      <ellipse cx={110} cy={182} rx={47} ry={53} fill={FUR} />
      {/* marque blanche au poitrail */}
      <path d="M110,152 q17,7 12,28 q-5,12 -12,16 q-7,-4 -12,-16 q-5,-21 12,-28 Z" fill={CREAM} />
      {/* pattes avant */}
      <rect x={84} y={180} width={17} height={48} rx={8.5} fill={FUR} />
      <rect x={119} y={180} width={17} height={48} rx={8.5} fill={FUR} />
      <ellipse cx={92.5} cy={228} rx={12} ry={8.5} fill={TAN} />
      <ellipse cx={127.5} cy={228} rx={12} ry={8.5} fill={TAN} />
      <path d="M88,224 v6 M97,224 v6 M123,224 v6 M132,224 v6" stroke={TAN_DARK} strokeWidth={2} strokeLinecap="round" />
      {/* oreilles */}
      <ellipse cx={52} cy={76} rx={21} ry={32} fill={FUR} transform="rotate(24 52 76)" />
      <ellipse cx={168} cy={76} rx={21} ry={32} fill={FUR} transform="rotate(-24 168 76)" />
      <ellipse cx={56} cy={82} rx={11} ry={19} fill={TAN_DARK} opacity={0.35} transform="rotate(24 56 82)" />
      <ellipse cx={164} cy={82} rx={11} ry={19} fill={TAN_DARK} opacity={0.35} transform="rotate(-24 164 82)" />
      {/* tête */}
      <ellipse cx={110} cy={90} rx={63} ry={57} fill={FUR} />
      <ellipse cx={110} cy={90} rx={63} ry={57} fill="none" stroke={FUR_EDGE} strokeWidth={1.5} opacity={0.6} />
      {/* joues feu */}
      <ellipse cx={62} cy={112} rx={12} ry={9} fill={TAN} opacity={0.55} />
      <ellipse cx={158} cy={112} rx={12} ry={9} fill={TAN} opacity={0.55} />
      {/* museau feu + truffe */}
      <ellipse cx={110} cy={110} rx={27} ry={21} fill={TAN} />
      <path d="M110,94 q9,0 9,7 q0,7 -9,8 q-9,-1 -9,-8 q0,-7 9,-7 Z" fill={NOSE} />
      <path d="M110,108 v6" stroke={NOSE} strokeWidth={3} strokeLinecap="round" />
      {/* collier + médaille patte */}
      <path d="M70,138 q40,18 80,0 l-2,12 q-38,16 -76,0 Z" fill={COLLAR} />
      <circle cx={110} cy={156} r={11} fill={TAN} stroke={TAN_DARK} strokeWidth={2} />
      <g fill={COLLAR}>
        <circle cx={105.5} cy={152.5} r={2} />
        <circle cx={110} cy={151} r={2} />
        <circle cx={114.5} cy={152.5} r={2} />
        <ellipse cx={110} cy={158} rx={3.6} ry={3} />
      </g>
      {/* visage selon l'humeur */}
      <Face mood={mood} />
    </svg>
  );
}
