import { useState } from "react";
import { Store, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricingChannels } from "@/hooks/usePricingData";

export default function PricingChannels() {
  const { channels, isLoading, create, update, remove } = usePricingChannels();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ canal_nome: "", comissao_pct: 0, imposto_pct: 0, taxa_cartao_pct: 0 });

  const resetForm = () => {
    setForm({ canal_nome: "", comissao_pct: 0, imposto_pct: 0, taxa_cartao_pct: 0 });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.canal_nome.trim()) return;
    if (editingId) {
      update.mutate({ id: editingId, ...form }, { onSuccess: resetForm });
    } else {
      create.mutate(form, { onSuccess: resetForm });
    }
  };

  const startEdit = (c: typeof channels[0]) => {
    setForm({ canal_nome: c.canal_nome, comissao_pct: Number(c.comissao_pct), imposto_pct: Number(c.imposto_pct), taxa_cartao_pct: Number(c.taxa_cartao_pct) });
    setEditingId(c.id);
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="rounded-2xl border border-border bg-card p-6"><Skeleton className="h-6 w-40" /><div className="mt-4 space-y-2">{[1,2].map(i=><Skeleton key={i} className="h-12"/>)}</div></div>;
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
            <Store className="h-4.5 w-4.5 text-primary" />
          </div>
          <h3 className="font-display font-bold text-foreground">Canais e Taxas</h3>
        </div>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => { resetForm(); setShowForm(true); }} className="border-primary/30 text-primary hover:bg-primary/10 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Novo Canal
          </Button>
        )}
      </div>

      {showForm && (
        <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Nome do Canal</Label>
              <Input value={form.canal_nome} onChange={(e) => setForm({...form, canal_nome: e.target.value})} placeholder="Ex: Shopee" className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Comissão (%)</Label>
              <Input type="number" min={0} step={0.1} value={form.comissao_pct || ""} onChange={(e) => setForm({...form, comissao_pct: Number(e.target.value)})} className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Imposto (%)</Label>
              <Input type="number" min={0} step={0.1} value={form.imposto_pct || ""} onChange={(e) => setForm({...form, imposto_pct: Number(e.target.value)})} className="bg-muted/50 border-border text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground font-semibold">Taxa Cartão (%)</Label>
              <Input type="number" min={0} step={0.1} value={form.taxa_cartao_pct || ""} onChange={(e) => setForm({...form, taxa_cartao_pct: Number(e.target.value)})} className="bg-muted/50 border-border text-sm" />
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

      {channels.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum canal cadastrado. Crie seu primeiro canal de venda.</p>
      )}

      {channels.length > 0 && (
        <div className="space-y-2">
          {channels.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-xl bg-muted/20 border border-border/40 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${c.ativo ? "text-foreground" : "text-muted-foreground line-through"}`}>{c.canal_nome}</p>
                <p className="text-xs text-muted-foreground">
                  Comissão {Number(c.comissao_pct)}% · Imposto {Number(c.imposto_pct)}% · Cartão {Number(c.taxa_cartao_pct)}%
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Switch checked={c.ativo} onCheckedChange={(v) => update.mutate({ id: c.id, ativo: v })} />
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
