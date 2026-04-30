// Public edge function: returns the active subscription plan for the user.
// Strategy:
// 1. If `email` is provided, look up the most recent active subscription for that email.
// 2. Otherwise (or as fallback), return the most recent active subscription created in the last 10 minutes.
// Used by /obrigado to render dynamic content based on the purchased plan.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let email = url.searchParams.get("email");
    if (!email && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      email = body?.email ?? null;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1) Try by email first (priority)
    if (email && email.trim()) {
      const { data } = await supabase
        .from("assinaturas")
        .select("plano, email, data_inicio")
        .ilike("email", email.trim())
        .eq("status", "ativa")
        .order("data_inicio", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.plano) {
        return jsonResponse({ plano: data.plano, email: data.email, source: "email" });
      }
    }

    // 2) Fallback: most recent active subscription in the last 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recent } = await supabase
      .from("assinaturas")
      .select("plano, email, data_inicio")
      .eq("status", "ativa")
      .gte("data_inicio", tenMinAgo)
      .order("data_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.plano) {
      return jsonResponse({ plano: recent.plano, email: recent.email, source: "recent" });
    }

    return jsonResponse({ plano: null });
  } catch (err: any) {
    return jsonResponse({ plano: null, error: String(err?.message ?? err) });
  }
});

function jsonResponse(data: Record<string, unknown>) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}
