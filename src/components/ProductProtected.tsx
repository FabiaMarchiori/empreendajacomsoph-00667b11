import { usePlanAccess } from "@/hooks/usePlanAccess";
import type { ProductAccess } from "@/lib/product-access";
export function ProductProtected({
  product,
  children,
}: {
  product: keyof ProductAccess;
  children: React.ReactNode;
}) {
  const access = usePlanAccess();
  if (access.isLoading) return <p role="status">Verificando seu acesso…</p>;
  if (!access[product])
    return (
      <p role="alert">Este recurso não está incluído no seu acesso atual.</p>
    );
  return <>{children}</>;
}
