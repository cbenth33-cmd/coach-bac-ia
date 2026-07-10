/* Contenu pédagogique : quiz, fiches, structure des épreuves (annales) */

export interface QuizQuestion { q: string; opts: string[]; a: number }
export interface Fiche { matiere: string; titre: string; contenu: string }
export interface Annale { matiere: string; duree: string; format: string; conseil: string }

export const QUIZ: Record<string, QuizQuestion[]> = {
  "Philosophie": [
    { q: "Chez Kant, agir moralement, c'est agir…", opts: ["Par intérêt", "Par devoir", "Par habitude", "Par plaisir"], a: 1 },
    { q: "Le « cogito » est associé à…", opts: ["Platon", "Descartes", "Nietzsche", "Sartre"], a: 1 },
    { q: "Pour Rousseau, l'état de nature est…", opts: ["Une guerre de tous contre tous", "Une hypothèse théorique", "Un fait historique prouvé", "Une utopie religieuse"], a: 1 },
    { q: "L'épistémologie est l'étude…", opts: ["De l'art", "De la connaissance scientifique", "Du langage", "Du pouvoir"], a: 1 },
  ],
  "Mathématiques": [
    { q: "La dérivée de ln(x) est…", opts: ["1/x", "x", "e^x", "ln(x)/x"], a: 0 },
    { q: "Une suite (un) telle que un+1 = un + r est…", opts: ["Géométrique", "Arithmétique", "Constante", "Divergente"], a: 1 },
    { q: "P(A∪B) = …", opts: ["P(A)+P(B)", "P(A)×P(B)", "P(A)+P(B)−P(A∩B)", "1−P(A)"], a: 2 },
    { q: "lim (e^x)/x quand x→+∞ vaut…", opts: ["0", "1", "+∞", "e"], a: 2 },
  ],
  "Physique-Chimie": [
    { q: "L'unité de la quantité de matière est…", opts: ["Le gramme", "La mole", "Le litre", "Le joule"], a: 1 },
    { q: "La 2e loi de Newton s'écrit…", opts: ["ΣF = ma", "E = mc²", "U = RI", "P = mg"], a: 0 },
    { q: "Un acide selon Brønsted est une espèce qui…", opts: ["Capte H⁺", "Cède H⁺", "Capte e⁻", "Cède e⁻"], a: 1 },
  ],
  "SVT": [
    { q: "La méiose produit des cellules…", opts: ["Diploïdes identiques", "Haploïdes génétiquement variées", "Somatiques", "Cancéreuses"], a: 1 },
    { q: "Le magma des dorsales provient de…", opts: ["La fusion partielle du manteau", "La croûte continentale", "Le noyau", "Les sédiments"], a: 0 },
    { q: "Un anticorps est produit par…", opts: ["Les hématies", "Les plasmocytes", "Les neurones", "Les plaquettes"], a: 1 },
  ],
  "SES": [
    { q: "Le PIB mesure…", opts: ["Le bien-être", "La production de richesses", "Le chômage", "L'inflation"], a: 1 },
    { q: "La mobilité sociale se mesure avec…", opts: ["Le taux de marge", "Les tables de mobilité", "Le PIB/habitant", "L'IDH"], a: 1 },
    { q: "Une externalité négative est…", opts: ["Un coût subi par un tiers", "Une taxe", "Un profit", "Une subvention"], a: 0 },
  ],
  "HGGSP": [
    { q: "La notion de « puissance » combine hard power et…", opts: ["Fair play", "Soft power", "Full power", "Slow power"], a: 1 },
    { q: "Le patrimoine mondial est géré par…", opts: ["L'OMC", "L'UNESCO", "L'OTAN", "Le FMI"], a: 1 },
  ],
  "Histoire-Géographie": [
    { q: "La Ve République naît en…", opts: ["1946", "1958", "1962", "1968"], a: 1 },
    { q: "La mondialisation met en réseau des…", opts: ["Territoires", "Monnaies uniquement", "Langues", "Climats"], a: 0 },
  ],
  "Enseignement scientifique": [
    { q: "L'effet de serre est dû à…", opts: ["L'ozone seul", "Certains gaz absorbant l'IR", "Le vent", "Les marées"], a: 1 },
    { q: "L'âge de la Terre est d'environ…", opts: ["4,5 millions d'années", "4,5 milliards d'années", "13,8 milliards d'années", "450 000 ans"], a: 1 },
  ],
  "Anglais (LVA)": [
    { q: "« I wish I ___ more time. »", opts: ["have", "had", "will have", "having"], a: 1 },
    { q: "Le present perfect se construit avec…", opts: ["will + BV", "have/has + participe passé", "was/were + -ing", "do + BV"], a: 1 },
    { q: "« By 2030, scientists ___ a solution. »", opts: ["will have found", "found", "find", "are finding"], a: 0 },
  ],
  "NSI": [
    { q: "La complexité d'une recherche dichotomique est…", opts: ["O(n)", "O(log n)", "O(n²)", "O(1)"], a: 1 },
    { q: "En Python, une liste est une structure…", opts: ["Immuable", "Mutable", "Triée par défaut", "De taille fixe"], a: 1 },
    { q: "En SQL, pour filtrer des lignes on utilise…", opts: ["SELECT", "WHERE", "JOIN", "ORDER BY"], a: 1 },
    { q: "Le protocole qui attribue les routes entre réseaux est…", opts: ["HTTP", "TCP", "IP (routage)", "SMTP"], a: 2 },
  ],
  "HLP": [
    { q: "« Les pouvoirs de la parole » : la rhétorique antique distingue logos, pathos et…", opts: ["Ethos", "Chaos", "Cosmos", "Topos"], a: 0 },
    { q: "« L'humanité en question » interroge notamment…", opts: ["Les séismes", "L'humain face à la technique", "La comptabilité", "Le droit fiscal"], a: 1 },
  ],
  "LLCE Anglais": [
    { q: "« Imaginaires » et « Rencontres » sont…", opts: ["Des romans", "Des thématiques du programme", "Des auteurs", "Des examens"], a: 1 },
    { q: "L'épreuve écrite de terminale comporte…", opts: ["Un QCM", "Synthèse de dossier + traduction/transposition", "Une dictée", "Un exposé"], a: 1 },
  ],
};

export const FICHES: Fiche[] = [
  { matiere: "Méthode", titre: "Réussir le Grand oral", contenu: "Structure gagnante : accroche (30 s) → problématique → 2-3 arguments illustrés → ouverture personnelle. Entraîne-toi debout, sans notes, 5 minutes chrono. Le jury évalue : qualité de l'oral, argumentation, interaction, lien avec ton projet. Astuce : prépare 5 questions probables et leurs réponses." },
  { matiere: "Philosophie", titre: "La dissertation en 4 heures", contenu: "1) Analyse du sujet (20 min) : définis chaque terme, dégage le paradoxe. 2) Problématique + plan en 3 parties (thèse / antithèse / dépassement). 3) Rédaction (3 h) : une idée = un paragraphe = un exemple ou une référence. 4) Relecture (15 min). Jamais de « je pense que » : argumente." },
  { matiere: "Mathématiques", titre: "Réflexes de l'épreuve de spécialité", contenu: "Lis tout le sujet avant de commencer et démarre par l'exercice le plus sûr. Rédige chaque justification (« d'après le théorème… »). Vérifie les ordres de grandeur. Les questions « Montrer que » donnent le résultat : sers-t'en pour la suite même si tu bloques." },
  { matiere: "Histoire-Géographie", titre: "Le croquis qui rapporte des points", contenu: "TOLE : Titre, Orientation, Légende organisée (3 parties), Écriture soignée. La légende se construit AVANT le dessin. Nomenclature : mers en bleu, villes en noir horizontal. Un croquis propre et hiérarchisé vaut mieux qu'un croquis surchargé." },
  { matiere: "Langues", titre: "Progresser à l'oral en 15 min/jour", contenu: "Routine : 5 min d'écoute (podcast VO) → 5 min de shadowing (répéter à voix haute) → 5 min de résumé oral improvisé. Note 5 mots nouveaux/jour dans une liste par thème (environnement, identités, territoire…) : ce sont les axes du programme." },
  { matiere: "Méthode", titre: "Planifier ses révisions sans s'épuiser", contenu: "Règle 40/10 : 40 min de travail profond, 10 min de pause. Priorise par coefficient × écart à l'objectif (c'est exactement ce que calcule ton Coach IA). Révise le soir ce que tu as appris le matin (courbe de l'oubli). Le sommeil est une séance de révision : 7 h 30 minimum." },
  { matiere: "SES", titre: "L'EC3 : le raisonnement qui rapporte", contenu: "L'épreuve composée partie 3 (10 pts) exige : mobiliser le dossier documentaire (chaque document cité au moins une fois), des mécanismes explicités (« donc… ce qui entraîne… »), et des connaissances personnelles. Structure : introduction avec annonce du raisonnement, 2-3 paragraphes AEI (Affirmation, Explication, Illustration), conclusion courte." },
  { matiere: "Physique-Chimie", titre: "L'analyse dimensionnelle, ton filet de sécurité", contenu: "Avant tout calcul numérique, vérifie l'homogénéité de ta formule : une vitesse est en m·s⁻¹, une énergie en J = kg·m²·s⁻². Si les unités ne collent pas, la formule est fausse — tu viens d'éviter de perdre les points. Réflexe bonus : encadre tes résultats et donne toujours l'unité et le bon nombre de chiffres significatifs." },
];

export const ANNALES: Annale[] = [
  { matiere: "Mathématiques (spé)", duree: "4 h", format: "4 exercices indépendants (analyse, géométrie dans l'espace, probabilités, suites/fonctions). Calculatrice en mode examen.", conseil: "Vise 100 % sur les questions d'application directe avant les questions ouvertes." },
  { matiere: "Physique-Chimie (spé)", duree: "3 h 30 + 1 h d'ECE", format: "3 exercices mêlant chimie et physique + évaluation expérimentale (ECE) comptant pour 5 points.", conseil: "Les ECE se préparent en refaisant les protocoles types : verrerie, incertitudes, schémas." },
  { matiere: "SVT (spé)", duree: "3 h 30 + 1 h d'ECE", format: "Exercice 1 : question de synthèse. Exercice 2 : exploitation de documents. + ECE.", conseil: "La synthèse se plane comme une mini-dissertation : intro avec problème scientifique, schéma-bilan final." },
  { matiere: "SES (spé)", duree: "4 h", format: "Au choix : dissertation avec dossier OU épreuve composée (mobilisation de connaissances + étude de document + raisonnement).", conseil: "Entraîne-toi aux deux formats jusqu'en avril, puis spécialise-toi sur ton point fort." },
  { matiere: "HGGSP (spé)", duree: "4 h", format: "Une dissertation + une étude critique de document(s).", conseil: "Apprends 2 exemples précis et datés par axe de chaque thème : c'est ce qui différencie une copie à 12 d'une copie à 16." },
  { matiere: "NSI (spé)", duree: "3 h 30 + ECE", format: "3 exercices écrits (structures de données, BDD/SQL, algorithmique, réseaux) + épreuve pratique sur machine.", conseil: "La banque officielle des sujets d'épreuve pratique est publiée chaque année : refais-les tous." },
  { matiere: "HLP (spé)", duree: "4 h", format: "Interprétation d'un texte + essai philosophique ou littéraire, sur les thèmes du programme.", conseil: "Constitue un carnet de citations croisées littérature/philosophie par thème." },
  { matiere: "LLCE (spé)", duree: "3 h 30 + oral", format: "Synthèse d'un dossier en langue + traduction ou transposition, puis épreuve orale sur dossier personnel.", conseil: "Ton dossier oral doit raconter un parcours cohérent : choisis des œuvres que tu aimes vraiment." },
  { matiere: "Philosophie", duree: "4 h", format: "Au choix : 2 sujets de dissertation ou 1 explication de texte.", conseil: "Décide de ton format fétiche dès janvier et fais-en un par quinzaine en temps réel." },
  { matiere: "Grand oral", duree: "20 min (+20 min de préparation)", format: "5 min de présentation d'une question, 10 min d'échange avec le jury, 5 min sur ton projet d'orientation.", conseil: "Filme-toi : le non-verbal (posture, regard, débit) compte autant que le fond." },
];
