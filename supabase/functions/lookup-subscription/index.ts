import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Only authenticated customers may look up their own active plan.
// Never trust an email supplied by a caller or reveal another buyer's details.
const ALLOWED_ORIGINS = new Set([
  "https://appempreendajacomsoph.netlify.app",
  "https://empreendajacomsophi.netlify.app",
  "https://appempreendajacomsoph.lovable.app",
]);
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
];

// CORS is not authentication: it only stops other websites from reading responses in a browser.
function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) || ALLOWED_ORIGIN_PATTERNS.some((p) => p.test(origin));
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://appempreendajacomsoph.netlify.app",
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}


let corsHeaders: Record<string, string> = {};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return respond(405, { error: "Method not allowed" });

  const token = req.headers.get("Authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return respond(401, { error: "Authentication required" });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return respond(500, { error: "Service unavailable" });

  try {
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user?.id || !user.email || !user.email_confirmed_at) {
      return respond(401, { error: "Verified session required" });
    }

    const admin = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await admin
      .from("assinaturas")
      .select("plano")
      .eq("user_id", user.id)
      .eq("status", "ativa")
      .order("data_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) console.error(`[lookup-subscription] Query failed for user ${user.id}:`, error.code);
    if (error) return respond(500, { error: "Unable to load subscription" });
    if (data?.plano) return respond(200, { plano: data.plano });

    // Kiwify can record a purchase before the buyer creates an app account.
    // For presentation only, look up the email verified by Supabase Auth.
    // Never accept an email from the request body or URL.
    const { data: emailSubscription, error: emailError } = await admin
      .from("assinaturas")
      .select("plano")
      .eq("email", user.email.trim().toLowerCase())
      .eq("status", "ativa")
      .order("data_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (emailError) return respond(500, { error: "Unable to load subscription" });
    return respond(200, { plano: emailSubscription?.plano ?? null });
  } catch (err) {
    console.error("[lookup-subscription] Internal error:", err instanceof Error ? err.message : "unknown");
    return respond(500, { error: "Unable to load subscription" });
  }
});
