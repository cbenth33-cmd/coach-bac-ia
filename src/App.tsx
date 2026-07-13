import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ReferenceLine, LabelList,
} from "recharts";
import {
  GraduationCap, LayoutDashboard, PenLine, Sparkles, CalendarDays,
  ListChecks, BookOpen, BarChart3, Building2, Plus, ChevronRight,
  ChevronLeft, Trash2, Check, Target, AlertTriangle, TrendingUp,
  Clock, FileText, User, X, Award, Flame, MessageCircle, Send, FolderOpen,
  Sun, Moon, CalendarPlus, ExternalLink, Menu, Settings, Lock, Download,
} from "lucide-react";

import { computeResults, mention, OBJECTIFS } from "./core/bac-engine";
import type { StudentProfile } from "./core/bac-engine";
import { coachAnalysis, buildPlanning } from "./coach/analysis";
import { ACADEMIES, SESSIONS, SPES_GENERALE, SERIES_TECHNO, rectoratItems } from "./data/referentiels";
import { QUIZ, FICHES, ANNALES } from "./data/contenu";
import { store } from "./lib/storage";
import type { AppState } from "./lib/storage";
import { askCoach, buildSystemPrompt } from "./lib/claude";
import { supabase, cloudLoad, cloudSave } from "./lib/supabase";
import { downloadIcs } from "./lib/ics";
import Ulysse from "./ui/Ulysse";
import type { Session } from "@supabase/supabase-js";
import type { ChatMessage } from "./lib/claude";


/* ================================================================
   COACH BAC IA — v2 (refonte design)
   Architecture modulaire : core (moteur bac) / coach / data / ui
   Le design system (tokens clair/sombre) vit dans index.css.
   ================================================================ */

/* ---------- thème clair / sombre ---------- */
type Theme = "light" | "dark";
const getTheme = (): Theme =>
  typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light";
const applyTheme = (t: Theme) => {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem("coachbac_theme", t); } catch { /* stockage indisponible */ }
};

/* Couleurs des graphiques (le SVG recharts ne lit pas les variables CSS en attribut) */
const CHART: Record<Theme, { grid: string; axis: string; ok: string; bar: string; ref: string; label: string; tipBg: string; tipBorder: string; tipText: string }> = {
  light: { grid: "#E3E6F2", axis: "#5F6890", ok: "#0E8A57", bar: "#FFD449", ref: "#CF3E2C", label: "#171F3D", tipBg: "#FFFFFF", tipBorder: "#E3E6F2", tipText: "#171F3D" },
  dark: { grid: "#2A3156", axis: "#929AC0", ok: "#45D695", bar: "#FFD44D", ref: "#FF8B77", label: "#EDF0FC", tipBg: "#1F2643", tipBorder: "#2A3156", tipText: "#EDF0FC" },
};

/* ---------- données dérivées pour le tableau de bord ----------
   Tout est calculé à partir du profil existant (quizHistory, notes,
   rectorat) : aucune donnée nouvelle n'est stockée. */
function computeStreak(hist: { date: number }[] = []): number {
  const days = new Set(hist.map((h) => new Date(h.date).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

function buildBadges(p: StudentProfile, res, streak: number) {
  const notes = res.rows.filter((r) => r.note != null).length;
  const quizzes = p.quizHistory || [];
  const rect = rectoratItems(p);
  const rectDone = rect.filter((i) => p.rectorat?.[i.id]).length;
  return [
    { id: "note1", icon: PenLine, label: "Première note", desc: "Saisis une note", on: notes >= 1 },
    { id: "quiz1", icon: ListChecks, label: "Premier quiz", desc: "Joue un quiz", on: quizzes.length >= 1 },
    { id: "streak3", icon: Flame, label: "3 jours de suite", desc: "Révise 3 jours d'affilée", on: streak >= 3 },
    { id: "sansfaute", icon: Sparkles, label: "Sans-faute", desc: "100 % à un quiz", on: quizzes.some((q) => q.score === q.total) },
    { id: "dossier", icon: Target, label: "Dossier complet", desc: "Toutes les notes saisies", on: notes === res.rows.length },
    { id: "objectif", icon: Award, label: "Objectif atteint", desc: `Moyenne ≥ ${res.target}/20`, on: res.moyenne != null && res.moyenne >= res.target },
    { id: "admin", icon: Building2, label: "Démarches à jour", desc: "Rectorat 100 % validé", on: rect.length > 0 && rectDone === rect.length },
  ];
}

/* ================================================================
   UI — composants
   ================================================================ */
const Card = ({ children, className = "", style = {} }) => (
  <div className={`cb-card ${className}`} style={style}>{children}</div>
);
const Tag = ({ children, tone = "encre" }) => {
  const map = { encre: "cb-tag-ink", menthe: "cb-tag-mint", corail: "cb-tag-coral", fluo: "cb-tag-accent" };
  return <span className={`cb-tag ${map[tone]}`}>{children}</span>;
};
const Btn = ({ children, onClick, variant = "primary", disabled = false, className = "" }:
  { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "fluo" | "ghost" | "danger"; disabled?: boolean; className?: string }) => {
  const map = { primary: "cb-btn-primary", fluo: "cb-btn-accent", ghost: "cb-btn-ghost", danger: "cb-btn-danger" };
  return (
    <button onClick={onClick} disabled={disabled} className={`cb-btn ${map[variant]} ${className}`}>{children}</button>
  );
};
const Field = ({ label, children }) => (
  <label className="block mb-4">
    <span className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--muted)" }}>{label}</span>
    {children}
  </label>
);
const Select = ({ value, onChange, options, placeholder }:
  { value?: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) => (
  <select value={value || ""} onChange={(e) => onChange(e.target.value)}
    className="cb-input" style={{ color: value ? undefined : "var(--muted)" }}>
    <option value="" disabled>{placeholder || "Choisir…"}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);
const Progress = ({ value, color = "var(--accent)", track }: { value: number; color?: string; track?: string }) => (
  <div className="cb-bar" style={track ? { background: track } : undefined}>
    <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
  </div>
);
const Logo = ({ size = 36 }: { size?: number }) => (
  <div className="rounded-xl flex items-center justify-center shrink-0"
    style={{ width: size, height: size, background: "var(--hero)", boxShadow: "var(--shadow)" }}>
    <GraduationCap size={size * 0.52} color="#FFD449" aria-hidden />
  </div>
);

/* ---------- Onboarding : création de profil ---------- */
function Onboarding({ onDone, onCancel, canCancel }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ prenom: "", academie: "", session: 2026, statut: "scolaire", voie: "generale", serie: "STMG", spe1: "", spe2: "", spe3: "", lva: "Anglais", lvb: "Espagnol", objectif: 12, heuresSemaine: 8 });
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const steps = ["Identité", "Examen", "Parcours", "Objectif"];
  const g = f.voie === "generale";
  const canNext = [f.prenom.trim(), f.academie, g ? f.spe1 && f.spe2 && f.spe1 !== f.spe2 : f.serie, true][step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg cb-fade">
        <div className="flex items-center gap-3 mb-6">
          <Logo size={44} />
          <div>
            <div className="cb-display font-extrabold text-lg leading-none">Coach Bac IA</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>Nouveau profil élève</div>
          </div>
          {canCancel && (
            <button onClick={onCancel} className="ml-auto p-2 rounded-lg" aria-label="Annuler la création de profil">
              <X size={18} color="var(--muted)" />
            </button>
          )}
        </div>
        <div className="flex gap-1.5 mb-5" role="list" aria-label="Étapes">
          {steps.map((s, i) => (
            <div key={s} className="flex-1" role="listitem" aria-current={i === step ? "step" : undefined}>
              <div className="h-1.5 rounded-full transition-colors" style={{ background: i <= step ? "var(--accent)" : "var(--border)" }} />
              <div className="text-[10px] mt-1 font-semibold" style={{ color: i === step ? "var(--text)" : "var(--muted)" }}>{s}</div>
            </div>
          ))}
        </div>
        <Card className="cb-pop">
          {step === 0 && (<>
            <div className="flex items-center gap-3 mb-4">
              <Ulysse size={64} mood="content" title="Coach Ulysse te souhaite la bienvenue" />
              <h2 className="cb-display font-bold text-xl">Qui prépare <span className="cb-hl">le bac</span> ?</h2>
            </div>
            <Field label="Prénom de l'élève">
              <input value={f.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="Ex. Diyiah" className="cb-input" />
            </Field>
          </>)}
          {step === 1 && (<>
            <h2 className="cb-display font-bold text-xl mb-4">Ton examen</h2>
            <Field label="Académie"><Select value={f.academie} onChange={(v) => set("academie", v)} options={ACADEMIES} placeholder="Ex. Guyane, Bordeaux, Paris…" /></Field>
            <Field label="Session du bac"><Select value={String(f.session)} onChange={(v) => set("session", Number(v))} options={SESSIONS.map(String)} /></Field>
            <Field label="Statut du candidat">
              <div className="grid grid-cols-2 gap-2">
                {[["scolaire", "Candidat scolaire", "Inscrit dans un lycée"], ["individuel", "Candidat individuel", "Candidat libre / CNED"]].map(([id, t, d]) => (
                  <button key={id} onClick={() => set("statut", id)} className="cb-option" aria-pressed={f.statut === id}>
                    <div className="font-bold text-sm">{t}</div><div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{d}</div>
                  </button>
                ))}
              </div>
            </Field>
          </>)}
          {step === 2 && (<>
            <h2 className="cb-display font-bold text-xl mb-4">Ton parcours</h2>
            <Field label="Voie">
              <div className="grid grid-cols-2 gap-2">
                {[["generale", "Générale"], ["techno", "Technologique"]].map(([id, t]) => (
                  <button key={id} onClick={() => set("voie", id)} className="cb-option text-center font-bold text-sm" aria-pressed={f.voie === id}>{t}</button>
                ))}
              </div>
            </Field>
            {g ? (<>
              <Field label="Spécialité 1 (terminale · coef 16)"><Select value={f.spe1} onChange={(v) => set("spe1", v)} options={SPES_GENERALE} /></Field>
              <Field label="Spécialité 2 (terminale · coef 16)"><Select value={f.spe2} onChange={(v) => set("spe2", v)} options={SPES_GENERALE.filter((s) => s !== f.spe1)} /></Field>
              <Field label="Spécialité abandonnée en 1re (coef 8)"><Select value={f.spe3} onChange={(v) => set("spe3", v)} options={SPES_GENERALE.filter((s) => s !== f.spe1 && s !== f.spe2)} /></Field>
            </>) : (<>
              <Field label="Série technologique"><Select value={f.serie} onChange={(v) => { set("serie", v); const s = SERIES_TECHNO[v]; setF((p) => ({ ...p, serie: v, spe1: s.spes[0], spe2: s.spes[1], spe3: s.spe1ere })); }} options={Object.keys(SERIES_TECHNO)} /></Field>
              {f.serie && <div className="text-xs p-3 rounded-xl mb-3 cb-tag-accent" style={{ display: "block" }}>Spécialités {f.serie} : {SERIES_TECHNO[f.serie].spes.join(" · ")}</div>}
            </>)}
            <div className="grid grid-cols-2 gap-3">
              <Field label="LVA"><Select value={f.lva} onChange={(v) => set("lva", v)} options={["Anglais", "Espagnol", "Allemand", "Portugais", "Italien", "Créole", "Autre"]} /></Field>
              <Field label="LVB"><Select value={f.lvb} onChange={(v) => set("lvb", v)} options={["Espagnol", "Anglais", "Allemand", "Portugais", "Italien", "Créole", "Autre"]} /></Field>
            </div>
          </>)}
          {step === 3 && (<>
            <div className="flex items-center gap-3 mb-4">
              <Ulysse size={64} mood="encourageant" title="Coach Ulysse t'encourage" />
              <h2 className="cb-display font-bold text-xl">Ton <span className="cb-hl">objectif</span></h2>
            </div>
            <Field label="Je vise…">
              <div className="grid grid-cols-2 gap-2">
                {OBJECTIFS.map((o) => (
                  <button key={o.id} onClick={() => set("objectif", o.id)} className="cb-option" aria-pressed={f.objectif === o.id}>
                    <div className="font-bold text-sm">{o.label}</div><div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>≥ {o.seuil}/20</div>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Heures de révision disponibles par semaine">
              <input type="range" min="2" max="20" value={f.heuresSemaine} onChange={(e) => set("heuresSemaine", Number(e.target.value))}
                aria-valuetext={`${f.heuresSemaine} heures par semaine`} />
              <div className="text-center font-bold cb-display text-lg mt-2">{f.heuresSemaine} h / semaine</div>
            </Field>
          </>)}
          <div className="flex justify-between mt-5">
            <Btn variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft size={16} aria-hidden /> Retour</Btn>
            {step < 3
              ? <Btn variant="fluo" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continuer <ChevronRight size={16} aria-hidden /></Btn>
              : <Btn variant="fluo" onClick={() => onDone({ ...f, id: Date.now().toString(36), notes: {}, rectorat: {}, quizHistory: [] })}>Créer le profil <Check size={16} aria-hidden /></Btn>}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
const SEUILS_MENTIONS = [10, 12, 14, 16, 18];

function Dashboard({ p, res, go }) {
  const m = res.mention;
  const prog = Math.round((res.coefDone / res.coefTotal) * 100);
  const streak = computeStreak(p.quizHistory);
  const badges = buildBadges(p, res, streak);
  const earned = badges.filter((b) => b.on).length;
  const lastQuiz = (p.quizHistory || []).slice(-1)[0];
  const nextSeuil = res.moyenne != null ? SEUILS_MENTIONS.find((s) => res.moyenne < s) : null;
  const nextMention = nextSeuil ? mention(nextSeuil) : null;
  const ptsNext = nextSeuil != null && res.totalProjete != null
    ? Math.max(0, Math.ceil(nextSeuil * res.coefTotal - res.totalProjete)) : null;
  const parMatiere = res.rows.filter((r) => r.note != null).sort((a, b) => b.coef - a.coef).slice(0, 6);
  const shortcuts = [
    { id: "quiz", label: "Quiz", icon: ListChecks },
    { id: "fiches", label: "Fiches", icon: BookOpen },
    { id: "annales", label: "Annales", icon: FolderOpen },
    { id: "chat", label: "Chat coach", icon: MessageCircle },
  ];
  const tiles = [
    { icon: Flame, color: "var(--danger)", soft: "var(--danger-soft)", value: streak, suffix: streak > 1 ? " jours" : " jour", label: "Série de révision" },
    { icon: Target, color: "var(--success)", soft: "var(--success-soft)", value: `${res.target}/20`, label: `Objectif (${mention(res.target)?.short})` },
    { icon: Award, color: "var(--on-accent)", soft: "var(--accent-soft)", value: res.totalProjete ?? "—", suffix: "/2000", label: "Total projeté" },
    { icon: Clock, color: "var(--text-2)", soft: "var(--surface-2)", value: `${p.heuresSemaine} h`, label: "Révisions / semaine" },
  ];
  return (
    <div className="space-y-5 cb-fade">
      {/* Progression générale */}
      <section className="cb-hero" aria-label="Moyenne générale projetée">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <div className="text-sm font-bold" style={{ color: "var(--hero-muted)" }}>Salut {p.prenom}</div>
            <div className="cb-tag mt-1.5" style={{ background: "var(--track)", color: "#fff" }}>
              <Flame size={13} color="var(--accent)" aria-hidden /> {streak > 0 ? `${streak} j de suite` : "Lance ta série !"}
            </div>
          </div>
          <div className="shrink-0 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.22), transparent)", padding: 8 }}>
            <Ulysse size={72} mood={res.moyenne != null && res.moyenne >= res.target ? "fier" : streak > 0 ? "content" : "encourageant"}
              title={`Coach Ulysse ${res.moyenne != null && res.moyenne >= res.target ? "est fier de toi" : "t'encourage"}`} />
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Moyenne générale projetée</div>
            <div className="cb-display font-extrabold text-6xl leading-none">
              {res.moyenne != null ? res.moyenne.toFixed(2) : "—"}<span className="text-2xl font-bold" style={{ color: "var(--hero-muted)" }}>/20</span>
            </div>
          </div>
          <div className="flex-1 min-w-40">
            {m && <div className="inline-block px-3 py-1.5 rounded-lg font-bold text-sm mb-2" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>{m.label}</div>}
            <div className="text-xs" style={{ color: "var(--hero-muted)" }}>{res.pointsAcquis} points acquis · {res.coefDone}/{res.coefTotal} coefficients renseignés</div>
            <div className="mt-2"><Progress value={prog} track="var(--track)" /></div>
          </div>
        </div>
      </section>

      {/* Raccourcis vers les exercices */}
      <section aria-label="Raccourcis">
        <div className="grid grid-cols-4 gap-2.5">
          {shortcuts.map((s) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => go(s.id)} className="cb-quick">
                <span className="cb-quick-ico"><Icon size={20} aria-hidden /></span>{s.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <Card key={t.label}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: t.soft }}>
                <Icon size={17} color={t.color} aria-hidden />
              </div>
              <div className="cb-display font-extrabold text-2xl leading-tight">{t.value}{t.suffix && <span className="text-sm font-bold" style={{ color: "var(--muted)" }}>{t.suffix}</span>}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{t.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Prochain objectif + dernière activité */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="cb-display font-bold mb-2 flex items-center gap-2"><Target size={16} color="var(--success)" aria-hidden /> Prochain objectif</h3>
          {res.moyenne == null
            ? <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Saisis tes premières notes : ton prochain palier de mention s'affichera ici.</p>
            : nextMention
              ? (<>
                <p className="text-sm leading-relaxed">Prochain palier : <b>{nextMention.label}</b> (≥ {nextSeuil}/20).</p>
                {ptsNext != null && <p className="text-sm mt-1" style={{ color: "var(--text-2)" }}>Il te manque <b style={{ color: "var(--danger)" }}>{ptsNext} points</b> sur ton total projeté — vise d'abord tes matières à coefficient 16.</p>}
                <div className="mt-3"><Progress value={Math.min(100, (res.moyenne / (nextSeuil as number)) * 100)} color="var(--success)" /></div>
              </>)
              : <p className="text-sm font-medium" style={{ color: "var(--success)" }}>Palier maximal atteint — félicitations, maintiens le cap jusqu'à l'examen !</p>}
        </Card>
        <Card>
          <h3 className="cb-display font-bold mb-2 flex items-center gap-2"><ListChecks size={16} aria-hidden /> Dernière session</h3>
          {lastQuiz
            ? (<>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm flex-1">{lastQuiz.subj}</span>
                <Tag tone={lastQuiz.score / lastQuiz.total >= 0.6 ? "menthe" : "corail"}>{lastQuiz.score}/{lastQuiz.total}</Tag>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                Quiz du {new Date(lastQuiz.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </p>
              <Btn variant="fluo" className="mt-3" onClick={() => go("quiz")}>Rejouer un quiz</Btn>
            </>)
            : (<>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Aucun quiz joué pour l'instant — 5 minutes suffisent pour lancer ta série.</p>
              <Btn variant="fluo" className="mt-3" onClick={() => go("quiz")}>Lancer mon premier quiz</Btn>
            </>)}
        </Card>
      </div>

      {/* Progression par matière */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="cb-display font-bold">Progression par matière</h3>
          <button onClick={() => go("stats")} className="text-xs font-bold rounded-md px-1" style={{ color: "var(--text)" }}>Tout voir →</button>
        </div>
        {parMatiere.length === 0
          ? <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Saisis tes notes dans l'onglet <b>Notes</b> pour suivre chaque matière ici.</p>
          : (
            <div className="space-y-2.5">
              {parMatiere.map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <div className="text-sm font-semibold flex-1 truncate">{r.nom}</div>
                  <div className="flex-1"><Progress value={(r.note / 20) * 100} color={r.note >= res.target ? "var(--success)" : "var(--accent)"} /></div>
                  <div className="text-sm font-bold w-12 text-right">{r.note}/20</div>
                </div>
              ))}
            </div>
          )}
      </Card>

      {/* Badges */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="cb-display font-bold">Badges</h3>
            {earned > 0 && <Ulysse size={30} mood="fier" title="Ulysse félicite" />}
          </div>
          <Tag tone="fluo">{earned}/{badges.length}</Tag>
        </div>
        <div className="flex gap-2.5 overflow-x-auto cb-scroll -mx-1 px-1 pb-1" role="list" aria-label="Badges">
          {badges.map((b) => {
            const Icon = b.on ? b.icon : Lock;
            return (
              <div key={b.id} role="listitem" className={`cb-badge ${b.on ? "" : "is-locked"}`}>
                <span className="cb-badge-ico"><Icon size={18} aria-hidden /></span>
                <span className="text-xs font-bold leading-tight">{b.label}</span>
                <span className="text-[10px] leading-tight" style={{ color: "var(--muted)" }}>{b.desc}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Prochaines actions + Rectorat */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="cb-display font-bold">Prochaines actions</h3>
            <button onClick={() => go("coach")} className="text-xs font-bold rounded-md px-1" style={{ color: "var(--text)" }}>Coach IA →</button>
          </div>
          {res.moyenne == null
            ? <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>Saisis tes premières notes dans l'onglet <b>Notes</b> : le coach analysera immédiatement tes points forts et tes priorités.</p>
            : <CoachTeaser p={p} res={res} />}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="cb-display font-bold">Suivi Rectorat</h3>
            <button onClick={() => go("rectorat")} className="text-xs font-bold rounded-md px-1" style={{ color: "var(--text)" }}>Tout voir →</button>
          </div>
          <RectoratTeaser p={p} />
        </Card>
      </div>
    </div>
  );
}
function CoachTeaser({ p, res }) {
  const a = coachAnalysis(p, res);
  if (a.weak.length === 0) return <p className="text-sm font-medium" style={{ color: "var(--success)" }}>Toutes tes matières notées sont au-dessus de ton objectif. Consolide et vise la mention supérieure !</p>;
  return (
    <ul className="space-y-2">
      {a.weak.slice(0, 3).map((w) => (
        <li key={w.id} className="flex items-center gap-2 text-sm p-2 rounded-xl cb-row">
          <AlertTriangle size={15} color="var(--danger)" className="shrink-0" aria-hidden />
          <span className="font-semibold flex-1 truncate">{w.nom}</span>
          <Tag tone="corail">{w.note}/20 · coef {w.coef}</Tag>
        </li>
      ))}
    </ul>
  );
}
function RectoratTeaser({ p }) {
  const items = rectoratItems(p);
  const done = items.filter((i) => p.rectorat?.[i.id]).length;
  const next = items.find((i) => !p.rectorat?.[i.id]);
  return (
    <div>
      <div className="text-sm mb-2"><b>{done}/{items.length}</b> démarches validées</div>
      <div className="mb-3"><Progress value={(done / items.length) * 100} color="var(--success)" /></div>
      {next && <div className="text-sm p-3 rounded-xl" style={{ background: "var(--accent-soft)" }}><b>À faire :</b> {next.titre} <span style={{ color: "var(--muted)" }}>· {next.date}</span></div>}
    </div>
  );
}

/* ---------- Notes ---------- */
function Notes({ p, res, update }) {
  const setNote = (id, v) => {
    const n = v === "" ? null : Math.max(0, Math.min(20, Number(v)));
    update({ ...p, notes: { ...p.notes, [id]: v === "" ? null : n } });
  };
  const groups = [["EF", "Épreuves finales · 60 % de la note"], ["CC", p.statut === "individuel" ? "Évaluations ponctuelles · 40 % (candidat individuel)" : "Contrôle continu · 40 % de la note"]];
  return (
    <div className="space-y-4 cb-fade">
      {p.statut === "individuel" && (
        <div className="text-sm p-3 rounded-xl flex gap-2 items-start" style={{ background: "var(--accent-soft)" }}>
          <FileText size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>Candidat individuel : le contrôle continu est remplacé par des <b>évaluations ponctuelles</b> aux mêmes coefficients. Saisis tes notes ou tes estimations.</span>
        </div>
      )}
      {groups.map(([type, label]) => {
        const rows = res.rows.filter((r) => r.type === type);
        const filled = rows.filter((r) => r.note != null).length;
        return (
          <Card key={type}>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <h3 className="cb-display font-bold">{label}</h3>
              <Tag tone={filled === rows.length ? "menthe" : "encre"}>{filled}/{rows.length} renseignées</Tag>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Saisis tes moyennes ou notes de bacs blancs sur 20 — les calculs sont instantanés.</p>
            <div className="space-y-2">
              {rows.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-2.5 cb-row">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{r.nom}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>Coefficient {r.coef}</div>
                  </div>
                  {r.note != null && <Tag tone={r.note >= res.target ? "menthe" : "corail"}>{(r.note * r.coef).toFixed(0)} pts</Tag>}
                  <input type="number" min="0" max="20" step="0.25" value={p.notes?.[r.id] ?? ""} placeholder="—"
                    onChange={(e) => setNote(r.id, e.target.value)} aria-label={`Note ${r.nom} sur 20`}
                    className="cb-input cb-note text-center font-bold" style={{
                      width: "5rem",
                      borderColor: r.note == null ? undefined : r.note >= res.target ? "var(--success)" : "var(--danger)",
                    }} />
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Coach IA ---------- */
function Coach({ p, res }) {
  const a = coachAnalysis(p, res);
  if (res.moyenne == null) return (
    <Card className="cb-fade flex items-center gap-4">
      <Ulysse size={72} mood="reflechi" title="Ulysse attend tes notes" />
      <p className="text-sm">Ulysse a besoin de tes notes pour travailler. Renseigne au moins une matière dans l'onglet <b>Notes</b>.</p>
    </Card>
  );
  return (
    <div className="space-y-4 cb-fade">
      <section className="cb-hero" aria-label="Analyse du coach">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2"><Sparkles size={18} color="var(--accent)" aria-hidden /><span className="cb-display font-bold">Analyse de Coach Ulysse</span></div>
          <Ulysse size={56} mood="concentre" />
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,.88)" }}>
          {p.prenom}, ta moyenne projetée est de <b style={{ color: "var(--accent)" }}>{res.moyenne.toFixed(2)}/20</b> ({res.mention.label.toLowerCase()}).
          {res.moyenne >= a.target
            ? ` Tu es au-dessus de ton objectif de ${a.target}/20 : la stratégie est de sécuriser tes acquis et de viser ${mention(Math.min(18, a.target + 2))?.short}.`
            : ` Il te manque ${res.ptsManquants} points pour atteindre ${a.target}/20. Bonne nouvelle : en concentrant tes ${p.heuresSemaine} h hebdomadaires sur ${Math.min(3, a.weak.length)} matières à fort coefficient, cet écart est rattrapable.`}
          {a.missing.length > 0 && ` ${a.missing.length} matière(s) restent sans note — renseigne-les pour affiner le plan.`}
        </p>
      </section>
      {a.advice.length > 0 && (
        <Card>
          <h3 className="cb-display font-bold mb-3">Plan de progression — <span className="cb-hl">priorités</span></h3>
          <div className="space-y-3">
            {a.advice.map((w, i) => (
              <div key={w.id} className="p-4 cb-row">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="cb-display font-extrabold text-lg" style={{ color: "var(--danger)" }}>P{i + 1}</span>
                  <span className="font-bold">{w.nom}</span>
                  <Tag tone="corail">{w.note}/20</Tag>
                  <Tag tone="fluo">+{w.gain.toFixed(0)} pts possibles</Tag>
                </div>
                <ul className="space-y-1">
                  {w.tips.map((t, j) => <li key={j} className="text-sm flex gap-2"><Check size={14} color="var(--success)" className="mt-0.5 shrink-0" aria-hidden />{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
      {a.strong.length > 0 && (
        <Card>
          <h3 className="cb-display font-bold mb-2 flex items-center gap-2"><TrendingUp size={16} color="var(--success)" aria-hidden /> Points forts à sécuriser</h3>
          <div className="flex flex-wrap gap-2">{a.strong.map((s) => <Tag key={s.id} tone="menthe">{s.nom} · {s.note}/20</Tag>)}</div>
        </Card>
      )}
      <Card>
        <h3 className="cb-display font-bold mb-2">Répartition conseillée de tes {p.heuresSemaine} h / semaine</h3>
        {a.alloc.length === 0 ? <p className="text-sm" style={{ color: "var(--muted)" }}>Aucune matière sous l'objectif : répartis ton temps librement, avec un accent sur les spécialités (coef 16).</p> : (
          <div className="space-y-2.5">
            {a.alloc.map((x) => (
              <div key={x.id} className="flex items-center gap-3">
                <div className="text-sm font-semibold flex-1 truncate">{x.nom}</div>
                <div className="flex-1"><Progress value={(x.heures / p.heuresSemaine) * 100} /></div>
                <div className="text-sm font-bold w-10 text-right">{x.heures} h</div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>Le planning détaillé jour par jour est généré dans l'onglet Planning.</p>
      </Card>
    </div>
  );
}

/* ---------- Planning ---------- */
function Planning({ p, res }) {
  const a = coachAnalysis(p, res);
  const week = buildPlanning(a.alloc, p.heuresSemaine);
  return (
    <div className="space-y-4 cb-fade">
      <Card>
        <h3 className="cb-display font-bold mb-1">Semaine type de révision — <span className="cb-hl">{p.heuresSemaine} h</span></h3>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Généré automatiquement à partir de tes priorités (coefficient × écart à l'objectif). Sessions de 1 h, règle 40 min de travail / 10 min de pause.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {week.map((d) => (
            <div key={d.jour} className="p-3 cb-row" style={{ minHeight: 90 }}>
              <div className="text-xs font-extrabold uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>{d.jour}</div>
              {d.sessions.length === 0
                ? <div className="text-xs italic" style={{ color: "var(--muted)" }}>Repos</div>
                : d.sessions.map((s, i) => <div key={i} className="text-xs font-semibold px-2 py-1.5 rounded-lg mb-1" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>{s}</div>)}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="cb-display font-bold mb-2">Les 3 règles du planning intelligent</h3>
        <ul className="text-sm space-y-1.5">
          <li className="flex gap-2"><Check size={15} color="var(--success)" className="mt-0.5 shrink-0" aria-hidden /><span><b>Espacement :</b> revois chaque notion à J+1, J+3, J+7 (courbe de l'oubli).</span></li>
          <li className="flex gap-2"><Check size={15} color="var(--success)" className="mt-0.5 shrink-0" aria-hidden /><span><b>Priorité coefficient :</b> 1 point gagné en spécialité vaut 16 points au bac.</span></li>
          <li className="flex gap-2"><Check size={15} color="var(--success)" className="mt-0.5 shrink-0" aria-hidden /><span><b>Récupération :</b> dimanche soir sans écran, 7 h 30 de sommeil minimum en période d'examen.</span></li>
        </ul>
      </Card>
    </div>
  );
}

/* ---------- Quiz ---------- */
function Quiz({ p, update }) {
  const [subj, setSubj] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const qs = subj ? QUIZ[subj] : [];
  const reset = () => { setSubj(null); setI(0); setScore(0); setPicked(null); setDone(false); };
  const answer = (idx) => {
    if (picked != null) return;
    setPicked(idx);
    const ok = idx === qs[i].a;
    if (ok) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 < qs.length) { setI(i + 1); setPicked(null); }
      else {
        setDone(true);
        const entry = { subj, score: score + (ok ? 1 : 0), total: qs.length, date: Date.now() };
        update({ ...p, quizHistory: [...(p.quizHistory || []), entry] });
      }
    }, 700);
  };
  if (!subj) return (
    <div className="cb-fade">
      <Card>
        <h3 className="cb-display font-bold mb-1">Quiz express</h3>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Choisis une matière — les scores alimentent tes statistiques.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.keys(QUIZ).map((s) => (
            <button key={s} onClick={() => setSubj(s)} className="cb-option font-bold text-sm">
              {s}<div className="text-xs font-medium mt-0.5" style={{ color: "var(--muted)" }}>{QUIZ[s].length} questions</div>
            </button>
          ))}
        </div>
        {(p.quizHistory || []).length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--muted)" }}>Derniers scores</div>
            <div className="flex flex-wrap gap-2">
              {p.quizHistory.slice(-6).reverse().map((h, k) => <Tag key={k} tone={h.score / h.total >= 0.6 ? "menthe" : "corail"}>{h.subj} · {h.score}/{h.total}</Tag>)}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
  if (done) {
    const pct = Math.round((score / qs.length) * 100);
    return (
      <Card className="cb-pop text-center">
        <div className="flex justify-center mb-2"><Ulysse size={88} mood={pct >= 60 ? "fier" : "encourageant"} title={pct >= 60 ? "Ulysse est fier de toi" : "Ulysse t'encourage"} /></div>
        <div className="cb-display font-extrabold text-5xl mb-1">{score}/{qs.length}</div>
        <div className="mb-4"><Tag tone={pct >= 60 ? "menthe" : "corail"}>{pct >= 80 ? "Excellent !" : pct >= 60 ? "Bien joué" : "À retravailler"}</Tag></div>
        <div className="flex justify-center gap-2">
          <Btn variant="ghost" onClick={reset}>Autre matière</Btn>
          <Btn variant="fluo" onClick={() => { setI(0); setScore(0); setPicked(null); setDone(false); }}>Rejouer</Btn>
        </div>
      </Card>
    );
  }
  const q = qs[i];
  return (
    <Card className="cb-fade">
      <div className="flex justify-between items-center mb-2">
        <Tag tone="fluo">{subj}</Tag>
        <span className="text-xs font-bold" style={{ color: "var(--muted)" }}>Question {i + 1}/{qs.length}</span>
      </div>
      <div className="mb-4"><Progress value={((i + (picked != null ? 1 : 0)) / qs.length) * 100} /></div>
      <h3 className="cb-display font-bold text-lg mb-4">{q.q}</h3>
      <div className="space-y-2">
        {q.opts.map((o, idx) => {
          const style: React.CSSProperties = {};
          if (picked != null) {
            if (idx === q.a) { style.borderColor = "var(--success)"; style.background = "var(--success-soft)"; }
            else if (idx === picked) { style.borderColor = "var(--danger)"; style.background = "var(--danger-soft)"; }
          }
          return (
            <button key={idx} onClick={() => answer(idx)} className="cb-option w-full font-semibold text-sm" style={style}>{o}</button>
          );
        })}
      </div>
      <div className="flex justify-center mt-3" aria-live="polite">
        <Ulysse size={64} mood={picked == null ? "concentre" : picked === q.a ? "fier" : "encourageant"}
          title={picked == null ? "Ulysse se concentre" : picked === q.a ? "Bonne réponse !" : "Ulysse t'encourage"} />
      </div>
      <button onClick={reset} className="text-xs font-bold mt-2 rounded-md" style={{ color: "var(--muted)" }}>← Quitter le quiz</button>
    </Card>
  );
}

/* ---------- Fiches ---------- */
function Fiches() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3 cb-fade">
      {FICHES.map((f, i) => (
        <Card key={i} style={{ borderLeft: "4px solid var(--accent)" }}>
          <button className="w-full text-left rounded-lg" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <div className="flex items-center gap-2 flex-wrap">
              <Tag tone="fluo">{f.matiere}</Tag>
              <span className="cb-display font-bold flex-1">{f.titre}</span>
              <ChevronRight size={16} aria-hidden style={{ transform: open === i ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
            </div>
          </button>
          {open === i && <p className="text-sm mt-3 leading-relaxed cb-fade" style={{ color: "var(--text-2)" }}>{f.contenu}</p>}
        </Card>
      ))}
      <Card>
        <h3 className="cb-display font-bold mb-1">Annales — <span className="cb-hl">structure des épreuves</span></h3>
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>Format officiel de chaque épreuve et le conseil qui fait la différence. Les sujets des sessions précédentes sont en libre accès sur les sites officiels (Eduscol, quandjepasselebac).</p>
        <div className="space-y-2">
          {ANNALES.map((a, i) => (
            <div key={i} className="p-3 cb-row">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">{a.matiere}</span>
                <Tag tone="encre">{a.duree}</Tag>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>{a.format}</p>
              <p className="text-xs mt-1.5 font-semibold flex gap-1.5"><Sparkles size={13} className="shrink-0 mt-0.5" color="var(--danger)" aria-hidden />{a.conseil}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="text-xs text-center" style={{ color: "var(--muted)" }}>Banque extensible — la synchronisation des sujets par académie arrive en phase 2 (base de données).</p>
    </div>
  );
}

/* ---------- Annales par épreuve, session et centre ---------- */
const SESSIONS_ANNALES = [2025, 2024, 2023, 2022];
const CENTRES = ["Métropole", "Antilles-Guyane", "Amérique du Nord", "Asie"];

function Annales({ p }: { p: StudentProfile }) {
  const [centre, setCentre] = useState(p.academie === "Guyane" || p.academie === "Guadeloupe" || p.academie === "Martinique" ? "Antilles-Guyane" : "Métropole");
  const search = (matiere: string, session: number) =>
    window.open("https://www.google.com/search?q=" + encodeURIComponent(`sujet corrigé bac ${session} ${matiere} ${centre} pdf`), "_blank", "noopener");
  return (
    <div className="space-y-4 cb-fade">
      <Card>
        <h3 className="cb-display font-bold mb-1">S'entraîner sur les <span className="cb-hl">vrais sujets</span></h3>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--muted)" }}>
          Choisis ton centre d'examen, puis une session : la recherche s'ouvre directement sur le sujet et son corrigé.
          Les sujets tombés en Antilles-Guyane sont ceux qui te ressemblent le plus si tu passes en Guyane.
        </p>
        <div className="flex flex-wrap gap-2 mb-1" role="group" aria-label="Centre d'examen">
          {CENTRES.map((c) => (
            <button key={c} onClick={() => setCentre(c)} aria-pressed={centre === c}
              className="cb-option text-xs font-bold" style={{ padding: "0.45rem 0.8rem" }}>
              {c}
            </button>
          ))}
        </div>
      </Card>
      {ANNALES.map((a, i) => (
        <Card key={i} style={{ borderLeft: "4px solid var(--accent)" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="cb-display font-bold flex-1">{a.matiere}</span>
            <Tag tone="encre">{a.duree}</Tag>
          </div>
          <p className="text-xs mt-1.5" style={{ color: "var(--text-2)" }}>{a.format}</p>
          <p className="text-xs mt-1.5 font-semibold flex gap-1.5"><Sparkles size={13} className="shrink-0 mt-0.5" color="var(--danger)" aria-hidden />{a.conseil}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {SESSIONS_ANNALES.map((s) => (
              <button key={s} onClick={() => search(a.matiere, s)}
                className="cb-btn cb-btn-ghost text-xs" style={{ padding: "0.45rem 0.8rem" }}>
                Session {s} <ExternalLink size={12} aria-hidden />
              </button>
            ))}
          </div>
        </Card>
      ))}
      <p className="text-xs text-center px-4" style={{ color: "var(--muted)" }}>
        Les sujets officiels sont en libre accès. Méthode : un sujet complet par semaine, chronométré, corrigé le lendemain.
      </p>
    </div>
  );
}

/* ---------- Stats ---------- */
function Stats({ p, res, theme }: { p: StudentProfile; res; theme: Theme }) {
  const c = CHART[theme];
  const data = res.rows.filter((r) => r.note != null).map((r) => ({ name: r.nom.length > 14 ? r.nom.slice(0, 13) + "…" : r.nom, note: r.note, coef: r.coef }));
  const radar = res.rows.filter((r) => r.note != null).slice(0, 8).map((r) => ({ subject: r.nom.split(" ")[0], note: r.note }));
  const tooltip = { background: c.tipBg, border: `1px solid ${c.tipBorder}`, borderRadius: 12, color: c.tipText, fontSize: 12 };
  if (data.length === 0) return (
    <Card className="cb-fade flex items-center gap-4">
      <Ulysse size={72} mood="reflechi" title="Ulysse attend tes notes" />
      <p className="text-sm">Les graphiques apparaîtront dès tes premières notes saisies.</p>
    </Card>
  );
  return (
    <div className="space-y-4 cb-fade">
      <Card>
        <h3 className="cb-display font-bold mb-3">Notes par matière vs objectif ({res.target}/20)</h3>
        <div style={{ height: Math.max(220, data.length * 42) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 11, fill: c.axis }} stroke={c.grid} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: c.axis }} stroke={c.grid} />
              <Tooltip formatter={(v, n, pr) => [`${v}/20 · coef ${pr.payload.coef}`, "Note"]} contentStyle={tooltip} cursor={{ fill: c.grid, opacity: 0.35 }} />
              <ReferenceLine x={res.target} stroke={c.ref} strokeDasharray="4 4" />
              <Bar dataKey="note" radius={[0, 6, 6, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.note >= res.target ? c.ok : c.bar} />)}
                <LabelList dataKey="note" position="right" style={{ fontSize: 11, fontWeight: 700, fill: c.label }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      {radar.length >= 3 && (
        <Card>
          <h3 className="cb-display font-bold mb-3">Profil d'équilibre</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke={c.grid} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: c.axis }} />
                <Radar dataKey="note" stroke={c.label} fill={c.bar} fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------- Rectorat ---------- */
function Rectorat({ p, update }) {
  const items = rectoratItems(p);
  const cats = [...new Set(items.map((i) => i.cat))];
  const toggle = (id) => update({ ...p, rectorat: { ...p.rectorat, [id]: !p.rectorat?.[id] } });
  const done = items.filter((i) => p.rectorat?.[i.id]).length;
  return (
    <div className="space-y-4 cb-fade">
      <section className="cb-hero" aria-label="Suivi des démarches">
        <div className="flex items-center gap-2 mb-1"><Building2 size={18} color="var(--accent)" aria-hidden /><span className="cb-display font-bold">Mode Rectorat — session {p.session}</span></div>
        <p className="text-sm" style={{ color: "var(--hero-muted)" }}>Académie de {p.academie} · candidat {p.statut === "scolaire" ? "scolaire" : "individuel"} · <b style={{ color: "var(--accent)" }}>{done}/{items.length}</b> démarches validées</p>
        <button onClick={() => downloadIcs(p)} className="cb-btn cb-btn-accent mt-3">
          <CalendarPlus size={15} aria-hidden /> Ajouter les échéances à mon calendrier
        </button>
        <p className="text-[11px] mt-2" style={{ color: "var(--hero-muted)" }}>Chaque échéance arrive dans ton téléphone avec un rappel 7 jours avant.</p>
      </section>
      {cats.map((cat) => (
        <Card key={cat}>
          <h3 className="cb-display font-bold mb-3">{cat}</h3>
          <div className="space-y-2">
            {items.filter((i) => i.cat === cat).map((it) => {
              const ok = !!p.rectorat?.[it.id];
              return (
                <div key={it.id} className="flex gap-3 p-3 rounded-xl transition-colors" style={{ background: ok ? "var(--success-soft)" : "var(--surface-2)" }}>
                  <button onClick={() => toggle(it.id)} className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5 transition-colors"
                    style={{ border: `2px solid ${ok ? "var(--success)" : "var(--muted)"}`, background: ok ? "var(--success)" : "transparent" }}
                    role="checkbox" aria-checked={ok} aria-label={`${it.titre} — ${ok ? "fait" : "à faire"}`}>
                    {ok && <Check size={14} color="#fff" aria-hidden />}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${ok ? "line-through opacity-60" : ""}`}>{it.titre}</span>
                      <Tag tone="fluo">{it.date}</Tag>
                    </div>
                    <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>{it.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <p className="text-xs text-center px-4" style={{ color: "var(--muted)" }}>Dates indicatives basées sur le calendrier national — vérifie toujours ta convocation et le site de l'académie de {p.academie}. Les notifications automatiques arrivent en phase 2.</p>
    </div>
  );
}

/* ---------- Compte : connexion et synchronisation ---------- */
function AccountCard({ session }: { session: Session | null }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  if (!supabase) return null;
  if (session)
    return (
      <Card style={{ borderColor: "var(--success)", borderWidth: 2 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <Check size={16} color="var(--success)" aria-hidden />
          <span className="font-bold text-sm flex-1">Connectée : {session.user.email}</span>
          <Btn variant="ghost" onClick={() => { void supabase!.auth.signOut(); }}>Se déconnecter</Btn>
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
          Tes profils et notes sont sauvegardés dans le cloud et te suivent sur tous tes appareils.
        </p>
      </Card>
    );
  return (
    <Card>
      <h3 className="cb-display font-bold mb-1">Sauvegarde <span className="cb-hl">multi-appareils</span></h3>
      <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--muted)" }}>
        Sans compte, tes données restent uniquement sur cet appareil. Avec un compte (gratuit), tu les retrouves partout — aucun mot de passe, un simple lien envoyé par email.
      </p>
      {sent ? (
        <p className="text-sm font-semibold p-3 rounded-xl" style={{ background: "var(--success-soft)", color: "var(--success)" }}>
          Lien envoyé à {email} — ouvre l'email sur cet appareil et appuie sur le lien pour te connecter.
        </p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="ton.email@exemple.fr"
            aria-label="Adresse email" className="cb-input flex-1 min-w-40" style={{ width: "auto" }} />
          <Btn variant="fluo" disabled={!email.includes("@")} onClick={() => {
            setErr("");
            void supabase!.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin + window.location.pathname } })
              .then(({ error }) => (error ? setErr("Envoi impossible : " + error.message) : setSent(true)));
          }}>Recevoir mon lien</Btn>
        </div>
      )}
      {err && <p className="text-xs mt-2 font-semibold" style={{ color: "var(--danger)" }}>{err}</p>}
    </Card>
  );
}

/* ---------- Profils ---------- */
function Profiles({ state, setState, onAdd }) {
  return (
    <div className="space-y-3 cb-fade">
      {state.profiles.map((pr) => {
        const r = computeResults(pr);
        return (
          <Card key={pr.id} className={pr.id === state.activeId ? "" : "opacity-80"} style={pr.id === state.activeId ? { borderColor: "var(--accent-strong)", borderWidth: 2 } : {}}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center cb-display font-extrabold text-lg shrink-0" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>{pr.prenom[0]?.toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{pr.prenom}</div>
                <div className="text-xs truncate" style={{ color: "var(--muted)" }}>Bac {pr.session} · {pr.academie} · {pr.voie === "generale" ? "Générale" : pr.serie}</div>
              </div>
              {r.moyenne != null && <Tag tone="fluo">{r.moyenne.toFixed(1)}/20</Tag>}
              {pr.id !== state.activeId && <Btn variant="ghost" onClick={() => setState((s) => ({ ...s, activeId: pr.id }))}>Activer</Btn>}
              {state.profiles.length > 1 && (
                <button onClick={() => { if (confirm(`Supprimer le profil de ${pr.prenom} ?`)) setState((s) => { const profiles = s.profiles.filter((x) => x.id !== pr.id); return { profiles, activeId: s.activeId === pr.id ? profiles[0].id : s.activeId }; }); }}
                  className="p-2 rounded-lg" aria-label={`Supprimer le profil de ${pr.prenom}`}><Trash2 size={16} color="var(--danger)" aria-hidden /></button>
              )}
            </div>
          </Card>
        );
      })}
      <Btn variant="fluo" onClick={onAdd} className="w-full"><Plus size={16} aria-hidden /> Ajouter un profil élève</Btn>
    </div>
  );
}

/* ---------- Chat Coach (API Claude) ---------- */
function Chat({ p, res }) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const suggestions = [
    "Fais-moi un plan de révision pour les 2 prochaines semaines",
    "Comment remonter ma pire matière ?",
    "Prépare-moi 3 questions probables pour le Grand oral",
    "Quelle mention est réaliste pour moi ?",
  ];
  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    const hist: ChatMessage[] = [...msgs, { role: "user" as const, content }];
    setMsgs(hist); setInput(""); setBusy(true);
    try {
      const reply = await askCoach(buildSystemPrompt(p, res), hist);
      setMsgs([...hist, { role: "assistant", content: reply }]);
    } catch {
      setMsgs([...hist, { role: "assistant", content: "Connexion au coach momentanément impossible. Vérifie ta connexion et réessaie." }]);
    }
    setBusy(false);
  };
  return (
    <div className="cb-fade flex flex-col" style={{ minHeight: "60vh" }}>
      <Card className="flex-1 flex flex-col" style={{ minHeight: "55vh" }}>
        <div className="flex items-center gap-2.5 mb-3 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <Ulysse size={40} mood={busy ? "reflechi" : "content"} className="shrink-0" />
          <div>
            <div className="cb-display font-bold text-sm leading-none">Coach Ulysse</div>
            <div className="text-[11px] mt-1" style={{ color: "var(--muted)" }}>Ton binôme de révision — il connaît tes notes, tes coefficients et ton objectif</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mb-3" style={{ maxHeight: "45vh" }} aria-live="polite">
          {msgs.length === 0 && (
            <div>
              <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-2)" }}>Bonjour {p.prenom} ! Pose-moi n'importe quelle question sur tes révisions, tes épreuves ou ta stratégie. Pour commencer :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="cb-option text-xs font-semibold" style={{ padding: "0.5rem 0.8rem" }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start items-end gap-2"}`}>
              {m.role === "assistant" && <Ulysse size={30} mood={i === msgs.length - 1 && !busy ? "encourageant" : "content"} className="shrink-0" />}
              <div className={`max-w-[85%] px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${m.role === "user" ? "cb-bubble-user" : "cb-bubble-coach"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-2">
              <Ulysse size={30} mood="reflechi" className="shrink-0" />
              <span className="text-xs font-semibold cb-pulse" style={{ color: "var(--muted)" }}>Ulysse réfléchit…</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Écris ta question…" disabled={busy} aria-label="Ta question au coach"
            className="cb-input flex-1" style={{ width: "auto" }} />
          <button onClick={() => send()} disabled={busy || !input.trim()} aria-label="Envoyer"
            className="cb-btn cb-btn-accent shrink-0" style={{ width: 44, height: 44, padding: 0 }}>
            <Send size={17} aria-hidden />
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ================================================================
   APP SHELL
   ================================================================ */
const TABS = [
  { id: "dash", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "notes", label: "Notes", icon: PenLine },
  { id: "coach", label: "Coach IA", icon: Sparkles },
  { id: "chat", label: "Chat coach", icon: MessageCircle },
  { id: "planning", label: "Planning", icon: CalendarDays },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "fiches", label: "Fiches", icon: BookOpen },
  { id: "annales", label: "Annales", icon: FolderOpen },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "rectorat", label: "Rectorat", icon: Building2 },
  { id: "profils", label: "Profils", icon: User },
];

/* Menu latéral : rubriques groupées */
const NAV_GROUPS = [
  { label: "Pilotage", ids: ["dash", "notes", "stats"] },
  { label: "Coaching", ids: ["coach", "chat", "planning"] },
  { label: "Entraînement", ids: ["quiz", "fiches", "annales"] },
  { label: "Organisation", ids: ["rectorat", "profils"] },
];

/* Titre et sous-titre affichés en tête de chaque page */
const PAGE_META: Record<string, [string, string]> = {
  dash: ["Tableau de bord", "Ta progression vers le bac, en un coup d'œil"],
  notes: ["Notes", "Saisis tes moyennes — les calculs sont instantanés"],
  coach: ["Coach IA", "Analyse personnalisée et priorités de travail"],
  chat: ["Chat coach", "Pose tes questions à Ulysse, il connaît ton dossier"],
  planning: ["Planning", "Ta semaine type de révision"],
  quiz: ["Quiz", "Entraîne-toi en quelques minutes par jour"],
  fiches: ["Fiches", "L'essentiel à retenir, matière par matière"],
  annales: ["Annales", "Les vrais sujets des sessions précédentes"],
  stats: ["Statistiques", "Visualise tes forces et tes marges de progression"],
  rectorat: ["Rectorat", "Tes démarches officielles, sans stress"],
  profils: ["Profils", "Comptes, synchronisation et élèves suivis"],
};

const tabById = (id: string) => TABS.find((t) => t.id === id)!;

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState("dash");
  const [adding, setAdding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [cloudReady, setCloudReady] = useState(false);
  const [theme, setTheme] = useState<Theme>(getTheme);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const toggleTheme = () => setTheme((t) => { const next = t === "dark" ? "light" : "dark"; applyTheme(next); return next; });

  useEffect(() => { store.load().then((s) => { setState(s); setLoaded(true); }); }, []);

  // Suivi de la session Supabase (connexion / déconnexion)
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // À la connexion : le cloud est la source de vérité s'il contient des données,
  // sinon on y pousse les données locales existantes.
  useEffect(() => {
    if (!session || !loaded) { setCloudReady(false); return; }
    let cancelled = false;
    void cloudLoad(session.user.id).then((cloud) => {
      if (cancelled) return;
      if (cloud && cloud.profiles?.length) setState(cloud);
      setCloudReady(true);
    });
    return () => { cancelled = true; };
  }, [session, loaded]);

  // Sauvegarde : toujours en local, et dans le cloud une fois la session synchronisée
  useEffect(() => {
    if (!loaded || !state) return;
    void store.save(state);
    if (session && cloudReady) void cloudSave(session.user.id, state);
  }, [state, loaded, session, cloudReady]);

  // Fermeture du menu latéral et des paramètres au clavier (Échap)
  useEffect(() => {
    if (!menuOpen && !settingsOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenuOpen(false); setSettingsOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, settingsOpen]);

  const active = state?.profiles?.find((p) => p.id === state.activeId);
  const res = useMemo(() => (active ? computeResults(active) : null), [active]);
  const update = (p: StudentProfile) => setState((s) => (s ? { ...s, profiles: s.profiles.map((x) => (x.id === p.id ? p : x)) } : s));

  if (!loaded) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="cb-pulse"><Ulysse size={92} mood="content" title="Coach Ulysse arrive" /></div>
      <div className="cb-display font-bold">Chargement…</div>
    </div>
  );
  if (!state || state.profiles.length === 0 || adding)
    return <Onboarding canCancel={!!state?.profiles?.length} onCancel={() => setAdding(false)}
      onDone={(p) => { setState((s) => ({ profiles: [...(s?.profiles || []), p], activeId: p.id })); setAdding(false); setTab("notes"); }} />;

  if (!active) {
    // activeId orphelin (profil supprimé hors app) : on répare vers le premier profil.
    setState((s) => (s ? { ...s, activeId: s.profiles[0].id } : s));
    return null;
  }

  const goTab = (id: string) => { setTab(id); setMenuOpen(false); setSettingsOpen(false); window.scrollTo({ top: 0 }); };
  const [title, subtitle] = PAGE_META[tab] || ["", ""];

  return (
    <div className="min-h-screen">
      <a href="#contenu" className="cb-skip">Aller au contenu</a>

      {/* ---------- Barre supérieure ---------- */}
      <header className="cb-topbar">
        <div className="max-w-3xl mx-auto flex items-center gap-1.5 px-3 py-2">
          <button className="cb-iconbtn" onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu" aria-expanded={menuOpen} aria-haspopup="dialog">
            <Menu size={21} aria-hidden />
          </button>
          <button onClick={() => goTab("dash")} className="flex items-center gap-2.5 min-w-0 rounded-xl px-1 py-1" aria-label="Accueil — Coach Bac IA">
            <Logo size={34} />
            <span className="cb-display font-extrabold leading-none truncate">Coach Bac IA</span>
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <button className="cb-iconbtn" onClick={() => setSettingsOpen((o) => !o)} aria-label="Paramètres" aria-expanded={settingsOpen} aria-haspopup="menu">
              <Settings size={20} aria-hidden />
            </button>
            <button onClick={() => goTab("profils")} className="w-10 h-10 rounded-xl cb-display font-extrabold shrink-0 transition-transform active:scale-90"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }} aria-label="Profils">
              {active.prenom[0]?.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Contenu ---------- */}
      <main id="contenu">
        <div className="max-w-3xl mx-auto px-4 pt-5 pb-16">
          <div className="mb-5">
            <h1 className="cb-display text-2xl font-extrabold">{title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{subtitle}</p>
          </div>
          {tab === "dash" && <Dashboard p={active} res={res} go={goTab} />}
          {tab === "notes" && <Notes p={active} res={res} update={update} />}
          {tab === "coach" && <Coach p={active} res={res} />}
          {tab === "chat" && <Chat p={active} res={res} />}
          {tab === "planning" && <Planning p={active} res={res} />}
          {tab === "quiz" && <Quiz p={active} update={update} />}
          {tab === "fiches" && <Fiches />}
          {tab === "annales" && <Annales p={active} />}
          {tab === "stats" && <Stats p={active} res={res} theme={theme} />}
          {tab === "rectorat" && <Rectorat p={active} update={update} />}
          {tab === "profils" && <div className="space-y-3"><AccountCard session={session} /><Profiles state={state} setState={setState} onAdd={() => setAdding(true)} /></div>}
        </div>
      </main>

      {/* ---------- Menu latéral (hamburger) ---------- */}
      {menuOpen && (
        <>
          <div className="cb-drawer-backdrop" onClick={() => setMenuOpen(false)} aria-hidden />
          <div className="cb-drawer" role="dialog" aria-modal="true" aria-label="Menu principal">
            <div className="flex items-center gap-3 px-1 mb-1">
              <Logo size={38} />
              <div className="min-w-0">
                <div className="cb-display font-extrabold leading-none">Coach Bac IA</div>
                <div className="text-[11px] truncate mt-1" style={{ color: "var(--muted)" }}>Bac {active.session} · {active.academie}</div>
              </div>
              <button onClick={() => setMenuOpen(false)} className="cb-iconbtn ml-auto" aria-label="Fermer le menu">
                <X size={19} aria-hidden />
              </button>
            </div>
            <button onClick={() => goTab("profils")} className="flex items-center gap-2.5 w-full p-2 mt-2 rounded-xl cb-row text-left">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center cb-display font-extrabold shrink-0" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>{active.prenom[0]?.toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block font-bold text-sm truncate">{active.prenom}</span>
                <span className="block text-[11px] truncate" style={{ color: "var(--muted)" }}>{session ? "Synchronisé dans le cloud" : "Données sur cet appareil"}</span>
              </span>
            </button>
            <nav className="flex-1 overflow-y-auto cb-scroll mt-1" aria-label="Rubriques">
              {NAV_GROUPS.map((gr) => (
                <div key={gr.label}>
                  <div className="cb-navgroup">{gr.label}</div>
                  {gr.ids.map((id) => {
                    const t = tabById(id); const Icon = t.icon;
                    return (
                      <button key={id} onClick={() => goTab(id)} className="cb-navlink" aria-current={tab === id ? "page" : undefined}>
                        <Icon size={16} aria-hidden />{t.label}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
            <div className="pt-3 mt-2 flex items-center justify-between gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={toggleTheme} className="cb-navlink" style={{ width: "auto", flex: 1 }}>
                {theme === "dark" ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
                Mode {theme === "dark" ? "clair" : "sombre"}
              </button>
              <span className="text-[11px] font-semibold px-2" style={{ color: "var(--muted)" }}>v1.5</span>
            </div>
          </div>
        </>
      )}

      {/* ---------- Menu Paramètres (⚙️) ---------- */}
      {settingsOpen && (
        <>
          <div className="cb-drawer-backdrop" style={{ background: "transparent", animation: "none" }} onClick={() => setSettingsOpen(false)} aria-hidden />
          <div className="cb-menu" role="menu" aria-label="Paramètres">
            <button className="cb-menu-item" role="menuitem" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
              Mode {theme === "dark" ? "clair" : "sombre"}
            </button>
            <button className="cb-menu-item" role="menuitem" onClick={() => goTab("profils")}>
              <User size={17} aria-hidden /> Profils &amp; compte
            </button>
            <button className="cb-menu-item" role="menuitem" onClick={() => { downloadIcs(active); setSettingsOpen(false); }}>
              <Download size={17} aria-hidden /> Exporter les échéances
            </button>
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)", marginTop: "0.3rem" }}>
              Coach Bac IA · v1.5 · {active.academie}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
