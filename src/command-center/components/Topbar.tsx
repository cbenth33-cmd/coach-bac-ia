import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Menu, Moon, Search, Sparkles, Sun } from "lucide-react";
import { NOTIFICATIONS } from "../data/dashboard";
import { useClock, useSearchShortcut, useTheme } from "../hooks";

/* ================================================================
   TOPBAR — recherche intelligente, notifications, bascule de thème.
   ================================================================ */

interface TopbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onOpenMenu: () => void;
}

export default function Topbar({ query, onQueryChange, onOpenMenu }: TopbarProps) {
  const [theme, toggleTheme] = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const now = useClock();
  useSearchShortcut(searchRef);

  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  /* Ferme le panneau de notifications au clic extérieur / Échap */
  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: PointerEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setNotifOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, [notifOpen]);

  return (
    <header className="flex items-center gap-3">
      {/* Menu mobile */}
      <button type="button" onClick={onOpenMenu} className="cc-iconbtn md:hidden" aria-label="Ouvrir le menu">
        <Menu size={19} />
      </button>

      {/* Recherche intelligente */}
      <div className="cc-search flex-1" role="search">
        <Search size={17} strokeWidth={2.2} style={{ color: "var(--cc-mute)" }} />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Rechercher un agent, un projet, une action…"
          aria-label="Recherche intelligente"
        />
        <span className="cc-kbd hidden sm:inline">⌘K</span>
      </div>

      {/* Horloge + date (compactes) */}
      <div className="hidden text-right lg:block" role="timer" aria-label="Horloge">
        <p className="cc-display text-[1.05rem] font-extrabold tabular-nums leading-none">
          {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </p>
        <p className="mt-0.5 text-[0.66rem] font-bold capitalize" style={{ color: "var(--cc-mute)" }}>
          {now.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
        </p>
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative">
        <button
          type="button"
          className="cc-iconbtn relative"
          aria-label={`Notifications (${unread} non lues)`}
          aria-expanded={notifOpen}
          onClick={() => setNotifOpen((v) => !v)}
        >
          <Bell size={19} />
          {unread > 0 && (
            <span
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.62rem] font-extrabold text-white"
              style={{ background: "linear-gradient(120deg, var(--cc-brand), var(--cc-brand-2))" }}
            >
              {unread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="cc-glass absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(92vw,22rem)] origin-top-right p-2"
              role="dialog"
              aria-label="Zone de notifications"
            >
              <div className="flex items-center justify-between px-3 pb-1 pt-2">
                <p className="cc-display text-sm font-extrabold">Notifications</p>
                <span className="cc-kicker">{unread} nouvelles</span>
              </div>
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="cc-row items-start">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "var(--cc-brand-soft)", color: "var(--cc-brand)" }}
                  >
                    <n.icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.8rem] font-bold leading-snug">
                      {n.title}
                      {n.unread && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full align-middle" style={{ background: "var(--cc-brand)" }} />
                      )}
                    </p>
                    <p className="text-[0.75rem] leading-snug" style={{ color: "var(--cc-ink-2)" }}>{n.body}</p>
                    <p className="mt-0.5 text-[0.68rem] font-semibold" style={{ color: "var(--cc-mute)" }}>{n.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bascule clair / sombre */}
      <button
        type="button"
        className="cc-iconbtn"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ rotate: -70, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 70, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.22 }}
            className="flex"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* Action signature (masquée sur mobile via le conteneur : .cc-btn force display) */}
      <div className="hidden sm:block">
        <button type="button" className="cc-btn cc-btn-brand">
          <Sparkles size={16} />
          Nouvelle session
        </button>
      </div>
    </header>
  );
}
