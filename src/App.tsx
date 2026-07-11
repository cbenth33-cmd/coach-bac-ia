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
  Clock, FileText, User, X, Award, Flame, MessageCircle, Send,
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
import type { Session } from "@supabase/supabase-js";
import type { ChatMessage } from "./lib/claude";


/* ================================================================
   COACH BAC IA — v1.0
   Architecture modulaire : core (moteur bac) / coach / data / ui
   Prêt à migrer vers Vite + TS + Supabase (voir README)
   ================================================================ */

/* ---------- design tokens ---------- */
const P = {
  encre: "#232B4A",       // bleu encre — texte & fonds forts
  encreSoft: "#3A4468",
  papier: "#F6F5F0",      // fond papier copie
  blanc: "#FFFFFF",
  fluo: "#FFE14D",        // surligneur — signature visuelle
  fluoSoft: "#FFF3B8",
  menthe: "#1F9D6C",      // validé / mention
  mentheSoft: "#E3F4EC",
  corail: "#E85D4A",      // urgent / sous l'objectif
  corailSoft: "#FBE7E3",
  ligne: "#E4E2D9",
  gris: "#8A8FA3",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&family=Public+Sans:wght@400;500;600;700&display=swap');
.cb-root { font-family:'Public Sans',system-ui,sans-serif; color:${P.encre}; }
.cb-display { font-family:'Archivo',sans-serif; letter-spacing:-0.02em; }
.cb-hl { position:relative; display:inline-block; }
.cb-hl::before { content:''; position:absolute; left:-4px; right:-4px; top:52%; height:0.62em;
  background:${P.fluo}; transform:translateY(-38%) skewX(-8deg) rotate(-0.6deg); z-index:-1; border-radius:2px; }
.cb-fade { animation:cbfade .35s ease both; }
@keyframes cbfade { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
@media (prefers-reduced-motion: reduce){ .cb-fade{animation:none;} }
.cb-scroll::-webkit-scrollbar{height:0;width:0}
input.cb-note::-webkit-outer-spin-button, input.cb-note::-webkit-inner-spin-button{ -webkit-appearance:none; }
`;

/* ================================================================
   UI — composants
   ================================================================ */
const Card = ({ children, className = "", style = {} }) => (
  <div className={`rounded-2xl p-5 ${className}`} style={{ background: P.blanc, border: `1px solid ${P.ligne}`, ...style }}>{children}</div>
);
const Tag = ({ children, tone = "encre" }) => {
  const map = { encre: [P.encre, "#EDEDF3"], menthe: [P.menthe, P.mentheSoft], corail: [P.corail, P.corailSoft], fluo: [P.encre, P.fluoSoft] };
  const [c, bg] = map[tone];
  return <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ color: c, background: bg }}>{children}</span>;
};
const Btn = ({ children, onClick, variant = "primary", disabled = false, className = "" }:
  { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "fluo" | "ghost" | "danger"; disabled?: boolean; className?: string }) => {
  const styles = {
    primary: { background: P.encre, color: "#fff" },
    fluo: { background: P.fluo, color: P.encre },
    ghost: { background: "transparent", color: P.encre, border: `1.5px solid ${P.ligne}` },
    danger: { background: P.corailSoft, color: P.corail },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-transform active:scale-95 disabled:opacity-40 ${className}`}
      style={styles[variant]}>{children}</button>
  );
};
const Field = ({ label, children }) => (
  <label className="block mb-4">
    <span className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: P.gris }}>{label}</span>
    {children}
  </label>
);
const Select = ({ value, onChange, options, placeholder }:
  { value?: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) => (
  <select value={value || ""} onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none"
    style={{ border: `1.5px solid ${P.ligne}`, background: P.blanc, color: value ? P.encre : P.gris }}>
    <option value="" disabled>{placeholder || "Choisir…"}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: P.papier }}>
      <div className="w-full max-w-lg cb-fade">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: P.encre }}><GraduationCap size={20} color={P.fluo} /></div>
          <div>
            <div className="cb-display font-extrabold text-lg leading-none">Coach Bac IA</div>
            <div className="text-xs" style={{ color: P.gris }}>Nouveau profil élève</div>
          </div>
          {canCancel && <button onClick={onCancel} className="ml-auto p-2"><X size={18} color={P.gris} /></button>}
        </div>
        <div className="flex gap-1.5 mb-5">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className="h-1.5 rounded-full" style={{ background: i <= step ? P.fluo : P.ligne }} />
              <div className="text-[10px] mt-1 font-semibold" style={{ color: i === step ? P.encre : P.gris }}>{s}</div>
            </div>
          ))}
        </div>
        <Card>
          {step === 0 && (<>
            <h2 className="cb-display font-bold text-xl mb-4">Qui prépare <span className="cb-hl">le bac</span> ?</h2>
            <Field label="Prénom de l'élève">
              <input value={f.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="Ex. Diyiah"
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none" style={{ border: `1.5px solid ${P.ligne}` }} />
            </Field>
          </>)}
          {step === 1 && (<>
            <h2 className="cb-display font-bold text-xl mb-4">Ton examen</h2>
            <Field label="Académie"><Select value={f.academie} onChange={(v) => set("academie", v)} options={ACADEMIES} placeholder="Ex. Guyane, Bordeaux, Paris…" /></Field>
            <Field label="Session du bac"><Select value={String(f.session)} onChange={(v) => set("session", Number(v))} options={SESSIONS.map(String)} /></Field>
            <Field label="Statut du candidat">
              <div className="grid grid-cols-2 gap-2">
                {[["scolaire", "Candidat scolaire", "Inscrit dans un lycée"], ["individuel", "Candidat individuel", "Candidat libre / CNED"]].map(([id, t, d]) => (
                  <button key={id} onClick={() => set("statut", id)} className="text-left p-3 rounded-xl"
                    style={{ border: `2px solid ${f.statut === id ? P.encre : P.ligne}`, background: f.statut === id ? P.fluoSoft : P.blanc }}>
                    <div className="font-bold text-sm">{t}</div><div className="text-xs" style={{ color: P.gris }}>{d}</div>
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
                  <button key={id} onClick={() => set("voie", id)} className="p-3 rounded-xl font-bold text-sm"
                    style={{ border: `2px solid ${f.voie === id ? P.encre : P.ligne}`, background: f.voie === id ? P.fluoSoft : P.blanc }}>{t}</button>
                ))}
              </div>
            </Field>
            {g ? (<>
              <Field label="Spécialité 1 (terminale · coef 16)"><Select value={f.spe1} onChange={(v) => set("spe1", v)} options={SPES_GENERALE} /></Field>
              <Field label="Spécialité 2 (terminale · coef 16)"><Select value={f.spe2} onChange={(v) => set("spe2", v)} options={SPES_GENERALE.filter((s) => s !== f.spe1)} /></Field>
              <Field label="Spécialité abandonnée en 1re (coef 8)"><Select value={f.spe3} onChange={(v) => set("spe3", v)} options={SPES_GENERALE.filter((s) => s !== f.spe1 && s !== f.spe2)} /></Field>
            </>) : (<>
              <Field label="Série technologique"><Select value={f.serie} onChange={(v) => { set("serie", v); const s = SERIES_TECHNO[v]; setF((p) => ({ ...p, serie: v, spe1: s.spes[0], spe2: s.spes[1], spe3: s.spe1ere })); }} options={Object.keys(SERIES_TECHNO)} /></Field>
              {f.serie && <div className="text-xs p-3 rounded-xl mb-3" style={{ background: P.fluoSoft }}>Spécialités {f.serie} : {SERIES_TECHNO[f.serie].spes.join(" · ")}</div>}
            </>)}
            <div className="grid grid-cols-2 gap-3">
              <Field label="LVA"><Select value={f.lva} onChange={(v) => set("lva", v)} options={["Anglais", "Espagnol", "Allemand", "Portugais", "Italien", "Créole", "Autre"]} /></Field>
              <Field label="LVB"><Select value={f.lvb} onChange={(v) => set("lvb", v)} options={["Espagnol", "Anglais", "Allemand", "Portugais", "Italien", "Créole", "Autre"]} /></Field>
            </div>
          </>)}
          {step === 3 && (<>
            <h2 className="cb-display font-bold text-xl mb-4">Ton <span className="cb-hl">objectif</span></h2>
            <Field label="Je vise…">
              <div className="grid grid-cols-2 gap-2">
                {OBJECTIFS.map((o) => (
                  <button key={o.id} onClick={() => set("objectif", o.id)} className="p-3 rounded-xl text-left"
                    style={{ border: `2px solid ${f.objectif === o.id ? P.encre : P.ligne}`, background: f.objectif === o.id ? P.fluoSoft : P.blanc }}>
                    <div className="font-bold text-sm">{o.label}</div><div className="text-xs" style={{ color: P.gris }}>≥ {o.seuil}/20</div>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Heures de révision disponibles par semaine">
              <input type="range" min="2" max="20" value={f.heuresSemaine} onChange={(e) => set("heuresSemaine", Number(e.target.value))} className="w-full" />
              <div className="text-center font-bold cb-display text-lg">{f.heuresSemaine} h / semaine</div>
            </Field>
          </>)}
          <div className="flex justify-between mt-4">
            <Btn variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}><ChevronLeft size={16} className="inline -mt-0.5" /> Retour</Btn>
            {step < 3
              ? <Btn variant="fluo" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>Continuer <ChevronRight size={16} className="inline -mt-0.5" /></Btn>
              : <Btn variant="fluo" onClick={() => onDone({ ...f, id: Date.now().toString(36), notes: {}, rectorat: {}, quizHistory: [] })}>Créer le profil <Check size={16} className="inline -mt-0.5" /></Btn>}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ p, res, go }) {
  const m = res.mention;
  const prog = Math.round((res.coefDone / res.coefTotal) * 100);
  return (
    <div className="space-y-4 cb-fade">
      <Card style={{ background: P.encre, border: "none" }}>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: P.fluo }}>Moyenne générale projetée</div>
            <div className="cb-display font-black text-6xl leading-none text-white">
              {res.moyenne != null ? res.moyenne.toFixed(2) : "—"}<span className="text-2xl font-bold" style={{ color: P.gris }}>/20</span>
            </div>
          </div>
          <div className="flex-1 min-w-40">
            {m && <div className="inline-block px-3 py-1.5 rounded-lg font-bold text-sm mb-2" style={{ background: P.fluo, color: P.encre }}>{m.label}</div>}
            <div className="text-xs text-white/70">{res.pointsAcquis} points acquis · {res.coefDone}/{res.coefTotal} coefficients renseignés</div>
            <div className="h-2 rounded-full mt-2" style={{ background: "#ffffff22" }}>
              <div className="h-2 rounded-full" style={{ width: `${prog}%`, background: P.fluo }} />
            </div>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><Target size={18} color={P.menthe} /><div className="cb-display font-extrabold text-2xl mt-1">{res.target}/20</div><div className="text-xs" style={{ color: P.gris }}>Objectif ({mention(res.target)?.short})</div></Card>
        <Card><Flame size={18} color={P.corail} /><div className="cb-display font-extrabold text-2xl mt-1">{res.ptsManquants}</div><div className="text-xs" style={{ color: P.gris }}>Points à aller chercher</div></Card>
        <Card><Award size={18} color={P.encre} /><div className="cb-display font-extrabold text-2xl mt-1">{res.totalProjete ?? "—"}<span className="text-sm" style={{ color: P.gris }}>/2000</span></div><div className="text-xs" style={{ color: P.gris }}>Total projeté</div></Card>
        <Card><Clock size={18} color={P.encre} /><div className="cb-display font-extrabold text-2xl mt-1">{p.heuresSemaine} h</div><div className="text-xs" style={{ color: P.gris }}>Révisions / semaine</div></Card>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="cb-display font-bold">Prochaines actions</h3>
            <button onClick={() => go("coach")} className="text-xs font-bold" style={{ color: P.encre }}>Coach IA →</button>
          </div>
          {res.moyenne == null
            ? <p className="text-sm" style={{ color: P.gris }}>Saisis tes premières notes dans l'onglet <b>Notes</b> : le coach analysera immédiatement tes points forts et tes priorités.</p>
            : <CoachTeaser p={p} res={res} />}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="cb-display font-bold">Suivi Rectorat</h3>
            <button onClick={() => go("rectorat")} className="text-xs font-bold" style={{ color: P.encre }}>Tout voir →</button>
          </div>
          <RectoratTeaser p={p} />
        </Card>
      </div>
    </div>
  );
}
function CoachTeaser({ p, res }) {
  const a = coachAnalysis(p, res);
  if (a.weak.length === 0) return <p className="text-sm" style={{ color: P.menthe }}>Toutes tes matières notées sont au-dessus de ton objectif. Consolide et vise la mention supérieure !</p>;
  return (
    <ul className="space-y-2">
      {a.weak.slice(0, 3).map((w) => (
        <li key={w.id} className="flex items-center gap-2 text-sm">
          <AlertTriangle size={15} color={P.corail} />
          <span className="font-semibold flex-1">{w.nom}</span>
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
      <div className="h-2 rounded-full mb-3" style={{ background: P.ligne }}>
        <div className="h-2 rounded-full" style={{ width: `${(done / items.length) * 100}%`, background: P.menthe }} />
      </div>
      {next && <div className="text-sm p-3 rounded-xl" style={{ background: P.fluoSoft }}><b>À faire :</b> {next.titre} <span style={{ color: P.gris }}>· {next.date}</span></div>}
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
        <div className="text-sm p-3 rounded-xl flex gap-2 items-start" style={{ background: P.fluoSoft }}>
          <FileText size={16} className="mt-0.5 shrink-0" />
          <span>Candidat individuel : le contrôle continu est remplacé par des <b>évaluations ponctuelles</b> aux mêmes coefficients. Saisis tes notes ou tes estimations.</span>
        </div>
      )}
      {groups.map(([type, label]) => (
        <Card key={type}>
          <h3 className="cb-display font-bold mb-1">{label}</h3>
          <p className="text-xs mb-4" style={{ color: P.gris }}>Saisis tes moyennes ou notes de bacs blancs sur 20 — les calculs sont instantanés.</p>
          <div className="space-y-2">
            {res.rows.filter((r) => r.type === type).map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: P.papier }}>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{r.nom}</div>
                  <div className="text-xs" style={{ color: P.gris }}>Coefficient {r.coef}</div>
                </div>
                {r.note != null && <Tag tone={r.note >= res.target ? "menthe" : "corail"}>{(r.note * r.coef).toFixed(0)} pts</Tag>}
                <input type="number" min="0" max="20" step="0.25" value={p.notes?.[r.id] ?? ""} placeholder="—"
                  onChange={(e) => setNote(r.id, e.target.value)}
                  className="cb-note w-20 px-2 py-2 rounded-lg text-center font-bold outline-none"
                  style={{ border: `1.5px solid ${r.note == null ? P.ligne : r.note >= res.target ? P.menthe : P.corail}` }} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

/* ---------- Coach IA ---------- */
function Coach({ p, res }) {
  const a = coachAnalysis(p, res);
  if (res.moyenne == null) return <Card className="cb-fade"><Sparkles size={20} color={P.encre} /><p className="mt-2 text-sm">Le coach a besoin de tes notes pour travailler. Renseigne au moins une matière dans l'onglet <b>Notes</b>.</p></Card>;
  return (
    <div className="space-y-4 cb-fade">
      <Card style={{ background: P.encre, border: "none" }}>
        <div className="flex items-center gap-2 mb-2"><Sparkles size={18} color={P.fluo} /><span className="cb-display font-bold text-white">Analyse du coach</span></div>
        <p className="text-sm text-white/85">
          {p.prenom}, ta moyenne projetée est de <b style={{ color: P.fluo }}>{res.moyenne.toFixed(2)}/20</b> ({res.mention.label.toLowerCase()}).
          {res.moyenne >= a.target
            ? ` Tu es au-dessus de ton objectif de ${a.target}/20 : la stratégie est de sécuriser tes acquis et de viser ${mention(Math.min(18, a.target + 2))?.short}.`
            : ` Il te manque ${res.ptsManquants} points pour atteindre ${a.target}/20. Bonne nouvelle : en concentrant tes ${p.heuresSemaine} h hebdomadaires sur ${Math.min(3, a.weak.length)} matières à fort coefficient, cet écart est rattrapable.`}
          {a.missing.length > 0 && ` ${a.missing.length} matière(s) restent sans note — renseigne-les pour affiner le plan.`}
        </p>
      </Card>
      {a.advice.length > 0 && (
        <Card>
          <h3 className="cb-display font-bold mb-3">Plan de progression — <span className="cb-hl">priorités</span></h3>
          <div className="space-y-4">
            {a.advice.map((w, i) => (
              <div key={w.id} className="p-4 rounded-xl" style={{ background: P.papier }}>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="cb-display font-black text-lg" style={{ color: P.corail }}>P{i + 1}</span>
                  <span className="font-bold">{w.nom}</span>
                  <Tag tone="corail">{w.note}/20</Tag>
                  <Tag tone="fluo">+{w.gain.toFixed(0)} pts possibles</Tag>
                </div>
                <ul className="space-y-1">
                  {w.tips.map((t, j) => <li key={j} className="text-sm flex gap-2"><Check size={14} color={P.menthe} className="mt-0.5 shrink-0" />{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
      {a.strong.length > 0 && (
        <Card>
          <h3 className="cb-display font-bold mb-2 flex items-center gap-2"><TrendingUp size={16} color={P.menthe} /> Points forts à sécuriser</h3>
          <div className="flex flex-wrap gap-2">{a.strong.map((s) => <Tag key={s.id} tone="menthe">{s.nom} · {s.note}/20</Tag>)}</div>
        </Card>
      )}
      <Card>
        <h3 className="cb-display font-bold mb-2">Répartition conseillée de tes {p.heuresSemaine} h / semaine</h3>
        {a.alloc.length === 0 ? <p className="text-sm" style={{ color: P.gris }}>Aucune matière sous l'objectif : répartis ton temps librement, avec un accent sur les spécialités (coef 16).</p> : (
          <div className="space-y-2">
            {a.alloc.map((x) => (
              <div key={x.id} className="flex items-center gap-3">
                <div className="text-sm font-semibold flex-1 truncate">{x.nom}</div>
                <div className="flex-1 h-3 rounded-full" style={{ background: P.ligne }}>
                  <div className="h-3 rounded-full" style={{ width: `${(x.heures / p.heuresSemaine) * 100}%`, background: P.fluo }} />
                </div>
                <div className="text-sm font-bold w-10 text-right">{x.heures} h</div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs mt-3" style={{ color: P.gris }}>Le planning détaillé jour par jour est généré dans l'onglet Planning.</p>
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
        <p className="text-xs mb-4" style={{ color: P.gris }}>Généré automatiquement à partir de tes priorités (coefficient × écart à l'objectif). Sessions de 1 h, règle 40 min de travail / 10 min de pause.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {week.map((d) => (
            <div key={d.jour} className="p-3 rounded-xl" style={{ background: P.papier, minHeight: 90 }}>
              <div className="text-xs font-black uppercase tracking-wide mb-2" style={{ color: P.gris }}>{d.jour}</div>
              {d.sessions.length === 0
                ? <div className="text-xs italic" style={{ color: P.gris }}>Repos</div>
                : d.sessions.map((s, i) => <div key={i} className="text-xs font-semibold px-2 py-1.5 rounded-lg mb-1" style={{ background: P.blanc, border: `1px solid ${P.ligne}` }}>{s}</div>)}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="cb-display font-bold mb-2">Les 3 règles du planning intelligent</h3>
        <ul className="text-sm space-y-1.5">
          <li className="flex gap-2"><Check size={15} color={P.menthe} className="mt-0.5 shrink-0" /><b>Espacement :</b> revois chaque notion à J+1, J+3, J+7 (courbe de l'oubli).</li>
          <li className="flex gap-2"><Check size={15} color={P.menthe} className="mt-0.5 shrink-0" /><b>Priorité coefficient :</b> 1 point gagné en spécialité vaut 16 points au bac.</li>
          <li className="flex gap-2"><Check size={15} color={P.menthe} className="mt-0.5 shrink-0" /><b>Récupération :</b> dimanche soir sans écran, 7 h 30 de sommeil minimum en période d'examen.</li>
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
        <p className="text-xs mb-4" style={{ color: P.gris }}>Choisis une matière — les scores alimentent tes statistiques.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.keys(QUIZ).map((s) => (
            <button key={s} onClick={() => setSubj(s)} className="p-3 rounded-xl text-left font-bold text-sm transition-transform active:scale-95"
              style={{ border: `1.5px solid ${P.ligne}`, background: P.blanc }}>
              {s}<div className="text-xs font-medium mt-0.5" style={{ color: P.gris }}>{QUIZ[s].length} questions</div>
            </button>
          ))}
        </div>
        {(p.quizHistory || []).length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: P.gris }}>Derniers scores</div>
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
      <Card className="cb-fade text-center">
        <div className="cb-display font-black text-5xl mb-1">{score}/{qs.length}</div>
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
      <div className="flex justify-between items-center mb-3">
        <Tag tone="fluo">{subj}</Tag>
        <span className="text-xs font-bold" style={{ color: P.gris }}>Question {i + 1}/{qs.length}</span>
      </div>
      <h3 className="cb-display font-bold text-lg mb-4">{q.q}</h3>
      <div className="space-y-2">
        {q.opts.map((o, idx) => {
          let border = P.ligne, bg = P.blanc;
          if (picked != null) {
            if (idx === q.a) { border = P.menthe; bg = P.mentheSoft; }
            else if (idx === picked) { border = P.corail; bg = P.corailSoft; }
          }
          return (
            <button key={idx} onClick={() => answer(idx)} className="w-full text-left p-3 rounded-xl font-semibold text-sm"
              style={{ border: `2px solid ${border}`, background: bg }}>{o}</button>
          );
        })}
      </div>
      <button onClick={reset} className="text-xs font-bold mt-4" style={{ color: P.gris }}>← Quitter le quiz</button>
    </Card>
  );
}

/* ---------- Fiches ---------- */
function Fiches() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3 cb-fade">
      {FICHES.map((f, i) => (
        <Card key={i} className="cursor-pointer" style={{ borderLeft: `4px solid ${P.fluo}` }}>
          <button className="w-full text-left" onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex items-center gap-2 flex-wrap">
              <Tag tone="fluo">{f.matiere}</Tag>
              <span className="cb-display font-bold flex-1">{f.titre}</span>
              <ChevronRight size={16} style={{ transform: open === i ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
            </div>
          </button>
          {open === i && <p className="text-sm mt-3 leading-relaxed" style={{ color: P.encreSoft }}>{f.contenu}</p>}
        </Card>
      ))}
      <Card>
        <h3 className="cb-display font-bold mb-1">Annales — <span className="cb-hl">structure des épreuves</span></h3>
        <p className="text-xs mb-4" style={{ color: P.gris }}>Format officiel de chaque épreuve et le conseil qui fait la différence. Les sujets des sessions précédentes sont en libre accès sur les sites officiels (Eduscol, quandjepasselebac).</p>
        <div className="space-y-2">
          {ANNALES.map((a, i) => (
            <div key={i} className="p-3 rounded-xl" style={{ background: P.papier }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm">{a.matiere}</span>
                <Tag tone="encre">{a.duree}</Tag>
              </div>
              <p className="text-xs mt-1.5" style={{ color: P.encreSoft }}>{a.format}</p>
              <p className="text-xs mt-1.5 font-semibold flex gap-1.5"><Sparkles size={13} className="shrink-0 mt-0.5" color={P.corail} />{a.conseil}</p>
            </div>
          ))}
        </div>
      </Card>
      <p className="text-xs text-center" style={{ color: P.gris }}>Banque extensible — la synchronisation des sujets par académie arrive en phase 2 (base de données).</p>
    </div>
  );
}

/* ---------- Stats ---------- */
function Stats({ p, res }) {
  const data = res.rows.filter((r) => r.note != null).map((r) => ({ name: r.nom.length > 14 ? r.nom.slice(0, 13) + "…" : r.nom, note: r.note, coef: r.coef }));
  const radar = res.rows.filter((r) => r.note != null).slice(0, 8).map((r) => ({ subject: r.nom.split(" ")[0], note: r.note }));
  if (data.length === 0) return <Card className="cb-fade"><BarChart3 size={20} /><p className="mt-2 text-sm">Les graphiques apparaîtront dès tes premières notes saisies.</p></Card>;
  return (
    <div className="space-y-4 cb-fade">
      <Card>
        <h3 className="cb-display font-bold mb-3">Notes par matière vs objectif ({res.target}/20)</h3>
        <div style={{ height: Math.max(220, data.length * 42) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v, n, pr) => [`${v}/20 · coef ${pr.payload.coef}`, "Note"]} />
              <ReferenceLine x={res.target} stroke={P.corail} strokeDasharray="4 4" />
              <Bar dataKey="note" radius={[0, 6, 6, 0]}>
                {data.map((d, i) => <Cell key={i} fill={d.note >= res.target ? P.menthe : P.fluo} />)}
                <LabelList dataKey="note" position="right" style={{ fontSize: 11, fontWeight: 700, fill: P.encre }} />
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
                <PolarGrid stroke={P.ligne} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <Radar dataKey="note" stroke={P.encre} fill={P.fluo} fillOpacity={0.5} />
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
      <Card style={{ background: P.encre, border: "none" }}>
        <div className="flex items-center gap-2 mb-1"><Building2 size={18} color={P.fluo} /><span className="cb-display font-bold text-white">Mode Rectorat — session {p.session}</span></div>
        <p className="text-sm text-white/80">Académie de {p.academie} · candidat {p.statut === "scolaire" ? "scolaire" : "individuel"} · <b style={{ color: P.fluo }}>{done}/{items.length}</b> démarches validées</p>
      </Card>
      {cats.map((cat) => (
        <Card key={cat}>
          <h3 className="cb-display font-bold mb-3">{cat}</h3>
          <div className="space-y-2">
            {items.filter((i) => i.cat === cat).map((it) => {
              const ok = !!p.rectorat?.[it.id];
              return (
                <div key={it.id} className="flex gap-3 p-3 rounded-xl" style={{ background: ok ? P.mentheSoft : P.papier }}>
                  <button onClick={() => toggle(it.id)} className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                    style={{ border: `2px solid ${ok ? P.menthe : P.gris}`, background: ok ? P.menthe : "transparent" }} aria-label={ok ? "Marquer à faire" : "Marquer fait"}>
                    {ok && <Check size={14} color="#fff" />}
                  </button>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${ok ? "line-through opacity-60" : ""}`}>{it.titre}</span>
                      <Tag tone="fluo">{it.date}</Tag>
                    </div>
                    <p className="text-xs mt-1" style={{ color: P.encreSoft }}>{it.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <p className="text-xs text-center px-4" style={{ color: P.gris }}>Dates indicatives basées sur le calendrier national — vérifie toujours ta convocation et le site de l'académie de {p.academie}. Les notifications automatiques arrivent en phase 2.</p>
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
      <Card style={{ borderColor: P.menthe, borderWidth: 2 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <Check size={16} color={P.menthe} />
          <span className="font-bold text-sm flex-1">Connectée : {session.user.email}</span>
          <Btn variant="ghost" onClick={() => { void supabase!.auth.signOut(); }}>Se déconnecter</Btn>
        </div>
        <p className="text-xs mt-2" style={{ color: P.gris }}>
          Tes profils et notes sont sauvegardés dans le cloud et te suivent sur tous tes appareils.
        </p>
      </Card>
    );
  return (
    <Card>
      <h3 className="cb-display font-bold mb-1">Sauvegarde <span className="cb-hl">multi-appareils</span></h3>
      <p className="text-xs mb-3" style={{ color: P.gris }}>
        Sans compte, tes données restent uniquement sur cet appareil. Avec un compte (gratuit), tu les retrouves partout — aucun mot de passe, un simple lien envoyé par email.
      </p>
      {sent ? (
        <p className="text-sm font-semibold p-3 rounded-xl" style={{ background: P.mentheSoft, color: P.menthe }}>
          Lien envoyé à {email} — ouvre l'email sur cet appareil et appuie sur le lien pour te connecter.
        </p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="ton.email@exemple.fr"
            className="flex-1 min-w-40 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${P.ligne}` }} />
          <Btn variant="fluo" disabled={!email.includes("@")} onClick={() => {
            setErr("");
            void supabase!.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin + window.location.pathname } })
              .then(({ error }) => (error ? setErr("Envoi impossible : " + error.message) : setSent(true)));
          }}>Recevoir mon lien</Btn>
        </div>
      )}
      {err && <p className="text-xs mt-2 font-semibold" style={{ color: P.corail }}>{err}</p>}
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
          <Card key={pr.id} className={pr.id === state.activeId ? "" : "opacity-80"} style={pr.id === state.activeId ? { borderColor: P.encre, borderWidth: 2 } : {}}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center cb-display font-black text-lg shrink-0" style={{ background: P.fluo }}>{pr.prenom[0]?.toUpperCase()}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold">{pr.prenom}</div>
                <div className="text-xs truncate" style={{ color: P.gris }}>Bac {pr.session} · {pr.academie} · {pr.voie === "generale" ? "Générale" : pr.serie}</div>
              </div>
              {r.moyenne != null && <Tag tone="fluo">{r.moyenne.toFixed(1)}/20</Tag>}
              {pr.id !== state.activeId && <Btn variant="ghost" onClick={() => setState((s) => ({ ...s, activeId: pr.id }))}>Activer</Btn>}
              {state.profiles.length > 1 && (
                <button onClick={() => { if (confirm(`Supprimer le profil de ${pr.prenom} ?`)) setState((s) => { const profiles = s.profiles.filter((x) => x.id !== pr.id); return { profiles, activeId: s.activeId === pr.id ? profiles[0].id : s.activeId }; }); }}
                  className="p-2" aria-label="Supprimer"><Trash2 size={16} color={P.corail} /></button>
              )}
            </div>
          </Card>
        );
      })}
      <Btn variant="fluo" onClick={onAdd} className="w-full"><Plus size={16} className="inline -mt-0.5" /> Ajouter un profil élève</Btn>
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
        <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: `1px solid ${P.ligne}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: P.encre }}><Sparkles size={15} color={P.fluo} /></div>
          <div>
            <div className="cb-display font-bold text-sm leading-none">Chat avec ton coach</div>
            <div className="text-[11px]" style={{ color: P.gris }}>Il connaît tes notes, tes coefficients et ton objectif</div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mb-3" style={{ maxHeight: "45vh" }}>
          {msgs.length === 0 && (
            <div>
              <p className="text-sm mb-3" style={{ color: P.encreSoft }}>Bonjour {p.prenom} ! Pose-moi n'importe quelle question sur tes révisions, tes épreuves ou ta stratégie. Pour commencer :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="text-xs font-semibold px-3 py-2 rounded-xl text-left"
                    style={{ background: P.fluoSoft, border: `1px solid ${P.fluo}` }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap"
                style={m.role === "user" ? { background: P.encre, color: "#fff", borderBottomRightRadius: 6 } : { background: P.papier, borderBottomLeftRadius: 6 }}>
                {m.content}
              </div>
            </div>
          ))}
          {busy && <div className="text-xs font-semibold" style={{ color: P.gris }}>Le coach réfléchit…</div>}
        </div>
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Écris ta question…" disabled={busy}
            className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: `1.5px solid ${P.ligne}`, background: P.blanc }} />
          <button onClick={() => send()} disabled={busy || !input.trim()} aria-label="Envoyer"
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform active:scale-95 disabled:opacity-40"
            style={{ background: P.fluo }}><Send size={17} color={P.encre} /></button>
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
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "rectorat", label: "Rectorat", icon: Building2 },
  { id: "profils", label: "Profils", icon: User },
];

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState("dash");
  const [adding, setAdding] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [cloudReady, setCloudReady] = useState(false);

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

  const active = state?.profiles?.find((p) => p.id === state.activeId);
  const res = useMemo(() => (active ? computeResults(active) : null), [active]);
  const update = (p: StudentProfile) => setState((s) => (s ? { ...s, profiles: s.profiles.map((x) => (x.id === p.id ? p : x)) } : s));

  if (!loaded) return <div className="min-h-screen flex items-center justify-center" style={{ background: P.papier }}><style>{CSS}</style><div className="cb-display font-bold cb-root">Chargement…</div></div>;
  if (!state || state.profiles.length === 0 || adding)
    return (<><style>{CSS}</style><div className="cb-root"><Onboarding canCancel={!!state?.profiles?.length} onCancel={() => setAdding(false)}
      onDone={(p) => { setState((s) => ({ profiles: [...(s?.profiles || []), p], activeId: p.id })); setAdding(false); setTab("notes"); }} /></div></>);

  if (!active) {
    // activeId orphelin (profil supprimé hors app) : on répare vers le premier profil.
    setState((s) => (s ? { ...s, activeId: s.profiles[0].id } : s));
    return null;
  }

  return (
    <div className="cb-root min-h-screen" style={{ background: P.papier }}>
      <style>{CSS}</style>
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-3" style={{ background: P.papier, borderBottom: `1px solid ${P.ligne}` }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: P.encre }}><GraduationCap size={18} color={P.fluo} /></div>
          <div className="min-w-0">
            <div className="cb-display font-extrabold leading-none">Coach Bac IA</div>
            <div className="text-[11px] truncate" style={{ color: P.gris }}>{active.prenom} · Bac {active.session} · {active.academie}</div>
          </div>
          <button onClick={() => setTab("profils")} className="ml-auto w-9 h-9 rounded-xl cb-display font-black shrink-0" style={{ background: P.fluo }} aria-label="Profils">
            {active.prenom[0]?.toUpperCase()}
          </button>
        </div>
        {/* Nav */}
        <nav className="max-w-5xl mx-auto mt-3 flex gap-1 overflow-x-auto cb-scroll -mx-1 px-1">
          {TABS.map((t) => {
            const Icon = t.icon; const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0"
                style={{ background: on ? P.encre : "transparent", color: on ? P.fluo : P.encreSoft }}>
                <Icon size={15} />{t.label}
              </button>
            );
          })}
        </nav>
      </header>
      {/* Main */}
      <main className="max-w-5xl mx-auto p-4 pb-16">
        {tab === "dash" && <Dashboard p={active} res={res} go={setTab} />}
        {tab === "notes" && <Notes p={active} res={res} update={update} />}
        {tab === "coach" && <Coach p={active} res={res} />}
        {tab === "chat" && <Chat p={active} res={res} />}
        {tab === "planning" && <Planning p={active} res={res} />}
        {tab === "quiz" && <Quiz p={active} update={update} />}
        {tab === "fiches" && <Fiches />}
        {tab === "stats" && <Stats p={active} res={res} />}
        {tab === "rectorat" && <Rectorat p={active} update={update} />}
        {tab === "profils" && <div className="space-y-3"><AccountCard session={session} /><Profiles state={state} setState={setState} onAdd={() => setAdding(true)} /></div>}
      </main>
    </div>
  );
}
