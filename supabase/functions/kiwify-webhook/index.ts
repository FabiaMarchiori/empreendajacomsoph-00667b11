import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const webhookToken = Deno.env.get("KIWIFY_WEBHOOK_TOKEN");

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Validate webhook token
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get("token");
    const tokenHeader = req.headers.get("x-webhook-token");
    const receivedToken = tokenParam || tokenHeader;

    if (!webhookToken || receivedToken !== webhookToken) {
      console.error("[kiwify-webhook] Invalid or missing token");
      await logWebhook(supabase, "token_invalid", { receivedToken: !!receivedToken }, "rejected", "Token inválido");
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // 2. Parse payload
    const payload = await req.json();
    const eventType = payload?.order_status || payload?.event || "unknown";
    const email = payload?.Customer?.email?.toLowerCase()?.trim();
    const customerName = payload?.Customer?.full_name || null;
    const customerId = payload?.Customer?.id || null;
    const subscriptionId = payload?.Subscription?.id || payload?.order_id || payload?.Transaction?.order_id || null;
    const rawProductName = payload?.Product?.name || payload?.product?.name || "Ecossistema EmpreendaJá";
    const productId = payload?.Product?.id || payload?.product_id || payload?.Product?.product_id || null;
    const amount = payload?.Commissions?.charge_amount
      ? parseFloat(payload.Commissions.charge_amount) / 100
      : payload?.purchase?.price || null;

    // Normaliza o nome do plano para os tokens que o app usa em usePlanAccess
    // Detecta o nicho "Bolsas, Mochilas e Malas" pelo nome do produto OU valor R$19,99
    const lowerName = String(rawProductName).toLowerCase();
    const isBolsasNicho =
      lowerName.includes("bolsa") ||
      lowerName.includes("mochila") ||
      lowerName.includes("mala") ||
      (amount !== null && Math.abs(Number(amount) - 19.99) < 0.5);

    const productName = isBolsasNicho ? "bolsas_1999" : rawProductName;
    console.log(`[kiwify-webhook] Produto detectado: ${rawProductName} -> plano: ${productName} (nicho_bolsas=${isBolsasNicho})`);

    console.log(`[kiwify-webhook] Event: ${eventType}, Email: ${email}, SubID: ${subscriptionId}`);

    if (!email) {
      await logWebhook(supabase, eventType, payload, "error", "Email ausente no payload");
      return jsonResponse({ error: "Email ausente" }, 400);
    }

    if (!subscriptionId) return jsonResponse({ error: "Identificador estável da compra necessário" }, 422);

    // 3. Handle events
    if (eventType === "approved" || eventType === "order_approved" || eventType === "paid") {
      // Check for duplicate
      if (subscriptionId) {
        const { data: existing } = await supabase
          .from("assinaturas")
          .select("id, email, nome_cliente, status")
          .eq("kiwify_subscription_id", subscriptionId)
          .maybeSingle();

        if (existing && existing.status !== "ativa") {
          await logWebhook(supabase, eventType, {}, "review_required", "Aprovação após estado terminal exige conciliação de renovação/eventos");
          return jsonResponse({ error: "Conciliação de eventos necessária" }, 409);
        }
        if (existing) {
          await ensureAuthorizedClient(supabase, existing.email, customerId, subscriptionId);
          await linkVerifiedOwner(supabase, existing.id, existing.email);
          const retriedEmail = await sendAccessEmail({ supabase, eventType, payload, subscriptionId, assinaturaId: existing.id, email: existing.email, customerName: existing.nome_cliente });
          if (retriedEmail === "failed") return jsonResponse({ error: "Comunicação pendente de recuperação" }, 503);
          console.log(`[kiwify-webhook] Duplicate ignored: ${subscriptionId}`);
          await logWebhook(supabase, eventType, payload, "duplicate", "Assinatura já existe e está ativa");
          return jsonResponse({ success: true, message: "Já processado" });
        }
      }

      // Upsert assinatura
      const { data: insertedSubscription, error: subError } = await supabase.from("assinaturas").upsert(
        {
          kiwify_subscription_id: subscriptionId,
          kiwify_customer_id: customerId,
          email,
          nome_cliente: customerName,
          status: "ativa",
          plano: productName,
          valor: amount,
          data_inicio: new Date().toISOString(),
          data_expiracao: null,
        },
        { onConflict: "kiwify_subscription_id", ignoreDuplicates: true }
      ).select("id, status, email, nome_cliente").maybeSingle();

      const { data: storedSubscription, error: storedError } = insertedSubscription ? { data: insertedSubscription, error: null } : await supabase.from("assinaturas").select("id, status, email, nome_cliente").eq("kiwify_subscription_id", subscriptionId).maybeSingle();
      const subscription = storedSubscription;

      if (subError || storedError || subscription?.status !== "ativa") {
        const message = subError?.message || "Assinatura não ficou ativa após o registro";
        console.error("[kiwify-webhook] Upsert assinatura error:", message);
        await logWebhook(supabase, eventType, payload, "error", message);
        return jsonResponse({ error: "Erro ao registrar assinatura" }, 500);
      }

      await ensureAuthorizedClient(supabase, subscription.email, customerId, subscriptionId);

      await linkVerifiedOwner(supabase, subscription.id, subscription.email);

      const emailStatus = await sendAccessEmail({
        supabase,
        eventType,
        payload,
        subscriptionId,
        assinaturaId: subscription.id,
        email: subscription.email,
        customerName: subscription.nome_cliente,
      });

      if (emailStatus === "failed") return jsonResponse({ error: "Comunicação pendente de recuperação" }, 503);

      const accessMessage =
        emailStatus === "skipped_missing_subscription_id"
          ? `Acesso liberado para ${email}; e-mail não enviado: identificador estável da compra ausente`
          : `Acesso liberado para ${email}`;
      await logWebhook(supabase, eventType, payload, "success", accessMessage);
      console.log(`[kiwify-webhook] Access granted for ${email}`);
      return jsonResponse({ success: true, message: "Acesso liberado" });

    } else if (
      eventType === "refunded" ||
      eventType === "order_refunded" ||
      eventType === "chargeback" ||
      eventType === "subscription_cancelled"
    ) {
      const newStatus =
        eventType === "refunded" || eventType === "order_refunded"
          ? "reembolsada"
          : eventType === "chargeback"
          ? "cancelada"
          : "cancelada";

      if (subscriptionId) {
        const { error: revokeError } = await supabase
          .from("assinaturas")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("kiwify_subscription_id", subscriptionId);
        if (revokeError) throw new Error("Unable to record cancellation");
      }

      const { error: clientRevokeError } = await supabase
        .from("clientes_autorizados")
        .update({ status_assinatura: "inativa" })
        .eq("email", email);
      if (clientRevokeError) throw new Error("Unable to record client cancellation");

      await logWebhook(supabase, eventType, payload, "success", `Acesso revogado para ${email}`);
      console.log(`[kiwify-webhook] Access revoked for ${email}`);
      return jsonResponse({ success: true, message: "Acesso revogado" });

    } else {
      // Unknown event — log but don't fail
      await logWebhook(supabase, eventType, payload, "ignored", "Evento não tratado");
      console.log(`[kiwify-webhook] Ignored event: ${eventType}`);
      return jsonResponse({ success: true, message: "Evento ignorado" });
    }
  } catch (err) {
    console.error("[kiwify-webhook] Internal error:", err);
    await logWebhook(supabase, "internal_error", {}, "error", String(err));
    return jsonResponse({ error: "Erro interno" }, 500);
  }
});

type SendAccessEmailInput = {
  supabase: SupabaseClient;
  eventType: string;
  payload: unknown;
  subscriptionId: string | null;
  assinaturaId: string;
  email: string;
  customerName: string | null;
};

async function sendAccessEmail({
  supabase,
  eventType,
  payload,
  subscriptionId,
  assinaturaId,
  email,
  customerName,
}: SendAccessEmailInput): Promise<"sent" | "failed" | "already_processed" | "skipped_missing_subscription_id"> {
  if (!subscriptionId) {
    console.warn("[kiwify-webhook] E-mail de acesso ignorado: identificador estável da compra ausente");
    return "skipped_missing_subscription_id";
  }

  const { data: reservation, error: reservationError } = await supabase.rpc("reserve_access_email", {
    p_subscription_id: subscriptionId, p_assinatura_id: assinaturaId,
  });
  if (reservationError || !reservation) return "failed";
  const communication = reservation as { state: string; id: string; token: string; email: string };
  if (communication.state === "sent" || communication.state === "busy") return "already_processed";
  if (communication.state !== "reserved") return "failed";
  const finish = async (success: boolean, messageId: string | null, error: string | null, uncertain = false) => {
    const { data, error: writeError } = await supabase.rpc("finish_access_email", {
      p_id: communication.id, p_token: communication.token, p_success: success,
      p_message_id: messageId, p_error: error, p_uncertain: uncertain,
    });
    return !writeError && data === true;
  };
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  if (!brevoApiKey) {
    await finish(false, null, "BREVO_API_KEY não configurada");
    return "failed";
  }
  const { data: canDispatch, error: dispatchError } = await supabase.rpc("begin_access_email_dispatch", { p_id: communication.id, p_token: communication.token });
  if (dispatchError || !canDispatch) return "failed";
  try {
    const recipientName = customerName?.trim() || "Empreendedor(a)";
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST", signal: AbortSignal.timeout(30000),
      headers: { accept: "application/json", "api-key": brevoApiKey, "content-type": "application/json" },
      body: JSON.stringify({ to: [{ email: communication.email, name: recipientName }], templateId: 5, params: { nome: recipientName }, tags: ["acesso_liberado"] }),
    });
    if (!response.ok) {
      await finish(false, null, `Brevo HTTP ${response.status}`, response.status >= 500);
      return "failed";
    }
    const body: { messageId?: unknown } = await response.json().catch(() => ({}));
    const messageId = typeof body.messageId === "string" ? body.messageId : null;
    return await finish(true, messageId, null) ? "sent" : "failed";
  } catch {
    // The provider may have accepted the request before a network failure.
    await finish(false, null, "Entrega incerta: conciliar recibo Brevo antes de repetir", true);
    return "failed";
  }
}

async function ensureAuthorizedClient(supabase: SupabaseClient, email: string, customerId: string | null, subscriptionId: string) {
  // Unique email + ignoreDuplicates preserves original customer/product identifiers.
  const { error: insertError } = await supabase.from("clientes_autorizados").upsert({ email, status_assinatura: "ativa", customer_id: customerId, produto_id: subscriptionId, data_compra: new Date().toISOString() }, { onConflict: "email", ignoreDuplicates: true });
  if (insertError) throw new Error("Unable to register authorized client");
  const { error: updateError } = await supabase.from("clientes_autorizados").update({ status_assinatura: "ativa" }).eq("email", email);
  if (updateError) throw new Error("Unable to authorize client");
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logWebhook(
  supabase: SupabaseClient,
  evento: string,
  payload: unknown,
  status: string,
  message: string | null
) {
  try {
    await supabase.from("webhook_logs").insert({
      evento,
      payload: payload as Record<string, unknown>,
      status,
      error_message: message,
    });
  } catch (e) {
    console.error("[kiwify-webhook] Failed to log:", e);
  }
}

async function linkVerifiedOwner(
  supabase: SupabaseClient,
  subscriptionId: string,
  email: string,
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (profileError) throw new Error("Unable to load subscription owner");
  if (profile) {
    // Only confirmed owners can have a purchase linked to their account.
    const { data: verifiedAccount, error: verificationError } =
      await supabase.auth.admin.getUserById(profile.id);
    if (verificationError)
      throw new Error("Unable to verify subscription owner");
    const account = verifiedAccount?.user;
    if (
      !verificationError &&
      account?.email_confirmed_at &&
      account.email?.trim().toLowerCase() === email
    ) {
      const { error: linkError } = await supabase
        .from("assinaturas")
        .update({ user_id: profile.id })
        .eq("id", subscriptionId)
        .is("user_id", null);
      if (linkError) throw new Error("Unable to link verified subscription");
    }
  }
}
