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
  const { hasErpAccess, isLoading, isError } = useErpAccess();

  if (loading) return "loading";
  if (!user) return "signed-out";
  if (isLoading) return "loading";
  if (isError) return "unavailable";
  return hasErpAccess ? "allowed" : "denied";
}

export function SophGestaoPreviewAccess({ children }: { children: ReactNode }) {
  const access = useSophGestaoPreview();

  if (access === "signed-out") return <Navigate to="/login" replace />;
  if (access === "loading") return <p role="status">Verificando acesso ao Soph Gestão 2.0…</p>;
  if (access === "denied" || access === "unavailable") {
    return (
      <main className="mx-auto max-w-lg space-y-4 p-6">
        <h1 className="text-xl font-bold">{access === "unavailable" ? "Não foi possível verificar o acesso ao Soph Gestão 2.0" : "Soph Gestão 2.0 disponível para quem tem o benefício ERP"}</h1>
        <Link to="/gestao" className="underline">Voltar à Gestão do EmpreendaJá</Link>
      </main>
    );
  }
  return <>{children}</>;
}
