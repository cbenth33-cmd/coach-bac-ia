// Coach Bac IA — proxy sécurisé vers l'API Anthropic.
// La clé API reste côté serveur : Dashboard → Edge Functions → Secrets → ANTHROPIC_API_KEY
// Le client appelle cette fonction avec la clé publique (anon) Supabase en Authorization.

const CORS = {
  "Access-Control-Allow-Origin": "*", // TODO prod : restreindre au domaine du site
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  try {
    const { system, messages } = await req.json();

    // Garde-fous anti-abus : formats et tailles bornés
    if (typeof system !== "string" || !Array.isArray(messages)) return json({ error: "Requête invalide" }, 400);
    if (messages.length > 30 || system.length > 8000) return json({ error: "Conversation trop longue" }, 413);
    for (const m of messages) {
      if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || m.content.length > 4000)
        return json({ error: "Message invalide" }, 400);
    }

    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) return json({ error: "ANTHROPIC_API_KEY non configurée (Dashboard → Edge Functions → Secrets)" }, 500);

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }),
    });
    return new Response(await r.text(), { status: r.status, headers: { ...CORS, "content-type": "application/json" } });
  } catch (e) {
    return json({ error: String(e) }, 400);
  }
});
