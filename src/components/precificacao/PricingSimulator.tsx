import { useState, useMemo, useEffect } from "react";
import { Calculator, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { calcularPreco, calcularMarkup, type PricingInput, type PricingResult } from "@/lib/pricing-engine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  products: Tables<"pricing_products">[];
  channels: Tables<"pricing_channels">[];
  isLoading: boolean;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function PricingSimulator({ products, channels, isLoading }: Props) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [custoCompra, setCustoCompra] = useState(0);
  const [custoVariavel, setCustoVariavel] = useState(0);
  const [impostoPct, setImpostoPct] = useState(0);
  const [comissaoPct, setComissaoPct] = useState(0);
  const [taxaCartaoPct, setTaxaCartaoPct] = useState(0);
  const [margemDesejada, setMargemDesejada] = useState(30);
  const [result, setResult] = useState<PricingResult | null>(null);

  // Auto-fill from product
  useEffect(() => {
    if (!selectedProduct) return;
    const p = products.find((x) => x.id === selectedProduct);
    if (p) {
      setCustoCompra(Number(p.custo_compra));
      setCustoVariavel(Number(p.custo_variavel));
    }
  }, [selectedProduct, products]);

  // Auto-fill from channel
  useEffect(() => {
    if (!selectedChannel) return;
    const c = channels.find((x) => x.id === selectedChannel);
    if (c) {
      setImpostoPct(Number(c.imposto_pct));
      setComissaoPct(Number(c.comissao_pct));
      setTaxaCartaoPct(Number(c.taxa_cartao_pct));
    }
  }, [selectedChannel, channels]);

  const handleCalc = () => {
    const input: PricingInput = {
      custoCompra,
      custoVariavel,
      impostoPct,
      comissaoPct,
      taxaCartaoPct,
      margemDesejada,
    };
    setResult(calcularPreco(input));
  };

  // Auto-calculate on any field change
  const autoResult = useMemo(() => {
    if (custoCompra <= 0) return null;
    return calcularPreco({ custoCompra, custoVariavel, impostoPct, comissaoPct, taxaCartaoPct, margemDesejada });
  }, [custoCompra, custoVariavel, impostoPct, comissaoPct, taxaCartaoPct, margemDesejada]);

  const displayResult = result ?? autoResult;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-card p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      </div>
    );
  }

  const activeChannels = channels.filter((c) => c.ativo);

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-6 lg:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Simulador de Preço</h2>
          <p className="text-xs text-muted-foreground">Calcule o preço ideal em tempo real</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product select */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Produto</Label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Selecionar produto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">✏️ Inserir manualmente</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome_produto}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Channel select */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Canal de Venda</Label>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Selecionar canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">✏️ Inserir manualmente</SelectItem>
              {activeChannels.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.canal_nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Margem */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Margem Desejada (%)</Label>
          <Input type="number" min={0} max={99} value={margemDesejada} onChange={(e) => setMargemDesejada(Number(e.target.value))} className="bg-muted/50 border-border" />
        </div>

        {/* Custo Compra */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Custo de Compra (R$)</Label>
          <Input type="number" min={0} step={0.01} value={custoCompra || ""} onChange={(e) => setCustoCompra(Number(e.target.value))} className="bg-muted/50 border-border" placeholder="0,00" />
        </div>

        {/* Custo Variável */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Custo Variável (R$)</Label>
          <Input type="number" min={0} step={0.01} value={custoVariavel || ""} onChange={(e) => setCustoVariavel(Number(e.target.value))} className="bg-muted/50 border-border" placeholder="0,00" />
        </div>

        {/* Divider for taxes */}
        <div className="col-span-full border-t border-border/50 my-1" />

        {/* Imposto */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Imposto (%)</Label>
          <Input type="number" min={0} step={0.1} value={impostoPct || ""} onChange={(e) => setImpostoPct(Number(e.target.value))} className="bg-muted/50 border-border" placeholder="0" />
        </div>

        {/* Comissão */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Comissão (%)</Label>
          <Input type="number" min={0} step={0.1} value={comissaoPct || ""} onChange={(e) => setComissaoPct(Number(e.target.value))} className="bg-muted/50 border-border" placeholder="0" />
        </div>

        {/* Taxa Cartão */}
        <div className="space-y-1.5">
          <Label className="text-foreground text-xs font-semibold">Taxa Cartão (%)</Label>
          <Input type="number" min={0} step={0.1} value={taxaCartaoPct || ""} onChange={(e) => setTaxaCartaoPct(Number(e.target.value))} className="bg-muted/50 border-border" placeholder="0" />
        </div>
      </div>

      {/* CTA */}
      <Button onClick={handleCalc} className="w-full sm:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-sm px-8 py-2.5">
        <Calculator className="h-4 w-4 mr-2" /> Calcular Preço
      </Button>

      {/* Result */}
      {displayResult && displayResult.valido && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ResultCard icon={DollarSign} label="Preço Sugerido" value={fmt(displayResult.precoSugerido)} highlight />
            <ResultCard icon={TrendingUp} label="Lucro Líquido" value={fmt(displayResult.lucroLiquido)} />
            <ResultCard icon={BarChart3} label="Margem Final" value={`${displayResult.margemFinal}%`} />
            <ResultCard icon={DollarSign} label="Markup" value={`${calcularMarkup(displayResult.precoSugerido, displayResult.custoTotal)}%`} />
          </div>

          {/* Detalhamento */}
          <div className="rounded-xl bg-muted/30 border border-border/50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <DetailItem label="Custo Total" value={fmt(displayResult.custoTotal)} />
            <DetailItem label="Imposto" value={fmt(displayResult.detalhamento.impostoValor)} />
            <DetailItem label="Comissão" value={fmt(displayResult.detalhamento.comissaoValor)} />
            <DetailItem label="Taxa Cartão" value={fmt(displayResult.detalhamento.taxaCartaoValor)} />
          </div>
        </div>
      )}

      {displayResult && !displayResult.valido && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          {displayResult.erro}
        </div>
      )}
    </div>
  );
}

function ResultCard({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "border-primary/40 bg-primary/5" : "border-border/50 bg-muted/20"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`font-display text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <p className="text-foreground font-semibold text-sm">{value}</p>
    </div>
  );
}
