import { useState, useMemo, useEffect, useCallback } from "react";
import { Calculator, TrendingUp, DollarSign, BarChart3, ChevronDown, ChevronUp, AlertTriangle, Info, Zap, Save, RotateCcw } from "lucide-react";
import { calcularPreco, calcularMarkup, type PricingInput } from "@/lib/pricing-engine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Tables } from "@/integrations/supabase/types";
import type { DefaultChannel } from "@/hooks/useDefaultChannels";

interface Props {
  products: Tables<"pricing_products">[];
  channels: Tables<"pricing_channels">[];
  defaultChannels: DefaultChannel[];
  isLoading: boolean;
  onSaveSimulation?: (data: {
    nome_produto?: string;
    canal_nome: string;
    custo_compra: number;
    margem_desejada: number;
    preco_sugerido: number;
    lucro_liquido: number;
    margem_final: number;
    custo_total: number;
  }) => void;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const pctFmt = (v: number) => `${v.toFixed(2)}%`;

export default function PricingSimulator({ products, channels, defaultChannels, isLoading, onSaveSimulation }: Props) {
  // Source selection
  const [channelSource, setChannelSource] = useState<"default" | "custom" | "manual">("default");
  const [selectedDefaultChannel, setSelectedDefaultChannel] = useState("");
  const [selectedCustomChannel, setSelectedCustomChannel] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  // Core fields
  const [custoCompra, setCustoCompra] = useState(0);
  const [custoVariavel, setCustoVariavel] = useState(0);
  const [margemDesejada, setMargemDesejada] = useState(30);

  // Detailed fields
  const [comissaoPct, setComissaoPct] = useState(0);
  const [taxaCartaoPct, setTaxaCartaoPct] = useState(0);
  const [taxaFixa, setTaxaFixa] = useState(0);
  const [impostoPct, setImpostoPct] = useState(6);
  const [frete, setFrete] = useState(0);
  const [embalagem, setEmbalagem] = useState(0);
  const [ads, setAds] = useState(0);
  const [outrosCustos, setOutrosCustos] = useState(0);

  // UI state
  const [detailedOpen, setDetailedOpen] = useState(false);

  // Current default channel for alerts
  const currentDefaultChannel = useMemo(
    () => defaultChannels.find((c) => c.id === selectedDefaultChannel),
    [selectedDefaultChannel, defaultChannels]
  );

  // Auto-fill from product
  useEffect(() => {
    if (!selectedProduct || selectedProduct === "manual") return;
    const p = products.find((x) => x.id === selectedProduct);
    if (p) {
      setCustoCompra(Number(p.custo_compra));
      setCustoVariavel(Number(p.custo_variavel));
    }
  }, [selectedProduct, products]);

  // Auto-fill from default channel
  useEffect(() => {
    if (channelSource !== "default" || !selectedDefaultChannel) return;
    const c = defaultChannels.find((x) => x.id === selectedDefaultChannel);
    if (c) {
      setComissaoPct(Number(c.comissao_pct_default));
      setTaxaCartaoPct(Number(c.taxa_cartao_pct_default));
      setTaxaFixa(Number(c.taxa_fixa_default));
      setImpostoPct(Number(c.imposto_pct_sugerido));
    }
  }, [selectedDefaultChannel, defaultChannels, channelSource]);

  // Auto-fill from custom channel
  useEffect(() => {
    if (channelSource !== "custom" || !selectedCustomChannel) return;
    const c = channels.find((x) => x.id === selectedCustomChannel);
    if (c) {
      setComissaoPct(Number(c.comissao_pct));
      setTaxaCartaoPct(Number(c.taxa_cartao_pct));
      setImpostoPct(Number(c.imposto_pct));
      setTaxaFixa(Number((c as any).taxa_fixa ?? 0));
    }
  }, [selectedCustomChannel, channels, channelSource]);

  // Listen for reuse-simulation events
  useEffect(() => {
    const handler = (e: Event) => {
      const sim = (e as CustomEvent).detail;
      if (sim) {
        setCustoCompra(Number(sim.custo_compra));
        setMargemDesejada(Number(sim.margem_desejada));
        const dc = defaultChannels.find((c) => c.canal_nome === sim.canal_nome);
        if (dc) {
          setChannelSource("default");
          setSelectedDefaultChannel(dc.id);
          setSelectedCustomChannel("");
        }
        setSelectedProduct("manual");
      }
    };
    window.addEventListener("reuse-simulation", handler);
    return () => window.removeEventListener("reuse-simulation", handler);
  }, [defaultChannels]);

  // Channel/product name helpers for saving
  const currentChannelName = useMemo(() => {
    if (channelSource === "default" && selectedDefaultChannel) {
      return defaultChannels.find((c) => c.id === selectedDefaultChannel)?.canal_nome ?? "Manual";
    }
    if (channelSource === "custom" && selectedCustomChannel) {
      return channels.find((c) => c.id === selectedCustomChannel)?.canal_nome ?? "Manual";
    }
    return "Manual";
  }, [channelSource, selectedDefaultChannel, selectedCustomChannel, defaultChannels, channels]);

  const currentProductName = useMemo(() => {
    if (selectedProduct && selectedProduct !== "manual") {
      return products.find((p) => p.id === selectedProduct)?.nome_produto;
    }
    return undefined;
  }, [selectedProduct, products]);

  // Smart reset
  const handleClear = useCallback(() => {
    // Clear manual/product fields
    setSelectedProduct("");
    setCustoCompra(0);
    setCustoVariavel(0);
    setFrete(0);
    setEmbalagem(0);
    setAds(0);
    setOutrosCustos(0);

    // Restore defaults: pick first default channel or keep manual
    if (defaultChannels.length > 0) {
      const first = defaultChannels[0];
      setChannelSource("default");
      setSelectedDefaultChannel(first.id);
      setSelectedCustomChannel("");
      setComissaoPct(Number(first.comissao_pct_default));
      setTaxaCartaoPct(Number(first.taxa_cartao_pct_default));
      setTaxaFixa(Number(first.taxa_fixa_default));
      setImpostoPct(Number(first.imposto_pct_sugerido));
    } else {
      setChannelSource("manual");
      setSelectedDefaultChannel("");
      setSelectedCustomChannel("");
      setComissaoPct(0);
      setTaxaCartaoPct(0);
      setTaxaFixa(0);
      setImpostoPct(6);
    }
    setMargemDesejada(30);
    // Keep detailedOpen as-is
  }, [defaultChannels]);

  const alerts = useMemo(() => {
    if (!currentDefaultChannel) return [];
    const a: string[] = [];
    if (currentDefaultChannel.usa_faixa_preco)
      a.push("Este canal possui taxa variável por faixa de preço. Verifique a tabela oficial.");
    if (currentDefaultChannel.usa_categoria)
      a.push("A comissão pode variar conforme a categoria do produto.");
    if (currentDefaultChannel.usa_parcelamento)
      a.push("Taxas de parcelamento podem aumentar o custo real neste canal.");
    if (currentDefaultChannel.observacoes)
      a.push(currentDefaultChannel.observacoes);
    return a;
  }, [currentDefaultChannel]);

  // Auto-calculate
  const result = useMemo(() => {
    if (custoCompra <= 0) return null;
    const input: PricingInput = {
      custoCompra, custoVariavel, frete, embalagem, ads, outrosCustos,
      impostoPct, comissaoPct, taxaCartaoPct, taxaFixa, margemDesejada,
    };
    return calcularPreco(input);
  }, [custoCompra, custoVariavel, frete, embalagem, ads, outrosCustos, impostoPct, comissaoPct, taxaCartaoPct, taxaFixa, margemDesejada]);

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

  const activeCustomChannels = channels.filter((c) => c.ativo);

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-6 lg:p-8 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Simulador de Preço</h2>
          <p className="text-xs text-muted-foreground">Informe o custo, escolha o canal e descubra quanto cobrar</p>
        </div>
      </div>

      {/* ── MODO SIMPLES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Product */}
        <FieldBlock label="Produto" hint="Opcional — selecione ou preencha abaixo">
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Inserir manualmente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">✏️ Inserir manualmente</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.nome_produto}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBlock>

        {/* Channel source */}
        <FieldBlock label="Canal de Venda" hint="Onde você vai vender?">
          <Select
            value={channelSource === "default" ? (selectedDefaultChannel || "placeholder") : channelSource === "custom" ? (selectedCustomChannel || "placeholder") : "manual"}
            onValueChange={(val) => {
              // Check if it's a default channel
              const dc = defaultChannels.find((c) => c.id === val);
              if (dc) {
                setChannelSource("default");
                setSelectedDefaultChannel(val);
                setSelectedCustomChannel("");
                return;
              }
              // Check if it's a custom channel
              const cc = activeCustomChannels.find((c) => c.id === val);
              if (cc) {
                setChannelSource("custom");
                setSelectedCustomChannel(val);
                setSelectedDefaultChannel("");
                return;
              }
              // Manual
              setChannelSource("manual");
              setSelectedDefaultChannel("");
              setSelectedCustomChannel("");
            }}
          >
            <SelectTrigger className="bg-muted/50 border-border">
              <SelectValue placeholder="Selecione o canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">✏️ Inserir taxas manualmente</SelectItem>
              {defaultChannels.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Marketplaces & Canais</div>
                  {defaultChannels.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.canal_nome}
                    </SelectItem>
                  ))}
                </>
              )}
              {activeCustomChannels.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Meus Canais</div>
                  {activeCustomChannels.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.canal_nome}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </FieldBlock>

        {/* Margem */}
        <FieldBlock label="Margem Desejada" hint="Quanto de lucro você quer (%)">
          <Input type="number" min={0} max={99} value={margemDesejada} onChange={(e) => setMargemDesejada(Number(e.target.value))} className="bg-muted/50 border-border" />
        </FieldBlock>

        {/* Custo Compra */}
        <FieldBlock label="Custo de Compra (R$)" hint="Quanto você paga pelo produto">
          <Input type="number" min={0} step={0.01} value={custoCompra || ""} onChange={(e) => setCustoCompra(Number(e.target.value))} className="bg-muted/50 border-border" placeholder="0,00" />
        </FieldBlock>

        {/* Custo Variável */}
        <FieldBlock label="Custo Variável (R$)" hint="Outros custos diretos por unidade">
          <Input type="number" min={0} step={0.01} value={custoVariavel || ""} onChange={(e) => setCustoVariavel(Number(e.target.value))} className="bg-muted/50 border-border" placeholder="0,00" />
        </FieldBlock>
      </div>

      {/* Channel alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/90 leading-relaxed">{alert}</p>
            </div>
          ))}
        </div>
      )}

      {/* Taxas aplicadas (resumo visual) */}
      <div className="flex flex-wrap gap-2">
        {comissaoPct > 0 && <TaxBadge label="Comissão" value={pctFmt(comissaoPct)} />}
        {taxaCartaoPct > 0 && <TaxBadge label="Cartão" value={pctFmt(taxaCartaoPct)} />}
        {taxaFixa > 0 && <TaxBadge label="Taxa fixa" value={fmt(taxaFixa)} />}
        {impostoPct > 0 && <TaxBadge label="Imposto" value={pctFmt(impostoPct)} />}
      </div>

      {/* ── MODO DETALHADO ── */}
      <Collapsible open={detailedOpen} onOpenChange={setDetailedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-xl px-4 py-2.5 h-auto">
            <span className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              {detailedOpen ? "Ocultar campos detalhados" : "Mostrar campos detalhados (taxas, frete, ads...)"}
            </span>
            {detailedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 rounded-xl border border-border/40 bg-muted/10 p-4">
            <FieldBlock label="Comissão (%)" hint="Do canal/marketplace">
              <Input type="number" min={0} step={0.1} value={comissaoPct || ""} onChange={(e) => setComissaoPct(Number(e.target.value))} className="bg-background border-border" placeholder="0" />
            </FieldBlock>
            <FieldBlock label="Taxa Fixa (R$)" hint="Valor fixo por venda">
              <Input type="number" min={0} step={0.01} value={taxaFixa || ""} onChange={(e) => setTaxaFixa(Number(e.target.value))} className="bg-background border-border" placeholder="0,00" />
            </FieldBlock>
            <FieldBlock label="Taxa Cartão (%)" hint="Gateway/financeira">
              <Input type="number" min={0} step={0.1} value={taxaCartaoPct || ""} onChange={(e) => setTaxaCartaoPct(Number(e.target.value))} className="bg-background border-border" placeholder="0" />
            </FieldBlock>
            <FieldBlock label="Imposto (%)" hint="Sobre o valor bruto">
              <Input type="number" min={0} step={0.1} value={impostoPct || ""} onChange={(e) => setImpostoPct(Number(e.target.value))} className="bg-background border-border" placeholder="0" />
            </FieldBlock>
            <FieldBlock label="Frete (R$)" hint="Custo de envio por item">
              <Input type="number" min={0} step={0.01} value={frete || ""} onChange={(e) => setFrete(Number(e.target.value))} className="bg-background border-border" placeholder="0,00" />
            </FieldBlock>
            <FieldBlock label="Embalagem (R$)" hint="Custo por unidade">
              <Input type="number" min={0} step={0.01} value={embalagem || ""} onChange={(e) => setEmbalagem(Number(e.target.value))} className="bg-background border-border" placeholder="0,00" />
            </FieldBlock>
            <FieldBlock label="Ads / Publicidade (R$)" hint="Custo de anúncios por venda">
              <Input type="number" min={0} step={0.01} value={ads || ""} onChange={(e) => setAds(Number(e.target.value))} className="bg-background border-border" placeholder="0,00" />
            </FieldBlock>
            <FieldBlock label="Outros Custos (R$)" hint="Qualquer outro custo">
              <Input type="number" min={0} step={0.01} value={outrosCustos || ""} onChange={(e) => setOutrosCustos(Number(e.target.value))} className="bg-background border-border" placeholder="0,00" />
            </FieldBlock>
          </div>

          <div className="flex items-start gap-2 mt-3 px-1">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              O imposto incide sobre o valor bruto da venda. Revise as taxas do canal periodicamente — elas podem mudar.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* ── RESULTADO ── */}
      {result && result.valido && (
        <div className="space-y-4 pt-2">
          {/* Hero result */}
          <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 p-5 text-center space-y-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Preço Ideal de Venda</p>
            <p className="font-display text-4xl lg:text-5xl font-black text-primary">{fmt(result.precoSugerido)}</p>
            <p className="text-xs text-muted-foreground">
              Markup de {calcularMarkup(result.precoSugerido, result.custoTotal)}% sobre o custo
            </p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            <ResultCard icon={TrendingUp} label="Lucro Líquido" value={fmt(result.lucroLiquido)} positive={result.lucroLiquido > 0} />
            <ResultCard icon={BarChart3} label="Margem Final" value={pctFmt(result.margemFinal)} positive={result.margemFinal > 0} />
            <ResultCard icon={DollarSign} label="Custo Total" value={fmt(result.custoTotal)} />
          </div>

          {/* Breakdown */}
          <div className="rounded-xl bg-muted/20 border border-border/50 p-4">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Detalhamento do Preço</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
              <DetailItem label="Custo de Compra" value={fmt(result.detalhamento.custoCompra)} />
              {result.detalhamento.custoVariavel > 0 && <DetailItem label="Custo Variável" value={fmt(result.detalhamento.custoVariavel)} />}
              {result.detalhamento.frete > 0 && <DetailItem label="Frete" value={fmt(result.detalhamento.frete)} />}
              {result.detalhamento.embalagem > 0 && <DetailItem label="Embalagem" value={fmt(result.detalhamento.embalagem)} />}
              {result.detalhamento.ads > 0 && <DetailItem label="Ads" value={fmt(result.detalhamento.ads)} />}
              {result.detalhamento.outrosCustos > 0 && <DetailItem label="Outros" value={fmt(result.detalhamento.outrosCustos)} />}
              <DetailItem label="Comissão" value={fmt(result.detalhamento.comissaoValor)} accent />
              {result.detalhamento.taxaFixa > 0 && <DetailItem label="Taxa Fixa" value={fmt(result.detalhamento.taxaFixa)} accent />}
              <DetailItem label="Taxa Cartão" value={fmt(result.detalhamento.taxaCartaoValor)} accent />
              <DetailItem label="Imposto" value={fmt(result.detalhamento.impostoValor)} accent />
              <DetailItem label="Lucro" value={fmt(result.detalhamento.margemValor)} highlight />
            </div>
          </div>

          {/* Low margin warning */}
          {result.margemFinal < 10 && result.margemFinal > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-foreground/90">
                Margem abaixo de 10%. Produtos de ticket baixo neste canal podem não ser viáveis. Considere aumentar o preço ou reduzir custos.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleClear}
              variant="ghost"
              className="flex-1 border border-border/50 text-muted-foreground hover:text-foreground text-sm font-semibold"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Limpar Simulação
            </Button>
            {onSaveSimulation && (
              <Button
                onClick={() => {
                  onSaveSimulation({
                    nome_produto: currentProductName,
                    canal_nome: currentChannelName,
                    custo_compra: custoCompra,
                    margem_desejada: margemDesejada,
                    preco_sugerido: result.precoSugerido,
                    lucro_liquido: result.lucroLiquido,
                    margem_final: result.margemFinal,
                    custo_total: result.custoTotal,
                  });
                }}
                variant="outline"
                className="flex-1 border-primary/30 text-primary hover:bg-primary/10 text-sm font-semibold"
              >
                <Save className="h-4 w-4 mr-2" /> Salvar Simulação
              </Button>
            )}
          </div>
        </div>
      )}

      {result && !result.valido && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          {result.erro}
        </div>
      )}

      {!result && custoCompra <= 0 && (
        <div className="rounded-xl border border-border/30 bg-muted/10 p-6 text-center">
          <Calculator className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Informe o custo do produto para ver o preço ideal</p>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──

function FieldBlock({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground text-xs font-semibold">{label}</Label>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground leading-tight">{hint}</p>}
    </div>
  );
}

function TaxBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted/40 border border-border/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
      {label}: <span className="text-foreground font-semibold">{value}</span>
    </span>
  );
}

function ResultCard({ icon: Icon, label, value, positive, highlight }: { icon: any; label: string; value: string; positive?: boolean; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "border-primary/40 bg-primary/5" : "border-border/50 bg-muted/20"}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${positive ? "text-green-400" : highlight ? "text-primary" : "text-muted-foreground"}`} />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={`font-display text-lg font-bold ${positive ? "text-green-400" : highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function DetailItem({ label, value, accent, highlight }: { label: string; value: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <p className={`text-sm font-semibold ${highlight ? "text-primary" : accent ? "text-accent-foreground/80" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
