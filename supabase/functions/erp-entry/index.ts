import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Token de autenticação ausente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("[erp-entry] Auth error:", userError?.message);
      return new Response(
        JSON.stringify({ error: "UNAUTHORIZED", message: "Token inválido ou expirado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    const userEmail = user.email!;
    console.log(`[erp-entry] Authenticated user: ${userId} (${userEmail})`);

    // 2. Validate ERP-specific access (not just any subscription)
    const { data: hasAccess, error: accessError } = await supabase.rpc(
      "has_erp_access",
      { check_user_id: userId }
    );

    if (accessError) {
      console.error("Access check error:", accessError.message);
      return new Response(
        JSON.stringify({ error: "ACCESS_CHECK_FAILED", message: "Erro ao verificar acesso." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasAccess) {
      return new Response(
        JSON.stringify({
          error: "NO_ACCESS",
          message: "Você não possui acesso ao ERP Soph. Verifique seu plano.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Get user profile for full_name
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    const fullName = profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") || userEmail
      : userEmail;

    // 4. Call ERP edge function securely
    const ecosystemSecret = Deno.env.get("ECOSYSTEM_SHARED_SECRET");
    console.log(`[erp-entry] ECOSYSTEM_SHARED_SECRET present: ${!!ecosystemSecret}, length: ${ecosystemSecret?.length ?? 0}, first4: ${ecosystemSecret?.substring(0, 4) ?? "N/A"}`);
    if (!ecosystemSecret) {
      console.error("ECOSYSTEM_SHARED_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "CONFIG_ERROR", message: "Configuração de integração ausente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const erpUrl = Deno.env.get("ERP_SOPH_URL") || "https://kgbodlrfbtpiqjbinpxn.supabase.co";
    const erpEndpoint = `${erpUrl}/functions/v1/ecosystem-receive-user`;

    const erpPayload = {
      ecosystem_user_id: userId,
      email: userEmail,
      full_name: fullName,
    };

    console.log(`[erp-entry] Calling ERP for user ${userId} (${userEmail})`);

    const erpResponse = await fetch(erpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ecosystem-secret": ecosystemSecret,
      },
      body: JSON.stringify(erpPayload),
    });

    const erpData = await erpResponse.json();

    if (!erpResponse.ok) {
      console.error(`[erp-entry] ERP returned ${erpResponse.status}:`, erpData);
      return new Response(
        JSON.stringify({
          error: erpData.error || "ERP_ERROR",
          message: erpData.message || "Erro ao comunicar com o ERP Soph.",
        }),
        { status: erpResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[erp-entry] Success for user ${userId} — is_new: ${erpData.is_new_user}, erp_user_id: ${erpData.erp_user_id}`
    );

    // 5. Return success with ERP data
    return new Response(
      JSON.stringify({
        success: true,
        is_new_user: erpData.is_new_user,
        erp_user_id: erpData.erp_user_id,
        ecosystem_user_id: erpData.ecosystem_user_id,
        email: erpData.email,
        erp_status: erpData.erp_status,
        entry_url: erpData.entry_url,
        message: erpData.message,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[erp-entry] Internal error:", err);
    return new Response(
      JSON.stringify({ error: "INTERNAL_ERROR", message: "Erro interno na integração." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
