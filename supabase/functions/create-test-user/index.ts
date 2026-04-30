import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const email = "teste.bolsas@empreendaja.com";
  const password = "Teste@1999";

  try {
    // Cria ou recupera usuário
    let userId: string | null = null;
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: "Teste", last_name: "Bolsas" },
    });

    if (createErr && !String(createErr.message).toLowerCase().includes("already")) {
      throw createErr;
    }

    if (created?.user) {
      userId = created.user.id;
    } else {
      // já existe - busca
      const { data: list } = await supabase.auth.admin.listUsers();
      const existing = list?.users?.find((u) => u.email?.toLowerCase() === email);
      userId = existing?.id ?? null;
      if (existing) {
        await supabase.auth.admin.updateUserById(existing.id, { password });
      }
    }

    if (!userId) throw new Error("Não foi possível obter user_id");

    // Cria assinatura ativa do plano bolsas_1999
    const subId = `test_bolsas_${userId}`;
    await supabase.from("assinaturas").upsert(
      {
        kiwify_subscription_id: subId,
        email,
        nome_cliente: "Teste Bolsas",
        status: "ativa",
        plano: "bolsas_1999",
        valor: 19.99,
        data_inicio: new Date().toISOString(),
        data_expiracao: null,
        user_id: userId,
      },
      { onConflict: "kiwify_subscription_id" }
    );

    await supabase.from("clientes_autorizados").upsert(
      {
        email,
        status_assinatura: "ativa",
        produto_id: subId,
        data_compra: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    return new Response(
      JSON.stringify({ success: true, email, password, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
