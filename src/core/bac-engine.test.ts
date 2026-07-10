import { describe, it, expect } from "vitest";
import { buildSubjects, computeResults, mention } from "./bac-engine";
import type { StudentProfile } from "./bac-engine";

const base: StudentProfile = {
  id: "t", prenom: "Test", academie: "Guyane", session: 2026,
  statut: "scolaire", voie: "generale",
  spe1: "Mathématiques", spe2: "Physique-Chimie", spe3: "SVT",
  objectif: 12, heuresSemaine: 8, notes: {}, rectorat: {}, quizHistory: [],
};

describe("buildSubjects — coefficients officiels", () => {
  it("voie générale : total 100 (60 EF + 40 CC)", () => {
    const s = buildSubjects(base);
    expect(s.reduce((a, x) => a + x.coef, 0)).toBe(100);
    expect(s.filter((x) => x.type === "EF").reduce((a, x) => a + x.coef, 0)).toBe(60);
    expect(s.filter((x) => x.type === "CC").reduce((a, x) => a + x.coef, 0)).toBe(40);
  });
  it("voie générale : philo 8, grand oral 10, spés 16", () => {
    const s = buildSubjects(base);
    expect(s.find((x) => x.id === "philo")!.coef).toBe(8);
    expect(s.find((x) => x.id === "go")!.coef).toBe(10);
    expect(s.find((x) => x.id === "spe1")!.coef).toBe(16);
  });
  it("voie technologique : philo 4, grand oral 14, total 100", () => {
    const s = buildSubjects({ ...base, voie: "techno", serie: "STMG" });
    expect(s.find((x) => x.id === "philo")!.coef).toBe(4);
    expect(s.find((x) => x.id === "go")!.coef).toBe(14);
    expect(s.reduce((a, x) => a + x.coef, 0)).toBe(100);
  });
  it("candidat individuel : mêmes coefficients (évaluations ponctuelles)", () => {
    const a = buildSubjects(base).reduce((s, x) => s + x.coef, 0);
    const b = buildSubjects({ ...base, statut: "individuel" }).reduce((s, x) => s + x.coef, 0);
    expect(a).toBe(b);
  });
});

describe("mention — seuils officiels", () => {
  it("applique les bons seuils", () => {
    expect(mention(9)!.short).toBe("Rattrapage");
    expect(mention(10)!.short).toBe("Admis");
    expect(mention(12)!.short).toBe("AB");
    expect(mention(14)!.short).toBe("B");
    expect(mention(16)!.short).toBe("TB");
    expect(mention(18)!.short).toBe("TB ★");
    expect(mention(7.9)!.short).toBe("Refusé");
  });
});

describe("computeResults — calcul des points", () => {
  it("moyenne pondérée exacte sur les coefficients renseignés", () => {
    const p = { ...base, notes: { philo: 12, go: 15 } }; // coefs 8 et 10
    const r = computeResults(p);
    // (12×8 + 15×10) / 18 = 246/18 = 13,666…
    expect(r.pointsAcquis).toBeCloseTo(246, 1);
    expect(r.moyenne!).toBeCloseTo(246 / 18, 4);
    expect(r.coefDone).toBe(18);
    expect(r.coefTotal).toBe(100);
  });
  it("note 14 partout ⇒ moyenne 14, mention Bien, 2800 points projetés... /2000 ramené", () => {
    const p = { ...base, notes: Object.fromEntries(buildSubjects(base).map((s) => [s.id, 14])) };
    const r = computeResults(p);
    expect(r.moyenne).toBe(14);
    expect(r.mention!.short).toBe("B");
    expect(r.totalProjete).toBe(1400); // 14 × 100 coefficients
  });
  it("points manquants vers l'objectif", () => {
    const p = { ...base, objectif: 12, notes: { spe1: 10 } }; // 160 pts acquis, cible 1200
    const r = computeResults(p);
    expect(r.ptsCible).toBe(1200);
    expect(r.ptsManquants).toBe(1040);
  });
});
