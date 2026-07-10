// Supabase Edge Function : proxy sécurisé vers l'API Anthropic.
// Déploiement :
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy coach-chat
// Puis VITE_CLAUDE_PROXY_URL=https://<projet>.supabase.co/functions/v1/coach-chat

const CORS = {
  "Access-Control-Allow-Origin": "*", // restreindre au domaine de prod
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { system, messages } = await req.json();
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages,
      }),
    });
    return new Response(await r.text(), {
      status: r.status,
      headers: { ...CORS, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...CORS, "content-type": "application/json" },
    });
  }
});
