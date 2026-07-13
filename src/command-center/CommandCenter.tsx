import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, SearchX, Users } from "lucide-react";
import "./command-center.css";

import { AGENTS, type Agent } from "./data/agents";
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
   Les agents IA sont l'élément principal : la grille de grandes
   cartes portraits arrive immédiatement sous la barre supérieure.
   La vue d'ensemble (stats, activité, météo, calendrier, projets)
   est reléguée en zone secondaire, sous les agents.
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
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};

export default function CommandCenter() {
  const [query, setQuery] = useState("");
  const [launched, setLaunched] = useState<Agent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const agents = useMemo(() => filterAgents(query), [query]);
  const online = AGENTS.filter((a) => a.status === "online").length;

  return (
    <div className="cc-root">
      <div className="cc-aurora" aria-hidden="true" />

      <div className="cc-shell">
        {/* -------- navigation -------- */}
        <Sidebar />

        {/* -------- contenu principal -------- */}
        <main className="flex min-w-0 flex-col gap-5">
          <Topbar query={query} onQueryChange={setQuery} onOpenMenu={() => setDrawerOpen(true)} />

          {/* ======== AGENTS IA — élément principal de la page ======== */}
          <section aria-label="Agents IA">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1"
            >
              <div>
                <p className="cc-kicker mb-1">Centre de Commandement IA</p>
                <h1 className="cc-display flex items-center gap-2.5 text-[clamp(1.4rem,3vw,1.85rem)] font-extrabold leading-tight">
                  <Users size={26} style={{ color: "var(--cc-brand)" }} aria-hidden="true" />
                  Vos agents IA
                </h1>
              </div>
              <span className="cc-status" style={{ color: "var(--cc-online)", background: "var(--cc-online-soft)" }}>
                <span className="cc-status-dot is-live" />
                {online} agents en ligne · {agents.length} affiché{agents.length > 1 ? "s" : ""}
              </span>
            </motion.div>

            {agents.length > 0 ? (
              <motion.div
                variants={gridVariants}
                initial="hidden"
                animate="show"
                className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
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

          {/* ======== Vue d'ensemble — zone secondaire ======== */}
          <section aria-label="Vue d'ensemble" className="mt-2 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 px-1">
              <LayoutDashboard size={18} style={{ color: "var(--cc-brand)" }} aria-hidden="true" />
              <h2 className="cc-display text-[1.05rem] font-extrabold">Vue d'ensemble</h2>
            </div>

            <StatTiles />

            <div className="grid gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <ActivityChart />
              </div>
              <div className="flex flex-col gap-5">
                <WeatherWidget />
                <QuickActions />
              </div>
              <div className="xl:col-span-2">
                <RecentProjects />
              </div>
              <CalendarWidget />
            </div>
          </section>
        </main>
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
