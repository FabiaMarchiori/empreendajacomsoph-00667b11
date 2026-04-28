import { useNichoAccess } from "@/hooks/useNichoAccess";
import BolsasGate from "./BolsasGate";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function BolsasProtected({ children }: Props) {
  const { hasAccess, isLoading } = useNichoAccess(["bolsas", "starter_bolsas", "nicho_bolsas"]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!hasAccess) return <BolsasGate />;

  return <>{children}</>;
}
