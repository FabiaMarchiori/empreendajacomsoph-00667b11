import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // 3. Handle events
    if (eventType === "approved" || eventType === "order_approved" || eventType === "paid") {
      // Check for duplicate
      if (subscriptionId) {
        const { data: existing } = await supabase
          .from("assinaturas")
          .select("id")
          .eq("kiwify_subscription_id", subscriptionId)
          .eq("status", "ativa")
          .maybeSingle();

        if (existing) {
          console.log(`[kiwify-webhook] Duplicate ignored: ${subscriptionId}`);
          await logWebhook(supabase, eventType, payload, "duplicate", "Assinatura já existe e está ativa");
          return jsonResponse({ success: true, message: "Já processado" });
        }
      }

      // Upsert assinatura
      const { data: subscription, error: subError } = await supabase.from("assinaturas").upsert(
        {
          kiwify_subscription_id: subscriptionId || `manual_${Date.now()}`,
          kiwify_customer_id: customerId,
          email,
          nome_cliente: customerName,
          status: "ativa",
          plano: productName,
          valor: amount,
          data_inicio: new Date().toISOString(),
          data_expiracao: null,
        },
        { onConflict: "kiwify_subscription_id" }
      ).select("id, status").single();

      if (subError || subscription?.status !== "ativa") {
        const message = subError?.message || "Assinatura não ficou ativa após o registro";
        console.error("[kiwify-webhook] Upsert assinatura error:", message);
        await logWebhook(supabase, eventType, payload, "error", message);
        return jsonResponse({ error: "Erro ao registrar assinatura" }, 500);
      }

      // Upsert clientes_autorizados
      const { data: existingClient } = await supabase
        .from("clientes_autorizados")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingClient) {
        const { error: clientAuthError } = await supabase
          .from("clientes_autorizados")
          .update({ status_assinatura: "ativa", data_compra: new Date().toISOString() })
          .eq("email", email);

        if (clientAuthError) {
          console.error("[kiwify-webhook] Atualização cliente autorizado error:", clientAuthError.message);
          await logWebhook(supabase, eventType, payload, "error", clientAuthError.message);
          return jsonResponse({ error: "Erro ao liberar acesso do cliente" }, 500);
        }
      } else {
        const { error: clientAuthError } = await supabase.from("clientes_autorizados").insert({
          email,
          status_assinatura: "ativa",
          customer_id: customerId,
          produto_id: subscriptionId,
          data_compra: new Date().toISOString(),
        });

        if (clientAuthError) {
          console.error("[kiwify-webhook] Inserção cliente autorizado error:", clientAuthError.message);
          await logWebhook(supabase, eventType, payload, "error", clientAuthError.message);
          return jsonResponse({ error: "Erro ao liberar acesso do cliente" }, 500);
        }
      }

      // Link to existing user if possible
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profile) {
        await supabase
          .from("assinaturas")
          .update({ user_id: profile.id })
          .eq("kiwify_subscription_id", subscriptionId || `manual_${Date.now()}`)
          .is("user_id", null);
      }

      const emailStatus = await sendAccessEmail({
        supabase,
        eventType,
        payload,
        subscriptionId,
        assinaturaId: subscription.id,
        email,
        customerName,
      });

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
        await supabase
          .from("assinaturas")
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq("kiwify_subscription_id", subscriptionId);
      }

      await supabase
        .from("clientes_autorizados")
        .update({ status_assinatura: "inativa" })
        .eq("email", email);

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
  supabase: ReturnType<typeof createClient>;
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

  const { data: communication, error: reservationError } = await supabase
    .from("comunicacoes_transacionais")
    .insert({
      kiwify_subscription_id: subscriptionId,
      assinatura_id: assinaturaId,
      email,
      tipo: "acesso_liberado",
      provider: "brevo",
      template_id: 5,
      status: "sending",
    })
    .select("id")
    .single();

  if (reservationError || !communication) {
    if (reservationError?.code === "23505") {
      console.log(`[kiwify-webhook] E-mail de acesso já reservado para: ${subscriptionId}`);
      return "already_processed";
    }

    const message = reservationError?.message || "Reserva de comunicação não retornou registro";
    console.error("[kiwify-webhook] Erro ao reservar e-mail de acesso:", message);
    await logWebhook(supabase, eventType, payload, "error", `E-mail de acesso não reservado: ${message}`);
    return "failed";
  }

  const recipientName = customerName?.trim() || "Empreendedor(a)";
  const brevoApiKey = Deno.env.get("BREVO_API_KEY");

  if (!brevoApiKey) {
    const message = "BREVO_API_KEY não configurada";
    await markCommunicationFailed(supabase, communication.id, message);
    await logWebhook(supabase, eventType, payload, "error", message);
    return "failed";
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: [{ email, name: recipientName }],
        templateId: 5,
        params: { nome: recipientName },
        tags: ["acesso_liberado"],
      }),
    });

    if (!response.ok) {
      const body = (await response.text()).slice(0, 500);
      const message = `Brevo respondeu HTTP ${response.status}${body ? `: ${body}` : ""}`;
      await markCommunicationFailed(supabase, communication.id, message);
      await logWebhook(supabase, eventType, payload, "error", message);
      return "failed";
    }

    const responseBody: { messageId?: unknown } = await response.json().catch(() => ({}));
    const messageId = typeof responseBody?.messageId === "string" ? responseBody.messageId : null;
    const { error: sentUpdateError } = await supabase
      .from("comunicacoes_transacionais")
      .update({
        status: "sent",
        provider_message_id: messageId,
        sent_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", communication.id);

    if (sentUpdateError) {
      console.error("[kiwify-webhook] E-mail Brevo enviado, mas status não atualizado:", sentUpdateError.message);
      await logWebhook(supabase, eventType, payload, "error", `E-mail Brevo enviado; falha ao atualizar comunicação: ${sentUpdateError.message}`);
      return "failed";
    }

    return "sent";
  } catch (error) {
    const message = `Falha ao chamar Brevo: ${error instanceof Error ? error.message : String(error)}`;
    await markCommunicationFailed(supabase, communication.id, message);
    await logWebhook(supabase, eventType, payload, "error", message);
    return "failed";
  }
}

async function markCommunicationFailed(
  supabase: ReturnType<typeof createClient>,
  communicationId: string,
  errorMessage: string,
) {
  const { error } = await supabase
    .from("comunicacoes_transacionais")
    .update({ status: "failed", error_message: errorMessage })
    .eq("id", communicationId);

  if (error) {
    console.error("[kiwify-webhook] Falha ao registrar erro da comunicação:", error.message);
  }
}

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function logWebhook(
  supabase: ReturnType<typeof createClient>,
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
