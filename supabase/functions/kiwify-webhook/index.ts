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
      const { error: subError } = await supabase.from("assinaturas").upsert(
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
      );

      if (subError) {
        console.error("[kiwify-webhook] Upsert assinatura error:", subError.message);
        await logWebhook(supabase, eventType, payload, "error", subError.message);
        return jsonResponse({ error: "Erro ao registrar assinatura" }, 500);
      }

      // Upsert clientes_autorizados
      const { data: existingClient } = await supabase
        .from("clientes_autorizados")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingClient) {
        await supabase
          .from("clientes_autorizados")
          .update({ status_assinatura: "ativa", data_compra: new Date().toISOString() })
          .eq("email", email);
      } else {
        await supabase.from("clientes_autorizados").insert({
          email,
          status_assinatura: "ativa",
          customer_id: customerId,
          produto_id: subscriptionId,
          data_compra: new Date().toISOString(),
        });
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

      await logWebhook(supabase, eventType, payload, "success", `Acesso liberado para ${email}`);
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
