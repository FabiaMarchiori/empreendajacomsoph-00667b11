import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useSophGestaoPreview() {
  const { session, loading } = useAuth();
  const token = session?.access_token;
  const [result, setResult] = useState<{ token: string; allowed: boolean }>();

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    async function authorize(accessToken: string) {
      let allowed = false;
      try {
        const { data, error } = await supabase.functions.invoke("soph-gestao-preview", {
          headers: { Authorization: `Bearer ${accessToken}` },
          body: {},
          signal: controller.signal,
          timeout: 10_000,
        });
        allowed = !error && data?.allowed === true;
      } catch {
        allowed = false;
      }
      if (!controller.signal.aborted) setResult({ token: accessToken, allowed });
    }

    void authorize(token);
    return () => controller.abort();
  }, [token]);

  if (loading) return "loading";
  if (!token) return "signed-out";
  if (result?.token !== token) return "loading";
  return result.allowed ? "allowed" : "denied";
}

export function SophGestaoPreviewAccess({ children }: { children: ReactNode }) {
  const access = useSophGestaoPreview();

  if (access === "signed-out") return <Navigate to="/login" replace />;
  if (access === "loading") return <p role="status">Verificando acesso ao Soph Gestão 2.0…</p>;
  if (access === "denied") {
    return (
      <main className="mx-auto max-w-lg space-y-4 p-6">
        <h1 className="text-xl font-bold">Prévia restrita à administradora</h1>
        <Link to="/gestao" className="underline">Voltar à Gestão do EmpreendaJá</Link>
      </main>
    );
  }
  return <>{children}</>;
}
