import { useState } from "react";
import { ShoppingBag, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricingProducts } from "@/hooks/usePricingData";

export default function PricingProducts() {
  const { products, isLoading, create, update, remove } = usePricingProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome_produto: "", custo_compra: 0, custo_variavel: 0, fornecedor: "", observacoes: "" });

  const resetForm = () => {
    setForm({ nome_produto: "", custo_compra: 0, custo_variavel: 0, fornecedor: "", observacoes: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.nome_produto.trim()) return;
    const payload = { ...form, fornecedor: form.fornecedor || undefined, observacoes: form.observacoes || undefined };
    if (editingId) {
      update.mutate({ id: editingId, ...payload }, { onSuccess: resetForm });
    } else {
      create.mutate(payload, { onSuccess: resetForm });
    }
  };

  const startEdit = (p: typeof products[0]) => {
    setForm({
      nome_produto: p.nome_produto,
      custo_compra: Number(p.custo_compra),
      custo_variavel: Number(p.custo_variavel),
      fornecedor: p.fornecedor ?? "",
      observacoes: p.observacoes ?? "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (isLoading) {
    return <div className="rounded-2xl border border-border bg-card p-6"><Skeleton className="h-6 w-40" /><div className="mt-4 space-y-2">{[1,2].map(i=><Skeleton key={i} className="h-12"/>)}</div></div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
            <ShoppingBag className="h-4.5 w-4.5 text-primary" />
          </div>
          <h3 className="font-display font-bold text-foreground">Produtos</h3>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowForm(true); }} className="border-primary/30 text-primary hover:bg-primary/10 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo Produto
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Nome do Produto</Label>
              <Input value={form.nome_produto} onChange={(e) => setForm({...form, nome_produto: e.target.value})} placeholder="Ex: Camiseta" className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Custo de Compra (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.custo_compra || ""} onChange={(e) => setForm({...form, custo_compra: Number(e.target.value)})} className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Custo Variável (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.custo_variavel || ""} onChange={(e) => setForm({...form, custo_variavel: Number(e.target.value)})} className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Fornecedor</Label>
              <Input value={form.fornecedor} onChange={(e) => setForm({...form, fornecedor: e.target.value})} placeholder="Opcional" className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs text-foreground font-semibold">Observações</Label>
              <Input value={form.observacoes} onChange={(e) => setForm({...form, observacoes: e.target.value})} placeholder="Opcional" className="bg-muted/50 border-border text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={create.isPending || update.isPending} className="bg-primary text-primary-foreground text-xs font-semibold">
              <Check className="h-3.5 w-3.5 mr-1" /> {editingId ? "Atualizar" : "Criar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={resetForm} className="text-xs text-muted-foreground">
              <X className="h-3.5 w-3.5 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {products.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto cadastrado. Adicione seus produtos para usar no simulador.</p>
      )}

      {products.length > 0 && (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl bg-muted/20 border border-border/40 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{p.nome_produto}</p>
                <p className="text-xs text-muted-foreground">
                  Compra {fmt(Number(p.custo_compra))} · Variável {fmt(Number(p.custo_variavel))}
                  {p.fornecedor && ` · ${p.fornecedor}`}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => startEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove.mutate(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
