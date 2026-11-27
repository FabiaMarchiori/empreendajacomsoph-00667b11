import { type ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useErpAccess } from "@/hooks/useErpAccess";

/**
 * Release access is based on the same commercial ERP entitlement used by
 * EmpreendaJá. Only demo data is rendered on this route; no legacy ERP data
 * or server catalog operations are exposed here.
 */
export function useSophGestaoPreview() {
  const { user, loading } = useAuth();
  const { hasErpAccess, isLoading } = useErpAccess();

  if (loading) return "loading";
  if (!user) return "signed-out";
  if (isLoading) return "loading";
  return hasErpAccess ? "allowed" : "denied";
}

export function SophGestaoPreviewAccess({ children }: { children: ReactNode }) {
  const access = useSophGestaoPreview();

  if (access === "signed-out") return <Navigate to="/login" replace />;
  if (access === "loading") return <p role="status">Verificando acesso ao Soph Gestão 2.0…</p>;
  if (access === "denied") {
    return (
      <main className="mx-auto max-w-lg space-y-4 p-6">
        <h1 className="text-xl font-bold">Acesso ao Soph Gestão 2.0 não disponível para seu plano</h1>
        <Link to="/gestao" className="underline">Voltar à Gestão do EmpreendaJá</Link>
      </main>
    );
  }
  return <>{children}</>;
}
