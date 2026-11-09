import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Only authenticated customers may look up their own active plan.
// Never trust an email supplied by a caller or reveal another buyer's details.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
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
  } catch {
    return respond(500, { error: "Unable to load subscription" });
  }
});
