// Public edge function: returns the most recent active subscription plan for a given email.
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
    if (!email) {
      return new Response(JSON.stringify({ plano: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await supabase
      .from("assinaturas")
      .select("plano, status, data_inicio, data_expiracao")
      .ilike("email", email.trim())
      .eq("status", "ativa")
      .order("data_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return new Response(
      JSON.stringify({ plano: data?.plano ?? null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ plano: null, error: String(err?.message ?? err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  }
});
