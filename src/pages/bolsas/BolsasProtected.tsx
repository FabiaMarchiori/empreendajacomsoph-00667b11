import { Loader2 } from "lucide-react";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import BolsasGate from "./BolsasGate";

interface Props {
  children: React.ReactNode;
}

export default function BolsasProtected({ children }: Props) {
  const { isAdmin, hasEcosystem, hasBolsasPlan, isLoading } = usePlanAccess();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  // Admin: acesso total
  if (isAdmin) return <>{children}</>;

  // Ecossistema também inclui o nicho Bolsas.
  if (hasEcosystem) return <>{children}</>;

  // Plano Bolsas: acesso liberado
  if (hasBolsasPlan) return <>{children}</>;

  // Sem acesso: tela de compra
  return <BolsasGate />;
}
