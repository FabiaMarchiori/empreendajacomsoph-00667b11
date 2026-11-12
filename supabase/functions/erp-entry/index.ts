import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "../_shared/http.ts";
import { logEvent } from "../_shared/diagnostics.ts";

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  const corsHeaders = { ...buildCorsHeaders(req), "X-Request-Id": requestId };
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        Allow: "POST, OPTIONS",
        "Content-Type": "application/json",
      },
    });

  try {
    // 1. Authenticate the calling user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "UNAUTHORIZED",
          message: "Token de autenticação ausente.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      logEvent("warn", "erp.auth_failed", { request_id: requestId });
      return new Response(
        JSON.stringify({
          error: "UNAUTHORIZED",
          message: "Token inválido ou expirado.",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const userId = user.id;
    const userEmail = user.email!;
    logEvent("info", "erp.authenticated", {
      request_id: requestId,
      user_id: userId,
    });

    // 2. Validate ERP-specific access (not just any subscription)
    const { data: hasAccess, error: accessError } = await supabase.rpc(
      "has_erp_access",
      { check_user_id: userId },
    );

    if (accessError) {
      logEvent("error", "erp.access_check_failed", {
        request_id: requestId,
        user_id: userId,
        code: accessError,
      });
      return new Response(
        JSON.stringify({
          error: "ACCESS_CHECK_FAILED",
          message: "Erro ao verificar acesso.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!hasAccess) {
      return new Response(
        JSON.stringify({
          error: "NO_ERP_ACCESS",
          message:
            "O ERP Soph é um módulo premium. Ative este módulo para acessar gestão completa.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // 3. Get user profile for full_name
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", userId)
      .single();

    const fullName = profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        userEmail
      : userEmail;

    // 4. Call ERP edge function securely
    const ecosystemSecret = Deno.env.get("ECOSYSTEM_SHARED_SECRET");
    if (!ecosystemSecret) {
      logEvent("error", "erp.configuration_missing", { request_id: requestId });
      return new Response(
        JSON.stringify({
          error: "CONFIG_ERROR",
          message: "Configuração de integração ausente.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const erpUrl =
      Deno.env.get("ERP_SOPH_URL") ||
      "https://kgbodlrfbtpiqjbinpxn.supabase.co";
    const erpEndpoint = `${erpUrl}/functions/v1/ecosystem-receive-user`;

    const erpPayload = {
      ecosystem_user_id: userId,
      email: userEmail,
      full_name: fullName,
    };

    logEvent("info", "erp.upstream_request", {
      request_id: requestId,
      user_id: userId,
    });

    const erpResponse = await fetch(erpEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ecosystem-secret": ecosystemSecret,
      },
      body: JSON.stringify(erpPayload),
    });

    const erpData = await erpResponse.json().catch(() => ({}));

    if (!erpResponse.ok) {
      logEvent("error", "erp.upstream_failed", {
        request_id: requestId,
        user_id: userId,
        http_status: erpResponse.status,
      });
      const knownErrors = [
        "NO_ACCESS",
        "UNAUTHORIZED",
        "MISSING_ECOSYSTEM_USER_ID",
        "MISSING_OR_INVALID_EMAIL",
        "UPSERT_FAILED",
      ];
      const errorCode = knownErrors.includes(erpData.error)
        ? erpData.error
        : "ERP_ERROR";
      return new Response(
        JSON.stringify({
          error: errorCode,
          message: "Erro ao comunicar com o ERP Soph.",
        }),
        {
          status: erpResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    logEvent("info", "erp.success", { request_id: requestId, user_id: userId });

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
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    logEvent("error", "erp.internal_error", { request_id: requestId });
    return new Response(
      JSON.stringify({
        error: "INTERNAL_ERROR",
        message: "Erro interno na integração.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
