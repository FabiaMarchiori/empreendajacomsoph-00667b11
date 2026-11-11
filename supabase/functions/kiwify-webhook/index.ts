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
    const identity = kiwifyIdentity(payload);
    if (identity.error) return jsonResponse({ error: identity.error }, 422);
    const eventType = identity.eventType;
    const email = payload?.Customer?.email?.toLowerCase()?.trim();
    const customerName = payload?.Customer?.full_name || null;
    const customerId = payload?.Customer?.id || null;
    const subscriptionId = identity.subscriptionId;
    const rawProductName = payload?.Product?.product_name || payload?.Product?.name || payload?.product?.name || "Ecossistema EmpreendaJá";
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

    if (eventType === "subscription_renewed") return await processRenewal(supabase, payload, identity);
    // A cancellation can retain the already-paid period; a recurring refund can
    // refer to an older charge. Never infer an entitlement reversal from paid.
    if (eventType === "subscription_canceled" || eventType === "subscription_cancelled" || eventType === "subscription_late" || (identity.canonicalId && ["refunded", "order_refunded", "chargeback"].includes(eventType))) {
      await logWebhook(supabase, eventType, payload, "review_required", "Evento de ciclo recorrente exige conciliação de cobrança e período pago");
      return jsonResponse({ error: "Conciliação do ciclo recorrente necessária" }, 409);
    }

    if (!identity.canonicalId && Object.keys(identity.subscription).length > 0) return jsonResponse({ error: "Assinatura recorrente sem identificador de contrato" }, 422);

    // 3. Handle events
    if (eventType === "approved" || eventType === "order_approved" || eventType === "paid") {
      // Check for duplicate
      if (subscriptionId) {
        const resolved = await findStoredSubscription(supabase, identity.candidates);
        if (resolved.ambiguous) {
          await logWebhook(supabase, eventType, payload, "review_required", "Identidade corresponde a múltiplas assinaturas legadas");
          return jsonResponse({ error: "Conciliação de identidade necessária" }, 409);
        }
        const existing = resolved.subscription;

        if (existing && existing.status !== "ativa") {
          await logWebhook(supabase, eventType, {}, "review_required", "Aprovação após estado terminal exige conciliação de renovação/eventos");
          return jsonResponse({ error: "Conciliação de eventos necessária" }, 409);
        }
        if (existing) {
          await ensureAuthorizedClient(supabase, existing.email, customerId, existing.kiwify_subscription_id);
          await linkVerifiedOwner(supabase, existing.id, existing.email);
          const retriedEmail = await sendAccessEmail({ supabase, eventType, payload, subscriptionId: existing.kiwify_subscription_id, assinaturaId: existing.id, email: existing.email, customerName: existing.nome_cliente });
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
      ).select("id, status, email, nome_cliente, kiwify_subscription_id").maybeSingle();

      const { data: storedSubscription, error: storedError } = insertedSubscription ? { data: insertedSubscription, error: null } : await supabase.from("assinaturas").select("id, status, email, nome_cliente, kiwify_subscription_id").eq("kiwify_subscription_id", subscriptionId).maybeSingle();
      const subscription = storedSubscription;

      if (subError || storedError || subscription?.status !== "ativa") {
        const message = subError?.message || "Assinatura não ficou ativa após o registro";
        console.error("[kiwify-webhook] Upsert assinatura error:", message);
        await logWebhook(supabase, eventType, payload, "error", message);
        return jsonResponse({ error: "Erro ao registrar assinatura" }, 500);
      }

      await ensureAuthorizedClient(supabase, subscription.email, customerId, subscription.kiwify_subscription_id);

      await linkVerifiedOwner(supabase, subscription.id, subscription.email);

      const emailStatus = await sendAccessEmail({
        supabase,
        eventType,
        payload,
        subscriptionId: subscription.kiwify_subscription_id,
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


type KiwifyRecord = Record<string, unknown>;
function record(value: unknown): KiwifyRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as KiwifyRecord : {};
}
function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function kiwifyIdentity(value: unknown) {
  const payload = record(value);
  const subscription = record(payload.Subscription);
  const topId = text(payload.subscription_id);
  const nestedId = text(subscription.id);
  const orderId = text(payload.order_id) || text(record(payload.Transaction).order_id);
  // An explicit event must never be overwritten by the status of the last order.
  const eventType = text(payload.webhook_event_type) || text(payload.event) || text(payload.order_status) || "unknown";
  const charges = record(subscription.charges).completed;
  const completed = Array.isArray(charges) ? charges.map(record) : [];
  const canonicalId = topId || nestedId;
  const candidates = [...new Set([canonicalId, orderId, ...completed.map(c => text(c.order_id))].filter((id): id is string => !!id))];
  const error = topId && nestedId && topId !== nestedId ? "Identificadores de assinatura conflitantes" : candidates.length > 128 ? "Histórico de cobranças exige conciliação" : null;
  return { eventType, canonicalId, orderId, subscriptionId: canonicalId || orderId, candidates, completed, subscription, error };
}

type StoredSubscription = {
  id: string; kiwify_subscription_id: string; email: string; nome_cliente: string | null;
  status: string; data_expiracao: string | null;
};
async function findStoredSubscription(supabase: SupabaseClient, candidates: string[]) {
  const { data, error } = await supabase.from("assinaturas")
    .select("id, kiwify_subscription_id, email, nome_cliente, status, data_expiracao")
    .in("kiwify_subscription_id", candidates);
  if (error) throw new Error("Unable to resolve subscription identity");
  const rows = (data || []) as StoredSubscription[];
  return { subscription: rows.length === 1 ? rows[0] : null, ambiguous: rows.length > 1 };
}
function explicitInstant(value: unknown): number | null {
  // No interpretation of unzoned approved_date/updated_at and no month arithmetic.
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, minute, second] = match;
  if (+m < 1 || +m > 12 || +d < 1 || +d > new Date(Date.UTC(+y, +m, 0)).getUTCDate() || +h > 23 || +minute > 59 || +second > 59) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}
async function processRenewal(supabase: SupabaseClient, payload: unknown, identity: ReturnType<typeof kiwifyIdentity>) {
  const event = record(payload);
  const review = async (reason: string) => {
    // Keep the event for reconciliation without copying buyer details into errors.
    await logWebhook(supabase, identity.eventType, payload, "review_required", reason);
    return jsonResponse({ error: reason }, 409);
  };
  if (!identity.canonicalId || !identity.orderId) return review("Renovação sem identidade de assinatura e cobrança");
  const access = record(identity.subscription.customer_access);
  const paidCharge = identity.completed.find(c => text(c.order_id) === identity.orderId && c.status === "paid");
  const until = explicitInstant(access.access_until);
  const paidAt = explicitInstant(paidCharge?.created_at);
  if (event.order_status !== "paid" || identity.subscription.status !== "active" || access.has_access !== true || access.active_period !== true || !paidCharge || until === null || paidAt === null || until <= paidAt) {
    return review("Renovação sem comprovação consistente de pagamento e período autorizado");
  }
  const resolved = await findStoredSubscription(supabase, identity.candidates);
  if (resolved.ambiguous) return review("Mais de uma assinatura legada corresponde ao contrato; não consolidar automaticamente");
  const existing = resolved.subscription;
  if (!existing) return review("Renovação sem assinatura local identificada; não criar outra assinatura");
  if (existing.status !== "ativa") return review("Renovação de registro encerrado exige conciliação; não reativar automaticamente");
  if (existing.email.trim().toLowerCase() !== text(record(event.Customer).email)?.toLowerCase()) return review("Identidade da renovação diverge da compra original");
  if (until <= Date.now()) return review("Período da renovação já encerrado; verificar estado atual na Kiwify");
  const { data: prior, error: priorError } = await supabase.from("webhook_logs").select("id")
    .eq("evento", "subscription_renewed").eq("status", "renewal_recognized")
    .eq("payload->>order_id", identity.orderId).limit(1).maybeSingle();
  if (priorError) return review("Não foi possível verificar a cobrança já reconhecida");
  if (prior) {
    await logWebhook(supabase, identity.eventType, payload, "renewal_duplicate", "Cobrança de renovação já reconhecida");
    return jsonResponse({ success: true, message: "Renovação já reconhecida" });
  }
  // A null expiry is historical indefinite access, not permission to invent a term.
  // Only extend a known finite term using Kiwify's explicit authorized access_until.
  if (existing.data_expiracao !== null) {
    const current = explicitInstant(existing.data_expiracao);
    if (current === null) return review("Validade local sem instante inequívoco");
    if (until > current) {
      const { data, error } = await supabase.from("assinaturas")
        .update({ data_expiracao: new Date(until).toISOString() })
        .eq("id", existing.id).eq("status", "ativa")
        .eq("data_expiracao", existing.data_expiracao)
        .select("id").maybeSingle();
      if (error || !data) return review("Estado mudou durante a renovação; conciliar sem sobrescrever");
    }
  }
  // No upsert, owner assignment, benefit change or new Brevo onboarding message.
  await logWebhook(supabase, identity.eventType, payload, "renewal_recognized", "Renovação reconhecida sem recriar compra ou reenviar boas-vindas");
  return jsonResponse({ success: true, message: "Renovação reconhecida" });
}
