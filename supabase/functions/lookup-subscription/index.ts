import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCorsHeaders } from "../_shared/http.ts";
import { logEvent } from "../_shared/diagnostics.ts";

// Only authenticated customers may look up their own active plan.
// Never trust an email supplied by a caller or reveal another buyer's details.

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const corsHeaders = { ...buildCorsHeaders(req), "X-Request-Id": requestId };
  const respond = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST")
    return respond(405, { error: "Method not allowed" });

  const token = req.headers
    .get("Authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return respond(401, { error: "Authentication required" });

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey)
    return respond(500, { error: "Service unavailable" });

  try {
    const authClient = createClient(url, anonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);
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
    if (error)
      logEvent("error", "lookup.query_failed", {
        request_id: requestId,
        user_id: user.id,
        code: error,
      });
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
    if (emailError)
      return respond(500, { error: "Unable to load subscription" });
    return respond(200, { plano: emailSubscription?.plano ?? null });
  } catch (err) {
    logEvent("error", "lookup.internal_error", { request_id: requestId });
    return respond(500, { error: "Unable to load subscription" });
  }
});
