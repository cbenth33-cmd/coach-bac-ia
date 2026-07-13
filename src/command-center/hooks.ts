import { useEffect, useState } from "react";

/* ================================================================
   HOOKS partagés du Centre de Commandement.
   ================================================================ */

export type Theme = "light" | "dark";

const THEME_KEY = "coachbac_theme"; // même clé que l'app Coach Bac (thème unifié)

/**
 * Thème clair/sombre synchronisé avec l'attribut `data-theme` posé
 * sur <html> par index.html avant le premier rendu (zéro flash).
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* stockage indisponible (navigation privée) : le thème reste en mémoire */
      }
      return next;
    });
  };

  return [theme, toggle];
}

/** Horloge temps réel (précision : seconde). */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

/** Raccourci clavier « / » ou « ⌘K / Ctrl+K » pour focaliser la recherche. */
export function useSearchShortcut(ref: React.RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isSlash = e.key === "/" && !(e.target instanceof HTMLInputElement);
      const isCmdK = e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey);
      if (isSlash || isCmdK) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref]);
}
