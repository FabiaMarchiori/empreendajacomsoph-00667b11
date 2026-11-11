import { useErpEntry } from "@/hooks/useErpEntry";
export default function ErpPage() {
  const { enterErp, isLoading } = useErpEntry();
  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">ERP — Soph Gestão</h1>
      <p>Seu acesso à gestão de estoque, vendas e financeiro.</p>
      <button
        className="rounded-xl bg-primary px-5 py-3 text-primary-foreground"
        disabled={isLoading}
        onClick={() => enterErp()}
      >
        {isLoading ? "Conectando…" : "Acessar ERP"}
      </button>
    </section>
  );
}
