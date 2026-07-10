/* Référentiels officiels : académies, sessions, filières, échéancier rectorat */
import type { StudentProfile } from "../core/bac-engine";

export const ACADEMIES = [
  "Aix-Marseille","Amiens","Besançon","Bordeaux","Clermont-Ferrand","Corse",
  "Créteil","Dijon","Grenoble","Guadeloupe","Guyane","La Réunion","Lille",
  "Limoges","Lyon","Martinique","Mayotte","Montpellier","Nancy-Metz","Nantes",
  "Nice","Normandie","Nouvelle-Calédonie","Orléans-Tours","Paris","Poitiers",
  "Polynésie française","Reims","Rennes","Saint-Pierre-et-Miquelon",
  "Strasbourg","Toulouse","Versailles",
];
export const SESSIONS = [2026, 2027, 2028];

export const SPES_GENERALE = [
  "Mathématiques","Physique-Chimie","SVT","SES","HGGSP",
  "Humanités, littérature et philosophie","LLCE Anglais","NSI",
  "Sciences de l'ingénieur","Arts","EPPCS","Langues et cultures de l'Antiquité",
  "Biologie-écologie",
];

export const SERIES_TECHNO = {
  STMG: { nom: "STMG", spes: ["Management, sc. de gestion et numérique", "Droit et économie"], spe1ere: "Sciences de gestion et numérique" },
  STI2D: { nom: "STI2D", spes: ["Ingénierie, innovation et développement durable", "Physique-chimie et mathématiques"], spe1ere: "Innovation technologique" },
  ST2S: { nom: "ST2S", spes: ["Sciences et techniques sanitaires et sociales", "Chimie, biologie et physiopathologie humaines"], spe1ere: "Physique-chimie pour la santé" },
  STL: { nom: "STL", spes: ["Biochimie-biologie-biotechnologie ou SPCL", "Physique-chimie et mathématiques"], spe1ere: "Biotechnologies ou SPCL" },
  STD2A: { nom: "STD2A", spes: ["Analyse et méthodes en design", "Conception et création en design et métiers d'art"], spe1ere: "Design et métiers d'art" },
  STAV: { nom: "STAV", spes: ["Gestion des ressources et de l'alimentation", "Territoires et technologie"], spe1ere: "Territoires et sociétés" },
  STHR: { nom: "STHR", spes: ["Sciences et technologies culinaires et des services", "Économie et gestion hôtelière"], spe1ere: "Enseignement sc. alimentation-environnement" },
  S2TMD: { nom: "S2TMD", spes: ["Pratique (musique, danse ou théâtre)", "Culture et sciences (musique, danse ou théâtre)"], spe1ere: "Économie, droit et environnement du spectacle" },
};

export interface RectoratItem { id: string; cat: string; titre: string; date: string; desc: string }

export function rectoratItems(p: StudentProfile): RectoratItem[] {
  const y = p.session || 2026;
  const ind = p.statut === "individuel";
  return [
    { id: "insc", cat: "Inscription", titre: ind ? "Inscription individuelle (Cyclades)" : "Confirmation d'inscription au bac", date: `Oct.–nov. ${y - 1}`, desc: ind ? "Inscription en ligne sur Cyclades pendant la fenêtre d'ouverture de ton académie. Vérifie les épreuves ponctuelles à passer." : "Vérifie et signe la confirmation transmise par ton lycée. Contrôle état civil, spécialités et langues." },
    { id: "amenag", cat: "Inscription", titre: "Demande d'aménagements d'épreuves", date: `Avant fin ${y - 1}`, desc: "Si besoin (tiers-temps, matériel adapté…), dépose la demande auprès du rectorat dans les délais — aucune demande tardive n'est acceptée." },
    { id: "convoc_spe", cat: "Convocations", titre: "Convocation aux épreuves de spécialité", date: `Mai ${y}`, desc: "Reçue via le lycée ou Cyclades. Vérifie centre d'examen, dates, heures et matériel autorisé (calculatrice mode examen)." },
    { id: "id", cat: "Documents", titre: "Pièce d'identité en cours de validité", date: `Avant mai ${y}`, desc: "Obligatoire chaque jour d'épreuve avec la convocation. Anticipe un renouvellement : les délais en préfecture peuvent dépasser 2 mois." },
    { id: "ep_spe", cat: "Épreuves", titre: "Épreuves écrites de spécialité", date: `Juin ${y}`, desc: "Coefficient 16 chacune. Arrive 30 min en avance, convocation + pièce d'identité en main." },
    { id: "ep_philo", cat: "Épreuves", titre: "Épreuve de philosophie", date: `Mi-juin ${y}`, desc: `Coefficient ${p.voie === "generale" ? 8 : 4}. Durée 4 h.` },
    { id: "ep_go", cat: "Épreuves", titre: "Grand oral", date: `Fin juin – début juillet ${y}`, desc: `Coefficient ${p.voie === "generale" ? 10 : 14}. Apporte tes deux questions validées et ton support éventuel.` },
    { id: "resultats", cat: "Résultats", titre: "Publication des résultats", date: `Début juillet ${y}`, desc: "Sur Cyclades et au centre d'examen. Entre 8 et 10 de moyenne : inscris-toi immédiatement aux oraux de rattrapage (choix de 2 matières)." },
    { id: "rattrap", cat: "Résultats", titre: "Oraux de rattrapage (si besoin)", date: `Juillet ${y}`, desc: "Choisis les 2 matières où l'écart entre ta note et 10 est le plus rentable en points (ton Coach IA peut t'aider)." },
    { id: "diplome", cat: "Résultats", titre: "Retrait du relevé de notes et du diplôme", date: `Juillet ${y} / rentrée`, desc: "Relevé indispensable pour Parcoursup et les inscriptions post-bac. Le diplôme se retire ensuite au rectorat ou au lycée." },
  ];
}
