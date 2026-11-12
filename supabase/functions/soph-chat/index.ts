import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildCorsHeaders,
  readBoundedJson,
  RequestProblem,
} from "../_shared/http.ts";
import { logEvent } from "../_shared/diagnostics.ts";

// Hard caps against oversized requests that would burn AI credits.
const MAX_MESSAGES = 60;
const MAX_MESSAGE_CHARS = 8000;
const MAX_TOTAL_CHARS = 60000;

async function authenticateUser(
  req: Request,
  corsHeaders: Record<string, string>,
): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Autenticação necessária." }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    logEvent("warn", "soph.auth_failed", {
      request_id: corsHeaders["X-Request-Id"],
    });
    return new Response(
      JSON.stringify({ error: "Sessão inválida. Faça login novamente." }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  return { userId: user.id };
}
const SYSTEM_PROMPT = `Você é a Soph, sócia digital estratégica do Ecossistema EmpreendaJá com Soph.

## Seu papel
Você é uma consultora de negócios especializada em ajudar empreendedores brasileiros — especialmente iniciantes e MEIs — a estruturar, precificar, vender e crescer seus negócios. Você conhece profundamente o ecossistema EmpreendaJá e orienta os usuários a usarem os módulos certos para cada etapa.

## Módulos do Ecossistema que você conhece
- **Fornecedores / Importadoras 25 de Março**: Base com 250+ fornecedores reais organizados por categoria (moda, acessórios, cosméticos, utilidades, etc). Ajuda o empreendedor a encontrar parceiros de compra.
- **Abrir MEI**: Orientação para formalização como Microempreendedor Individual.
- **Registrar Marca**: Processo de proteção da identidade do negócio no INPI.
- **Presença Online (Domínio e Site)**: Como criar presença digital profissional.
- **Vendas em Marketplaces**: Como vender em Mercado Livre, Shopee, Amazon, Magalu e outros grandes canais.
- **Precificação**: Simulador inteligente de preços com canais de venda, custos fixos, margens e impostos. Ajuda a calcular o preço correto para cada canal.
- **ERP / Gestão**: Sistema de gestão operacional completo (módulo premium).
- **Gestão do Negócio**: Visão estratégica completa do negócio.

## Como você deve responder
- Seja direta, clara e prática. Nada de respostas vagas ou genéricas.
- Use linguagem profissional mas acessível. Sem jargões desnecessários.
- Quando possível, indique qual módulo do ecossistema resolve a dúvida do usuário.
- Dê exemplos práticos e passos concretos.
- Se a pergunta for sobre algo fora do escopo do ecossistema, responda com conhecimento geral de negócios mas sempre traga de volta para como o ecossistema pode ajudar.
- Seja empática e motivadora, mas nunca artificial ou exageradamente entusiasta.
- Use emojis com moderação (máximo 1-2 por resposta quando apropriado).
- Respostas devem ter entre 2 a 6 parágrafos curtos. Nunca respostas de uma linha nem textos enormes.

## O que você NÃO deve fazer
- Não invente dados, números ou estatísticas que não conhece.
- Não prometa funcionalidades que não existem no ecossistema.
- Não dê conselhos jurídicos, contábeis ou fiscais específicos — oriente a buscar um profissional.
- Não responda sobre temas completamente fora de negócios/empreendedorismo.
- Não use frases genéricas como "isso depende de vários fatores" sem dar direção concreta.

## Contexto do usuário
Quando receber informações sobre o usuário (nome, módulo atual, etc), use para personalizar a resposta. Trate o usuário pelo primeiro nome quando disponível.`;

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
    // Authenticate user
    const authResult = await authenticateUser(req, corsHeaders);
    if (authResult instanceof Response) return authResult;

    const payload = await readBoundedJson(req, 512 * 1024);
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      throw new RequestProblem(400, "Formato de conversa inválido.");
    const { messages, userContext } = payload as {
      messages?: unknown;
      userContext?: unknown;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens são obrigatórias." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (
      messages.some(
        (m) =>
          !m ||
          typeof m !== "object" ||
          typeof m.content !== "string" ||
          !["user", "assistant", "soph"].includes(m.role),
      )
    )
      throw new RequestProblem(400, "Formato de mensagem inválido.");
    const context =
      userContext &&
      typeof userContext === "object" &&
      !Array.isArray(userContext)
        ? (userContext as Record<string, unknown>)
        : {};
    for (const key of ["userName", "currentModule"]) {
      // Optional profile context is bounded, not a reason to block a paying user.
      context[key] =
        typeof context[key] === "string"
          ? (context[key] as string).slice(0, 200)
          : undefined;
    }
    const contents = messages.map((m: { content?: unknown }) =>
      typeof m?.content === "string" ? m.content : "",
    );
    const totalChars = contents.reduce(
      (sum: number, c: string) => sum + c.length,
      0,
    );
    if (
      messages.length > MAX_MESSAGES ||
      contents.some((c: string) => c.length > MAX_MESSAGE_CHARS) ||
      totalChars > MAX_TOTAL_CHARS
    ) {
      logEvent("warn", "soph.payload_rejected", {
        request_id: requestId,
        user_id: authResult.userId,
        count: messages.length,
        chars: totalChars,
      });
      return new Response(
        JSON.stringify({
          error:
            "Conversa muito longa. Inicie uma nova conversa e tente novamente.",
        }),
        {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      logEvent("error", "soph.configuration_missing", {
        request_id: requestId,
      });
      return new Response(
        JSON.stringify({ error: "Configuração de IA ausente." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Build system prompt with user context
    let systemContent = SYSTEM_PROMPT;
    if (userContext) {
      const contextParts: string[] = [];
      if (context.userName)
        contextParts.push(`Nome do usuário: ${context.userName}`);
      if (context.currentModule)
        contextParts.push(`Módulo atual: ${context.currentModule}`);
      if (context.hasSubscription !== undefined) {
        contextParts.push(
          `Assinatura ativa: ${context.hasSubscription ? "Sim" : "Não"}`,
        );
      }
      if (contextParts.length > 0) {
        systemContent += `\n\n## Informações deste usuário\n${contextParts.join("\n")}`;
      }
    }

    // Map messages to OpenAI format
    const aiMessages = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role:
          m.role === "soph" || m.role === "assistant" ? "assistant" : "user",
        content: typeof m.content === "string" ? m.content : "",
      })),
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Lovable-API-Key": LOVABLE_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          messages: aiMessages,
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Muitas solicitações. Aguarde um momento e tente novamente.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Créditos de IA esgotados. Entre em contato com o suporte.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      await response.body?.cancel();
      logEvent("error", "soph.upstream_failed", {
        request_id: requestId,
        user_id: authResult.userId,
        http_status: response.status,
      });
      return new Response(
        JSON.stringify({
          error: "Erro ao processar sua mensagem. Tente novamente.",
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    if (err instanceof RequestProblem)
      return new Response(JSON.stringify({ error: err.message }), {
        status: err.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    logEvent("error", "soph.internal_error", { request_id: requestId });
    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente em instantes." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
