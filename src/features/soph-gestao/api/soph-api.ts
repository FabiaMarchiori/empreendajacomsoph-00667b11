import { supabase } from "@/integrations/supabase/client";

export type SophResource = "scope" | "contacts" | "products" | "sales" | "finance";

export async function sophRequest<T>(
  resource: SophResource,
  action: "GET" | "POST" | "PATCH" = "GET",
  input?: object,
  params?: Record<string, string>,
): Promise<T> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) throw new Error("Faça login novamente no EmpreendaJá.");

  const { data, error } = await supabase.functions.invoke("soph-catalog", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: { resource, action, ...(input ? { input } : {}), ...(params ?? {}) },
  });

  if (error) {
    const response = "context" in error ? error.context as Response | undefined : undefined;
    const status = response?.status;
    throw new Error(status === 409
      ? "O vínculo da sua conta com a empresa ainda precisa de aprovação."
      : status === 403 ? "Seu acesso ao Soph Gestão não está autorizado."
      : status === 503 ? "A conexão segura do Soph Gestão ainda não está disponível."
      : status === 401 ? "Sua sessão expirou. Entre novamente."
      : status === 422 ? "Confira os produtos, o estoque disponível e os valores informados."
      : "Não foi possível concluir a operação.");
  }
  return data as T;
}
