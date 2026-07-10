# Coach Bac IA

Accompagnement personnalisé au baccalauréat français : calcul officiel des points et mentions, coach IA, planning intelligent de révision, quiz, fiches, statistiques et suivi administratif (Mode Rectorat).

**Stack :** Vite · React 19 · TypeScript (strict) · Tailwind CSS v4 · Recharts · Vitest · API Claude (Anthropic)

## Démarrage

```bash
npm install
npm run dev        # développement (http://localhost:5173)
npm test           # tests du moteur de calcul (8 tests)
npm run typecheck  # vérification TypeScript strict
npm run build      # build de production (dist/)
```

## Architecture

```
src/
├── core/bac-engine.ts    # Moteur officiel : coefficients (60 EF + 40 CC),
│                         # mentions, calcul des points — testé (bac-engine.test.ts)
├── coach/analysis.ts     # Priorisation coefficient × écart, plan, planning hebdo
├── data/
│   ├── referentiels.ts   # 33 académies, filières, séries techno, échéancier rectorat
│   └── contenu.ts        # Banque de quiz, fiches méthode, structure des annales
├── lib/
│   ├── storage.ts        # Persistance (localStorage → Supabase en phase 2)
│   └── claude.ts         # Client du Chat coach (via proxy sécurisé)
├── App.tsx               # Shell + écrans (Dashboard, Notes, Coach, Chat, Planning,
│                         # Quiz, Fiches, Stats, Rectorat, Profils, Onboarding)
└── index.css             # Design system « surligneur » (Tailwind v4)
supabase/functions/coach-chat/  # Edge Function : proxy API Anthropic (la clé reste côté serveur)
.github/workflows/deploy.yml    # CI : build + déploiement GitHub Pages automatique
```

**Principe clé :** la logique métier (`core/`, `coach/`) est en fonctions pures, sans dépendance UI ni stockage. Migrer vers Supabase ou brancher un autre modèle d'IA ne touche que `lib/`.

## Chat coach IA

Le chat connaît le profil de l'élève (notes, coefficients, objectif, priorités calculées) via un prompt système généré par `lib/claude.ts`.

⚠️ **La clé API Anthropic ne doit jamais être livrée dans le code client.** Déployez le proxy fourni :

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy coach-chat
# puis dans .env :
VITE_CLAUDE_PROXY_URL=https://<votre-projet>.supabase.co/functions/v1/coach-chat
```

Sans proxy configuré, l'app fonctionne entièrement — le chat affiche simplement les instructions de configuration.

## Déploiement GitHub Pages

Le workflow `.github/workflows/deploy.yml` se déclenche à chaque push sur `main` :
1. Sur GitHub : *Settings → Pages → Source : GitHub Actions* (une fois).
2. `git push` — le site est construit et publié automatiquement.

## Roadmap

- **Phase 2 :** Supabase (auth, base de données multi-appareils, RLS), PWA hors-ligne, notifications d'échéances
- **Phase 3 :** annales par académie synchronisées, génération de quiz par IA, options (LCA, maths expertes) dans le calcul
- **Phase 4 :** abonnements Stripe (freemium), tableau de bord administrateur, conformité RGPD mineurs

---
© BENTH Hérédia — DIYIAH CREARTS · diyiahcrearts@gmail.com
