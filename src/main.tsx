import React, { Suspense, lazy, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import CommandCenter from "./command-center/CommandCenter";
import "./index.css";

/* ================================================================
   POINT D'ENTRÉE — mini routeur par hash.
   ─ Accueil (défaut)  : Centre de Commandement IA
   ─ #/coach-bac       : application Coach Bac IA existante
   L'app Coach Bac est chargée à la demande (code-splitting).
   ================================================================ */

const CoachBacApp = lazy(() => import("./App"));

function useHashRoute(): string {
  const [route, setRoute] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function Root() {
  const route = useHashRoute();
  const isCoachBac = route.startsWith("#/coach-bac");

  useEffect(() => {
    document.title = isCoachBac ? "Coach Bac IA" : "Centre de Commandement IA";
  }, [isCoachBac]);

  if (isCoachBac) {
    return (
      <Suspense fallback={null}>
        <CoachBacApp />
      </Suspense>
    );
  }
  return <CommandCenter />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
