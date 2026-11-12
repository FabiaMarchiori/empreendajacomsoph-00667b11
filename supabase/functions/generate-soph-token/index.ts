import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Caracteres permitidos (excluindo 0, O, 1, I, L para evitar confusão visual)
const ALLOWED_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateShortCode(): string {
  let part1 = "";
  let part2 = "";

  for (let i = 0; i < 4; i++) {
    part1 += ALLOWED_CHARS[Math.floor(Math.random() * ALLOWED_CHARS.length)];
    part2 += ALLOWED_CHARS[Math.floor(Math.random() * ALLOWED_CHARS.length)];
  }

  return `SOPH-${part1}-${part2}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[generate-soph-token] Request received");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log("[generate-soph-token] No auth header");
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Cliente para autenticação do usuário
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Cliente com service role para operações no banco
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar usuário autenticado
    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser();

    if (userError || !user) {
      console.log("[generate-soph-token] User not authenticated");
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("[generate-soph-token] User authenticated:", user.id);

    if (user.email_confirmed_at) {
      const { error: claimError } = await supabaseAuth.rpc(
        "claim_subscriptions_for_current_user",
      );
      if (claimError) throw new Error("Unable to claim verified subscription");
    }

    // Verificar se tem assinatura ativa ou é admin
    const { data: subscription } = await supabaseAdmin
      .from("assinaturas")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "ativa")
      .or(
        `data_expiracao.is.null,data_expiracao.gt.${new Date().toISOString()}`,
      )
      .limit(1)
      .maybeSingle();

    const { data: isAdmin, error: adminError } =
      await supabaseAuth.rpc("is_admin");
    if (adminError) throw new Error("Unable to verify administrator role");
    const hasActiveSubscription = !!subscription;

    if (!hasActiveSubscription && !isAdmin) {
      console.log("[generate-soph-token] User has no access");
      return new Response(
        JSON.stringify({ error: "Assinatura ativa necessária" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      "[generate-soph-token] User has access (subscription or admin)",
    );

    // Verificar se usuário já tem código ativo e válido
    const { data: existingCode } = await supabaseAdmin
      .from("soph_access_codes")
      .select("code, expires_at")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingCode) {
      console.log("[generate-soph-token] Returning existing access code");
      return new Response(
        JSON.stringify({
          token: existingCode.code,
          expires_at: existingCode.expires_at,
          is_existing: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Gerar novo código único
    let code = generateShortCode();
    let attempts = 0;
    const maxAttempts = 10;

    // Garantir unicidade do código
    while (attempts < maxAttempts) {
      const { data: existing } = await supabaseAdmin
        .from("soph_access_codes")
        .select("id")
        .eq("code", code)
        .maybeSingle();

      if (!existing) break;

      code = generateShortCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log("[generate-soph-token] Failed to generate unique code");
      return new Response(
        JSON.stringify({ error: "Erro ao gerar código. Tente novamente." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Calcular data de expiração (6 meses)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    // Inserir novo código
    const { error: insertError } = await supabaseAdmin
      .from("soph_access_codes")
      .insert({
        code,
        user_id: user.id,
        email: user.email,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.log("[generate-soph-token] Insert failed");
      return new Response(JSON.stringify({ error: "Erro ao salvar código" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[generate-soph-token] New access code generated");

    return new Response(
      JSON.stringify({
        token: code,
        expires_at: expiresAt.toISOString(),
        is_existing: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[generate-soph-token] Internal error");
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
