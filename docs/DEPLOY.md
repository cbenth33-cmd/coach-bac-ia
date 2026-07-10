# Guide de mise en ligne — Coach Bac IA

## 1. Créer le dépôt GitHub et pousser le code

```bash
cd coach-bac-ia
# le dépôt Git local est déjà initialisé avec l'historique des commits
gh auth login                                  # une seule fois
gh repo create coach-bac-ia --private --source=. --push
```

Sans GitHub CLI :
```bash
git remote add origin https://github.com/<votre-compte>/coach-bac-ia.git
git push -u origin main
```

## 2. Activer GitHub Pages
Sur GitHub : **Settings → Pages → Source : « GitHub Actions »**. C'est tout — chaque push sur `main` publie le site sur `https://<votre-compte>.github.io/coach-bac-ia/`.

## 3. Brancher le Chat coach (Supabase)
1. Créer un projet gratuit sur supabase.com
2. Installer la CLI : `npm i -g supabase`
3. `supabase login`, puis `supabase link --project-ref <ref>`
4. `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...` (clé créée sur console.anthropic.com)
5. `supabase functions deploy coach-chat`
6. Copier `.env.example` vers `.env` et renseigner `VITE_CLAUDE_PROXY_URL`

## 4. Domaine personnalisé (optionnel)
GitHub Pages accepte un domaine (ex. coachbac.diyiahcrearts.fr) : **Settings → Pages → Custom domain**, puis créer un CNAME chez votre registrar.
