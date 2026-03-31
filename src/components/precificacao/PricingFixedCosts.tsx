import { useState } from "react";
import { Landmark, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricingFixedCosts } from "@/hooks/usePricingData";

export default function PricingFixedCosts() {
  const { costs, isLoading, create, update, remove } = usePricingFixedCosts();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome_custo: "", valor: 0 });

  const resetForm = () => { setForm({ nome_custo: "", valor: 0 }); setShowForm(false); setEditingId(null); };

  const handleSave = () => {
    if (!form.nome_custo.trim()) return;
    if (editingId) {
      update.mutate({ id: editingId, ...form }, { onSuccess: resetForm });
    } else {
      create.mutate(form, { onSuccess: resetForm });
    }
  };

  const startEdit = (c: typeof costs[0]) => {
    setForm({ nome_custo: c.nome_custo, valor: Number(c.valor) });
    setEditingId(c.id);
    setShowForm(true);
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const total = costs.reduce((s, c) => s + Number(c.valor), 0);

  if (isLoading) {
    return <div className="rounded-2xl border border-border bg-card p-6"><Skeleton className="h-6 w-40" /><div className="mt-4 space-y-2">{[1,2].map(i=><Skeleton key={i} className="h-12"/>)}</div></div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
            <Landmark className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">Custos Fixos</h3>
            {costs.length > 0 && <p className="text-xs text-muted-foreground">Total: {fmt(total)}/mês</p>}
          </div>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowForm(true); }} className="border-primary/30 text-primary hover:bg-primary/10 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo Custo
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Nome do Custo</Label>
              <Input value={form.nome_custo} onChange={(e) => setForm({...form, nome_custo: e.target.value})} placeholder="Ex: Aluguel" className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Valor Mensal (R$)</Label>
              <Input type="number" min={0} step={0.01} value={form.valor || ""} onChange={(e) => setForm({...form, valor: Number(e.target.value)})} className="bg-muted/50 border-border text-sm" />
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

      {costs.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum custo fixo cadastrado.</p>
      )}

      {costs.length > 0 && (
        <div className="space-y-2">
          {costs.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-muted/20 border border-border/40 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{c.nome_custo}</p>
                <p className="text-xs text-muted-foreground">{fmt(Number(c.valor))}/mês</p>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => startEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove.mutate(c.id)}>
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
