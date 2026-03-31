import { useState, useEffect } from "react";
import { Settings, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePricingSettings } from "@/hooks/usePricingData";

export default function PricingSettings() {
  const { settings, isLoading, upsert } = usePricingSettings();
  const [nome, setNome] = useState("");
  const [regime, setRegime] = useState("");
  const [faturamento, setFaturamento] = useState<number | "">("");

  useEffect(() => {
    if (settings) {
      setNome(settings.nome_empresa ?? "");
      setRegime(settings.regime_tributario ?? "");
      setFaturamento(settings.faturamento_avg != null ? Number(settings.faturamento_avg) : "");
    }
  }, [settings]);

  const handleSave = () => {
    upsert.mutate({
      nome_empresa: nome,
      regime_tributario: regime,
      faturamento_avg: faturamento === "" ? null : faturamento,
    });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center">
          <Settings className="h-4.5 w-4.5 text-primary" />
        </div>
        <h3 className="font-display font-bold text-foreground">Configuração Financeira</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Nome da Empresa</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Sua empresa" className="bg-muted/50 border-border" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Regime Tributário</Label>
          <Select value={regime} onValueChange={setRegime}>
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mei">MEI</SelectItem>
              <SelectItem value="simples">Simples Nacional</SelectItem>
              <SelectItem value="lucro_presumido">Lucro Presumido</SelectItem>
              <SelectItem value="lucro_real">Lucro Real</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Faturamento Médio (R$)</Label>
          <Input type="number" min={0} step={100} value={faturamento} onChange={(e) => setFaturamento(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0,00" className="bg-muted/50 border-border" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={upsert.isPending} className="bg-primary text-primary-foreground font-semibold text-sm">
        <Save className="h-4 w-4 mr-2" /> {upsert.isPending ? "Salvando..." : "Salvar Configuração"}
      </Button>
    </div>
  );
}
