import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX, Users } from "lucide-react";
import "./command-center.css";

import { AGENTS, type Agent } from "./data/agents";
import { useClock } from "./hooks";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import AgentCard from "./components/AgentCard";
import AgentLauncher from "./components/AgentLauncher";
import StatTiles from "./components/widgets/StatTiles";
import ActivityChart from "./components/widgets/ActivityChart";
import CalendarWidget from "./components/widgets/CalendarWidget";
import WeatherWidget from "./components/widgets/WeatherWidget";
import RecentProjects from "./components/widgets/RecentProjects";
import QuickActions from "./components/widgets/QuickActions";

/* ================================================================
   CENTRE DE COMMANDEMENT IA — page d'accueil du système.
   Coquille 3 colonnes (sidebar / contenu / rail de widgets),
   entièrement responsive, thème clair/sombre, fond aurora animé.
   ================================================================ */

/** Normalise pour la recherche : minuscules + sans accents. */
const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Filtre les agents sur nom, domaine, description et mots-clés. */
function filterAgents(query: string): Agent[] {
  const q = norm(query.trim());
  if (!q) return AGENTS;
  return AGENTS.filter((a) =>
    [a.name, a.domain, a.description, ...a.keywords].some((field) => norm(field).includes(q)),
  );
}

/** Orchestration en cascade des cartes agents. */
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
};

export default function CommandCenter() {
  const [query, setQuery] = useState("");
  const [launched, setLaunched] = useState<Agent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const now = useClock();

  const agents = useMemo(() => filterAgents(query), [query]);

  const greeting = now.getHours() < 6 ? "Bonne nuit" : now.getHours() < 18 ? "Bonjour" : "Bonsoir";
  const dateLabel = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const timeLabel = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="cc-root">
      <div className="cc-aurora" aria-hidden="true" />

      <div className="cc-shell">
        {/* -------- colonne 1 : navigation -------- */}
        <Sidebar />

        {/* -------- colonne 2 : contenu principal -------- */}
        <main className="flex min-w-0 flex-col gap-5">
          <Topbar query={query} onQueryChange={setQuery} onOpenMenu={() => setDrawerOpen(true)} />

          {/* Héro : salutation + horloge temps réel */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="cc-glass flex flex-wrap items-center justify-between gap-4 px-6 py-5"
          >
            <div>
              <p className="cc-kicker mb-1">Centre de Commandement IA</p>
              <h1 className="cc-display text-[clamp(1.35rem,3.2vw,1.9rem)] font-extrabold leading-tight">
                {greeting}, Christopher —{" "}
                <span
                  style={{
                    background: "linear-gradient(120deg, var(--cc-brand), var(--cc-brand-2))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  votre équipe est prête.
                </span>
              </h1>
              <p className="mt-1 text-[0.82rem] font-semibold capitalize" style={{ color: "var(--cc-mute)" }}>
                {dateLabel}
              </p>
            </div>
            <div className="text-right" role="timer" aria-label="Horloge">
              <p className="cc-display text-[clamp(1.6rem,3.4vw,2.2rem)] font-extrabold tabular-nums leading-none">
                {timeLabel}
              </p>
              <p className="mt-1 text-[0.72rem] font-bold" style={{ color: "var(--cc-mute)" }}>
                Heure de Guyane
              </p>
            </div>
          </motion.section>

          {/* Statistiques */}
          <StatTiles />

          {/* Grille des agents */}
          <section aria-label="Agents IA">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <Users size={18} style={{ color: "var(--cc-brand)" }} />
                <h2 className="cc-display text-[1.05rem] font-extrabold">Vos agents IA</h2>
              </div>
              <span className="cc-kicker">
                {agents.length} / {AGENTS.length} agent{agents.length > 1 ? "s" : ""}
              </span>
            </div>

            {agents.length > 0 ? (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} onOpen={setLaunched} />
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="cc-panel flex flex-col items-center gap-2 px-6 py-12 text-center"
              >
                <SearchX size={34} style={{ color: "var(--cc-mute)" }} />
                <p className="cc-display font-extrabold">Aucun agent ne correspond à « {query} »</p>
                <p className="text-[0.8rem]" style={{ color: "var(--cc-mute)" }}>
                  Essayez « bac », « punch », « emploi », « finances »…
                </p>
              </motion.div>
            )}
          </section>

          {/* Activité */}
          <ActivityChart />
        </main>

        {/* -------- colonne 3 : rail de widgets -------- */}
        <aside className="cc-rail flex min-w-0 flex-col gap-5">
          <WeatherWidget />
          <QuickActions />
          <CalendarWidget />
          <RecentProjects />
        </aside>
      </div>

      {/* Tiroir de navigation mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
              style={{ background: "rgba(8, 10, 24, 0.5)", backdropFilter: "blur(4px)" }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed bottom-0 left-0 top-0 z-[70] w-[min(300px,84vw)] p-3"
            >
              <Sidebar asDrawer onClose={() => setDrawerOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Écran de lancement d'un agent */}
      <AgentLauncher agent={launched} onClose={() => setLaunched(null)} />
    </div>
  );
}
