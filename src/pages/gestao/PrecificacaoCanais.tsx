import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Store, Pencil, AlertTriangle, CreditCard, Tag, Truck, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefaultChannels, type DefaultChannel } from "@/hooks/useDefaultChannels";
import PricingChannels from "@/components/precificacao/PricingChannels";

const badgeMap: Record<string, { label: string; color: string }> = {
  usa_faixa_preco: { label: "Taxa variável", color: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  usa_categoria: { label: "Varia por categoria", color: "bg-purple-500/15 text-purple-400 border-purple-500/20" },
  usa_parcelamento: { label: "Custo parcelamento", color: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pctFmt = (v: number) => `${v.toFixed(1)}%`;

export default function PrecificacaoCanais() {
  const { defaultChannels, isLoading } = useDefaultChannels();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return defaultChannels;
    const q = search.toLowerCase();
    return defaultChannels.filter((c) => c.canal_nome.toLowerCase().includes(q) || c.tipo_canal.toLowerCase().includes(q));
  }, [defaultChannels, search]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-8 lg:pt-0">
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          <span className="text-foreground">Canais e </span>
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #F2FBFF 30%, #00FFFF 100%)" }}
          >
            Taxas
          </span>
        </h1>
        <p className="text-sm text-foreground/80 max-w-lg leading-relaxed">
          Canais pré-configurados com taxas de referência. Edite as taxas para refletir sua realidade comercial.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar canal..."
            className="pl-10 bg-card border-border/50"
          />
        </div>
      </motion.div>

      {/* Default channels grid */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
          Canais Pré-configurados ({filtered.length})
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-sm text-foreground/50 text-center py-8">Nenhum canal encontrado.</p>
        )}
      </motion.div>

      {/* Custom channels */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
          Meus Canais Personalizados
        </h3>
        <PricingChannels />
      </motion.div>
    </div>
  );
}

function ChannelCard({ channel }: { channel: DefaultChannel }) {
  const badges: { label: string; color: string }[] = [];
  if (channel.usa_faixa_preco) badges.push(badgeMap.usa_faixa_preco);
  if (channel.usa_categoria) badges.push(badgeMap.usa_categoria);
  if (channel.usa_parcelamento) badges.push(badgeMap.usa_parcelamento);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground" style={{ fontFamily: "Manrope, sans-serif" }}>{channel.canal_nome}</h4>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wide font-semibold">{channel.tipo_canal}</p>
          </div>
        </div>
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 gap-2">
        <RateItem icon={Tag} label="Comissão" value={pctFmt(channel.comissao_pct_default)} />
        <RateItem icon={CreditCard} label="Gateway" value={pctFmt(channel.taxa_cartao_pct_default)} />
        <RateItem icon={BarChart3} label="Imposto" value={pctFmt(channel.imposto_pct_sugerido)} />
        <RateItem icon={Truck} label="Taxa fixa" value={channel.taxa_fixa_default > 0 ? fmt(channel.taxa_fixa_default) : "—"} />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b, i) => (
            <span key={i} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${b.color}`}>
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* Observations */}
      {channel.observacoes && (
        <div className="flex items-start gap-2 rounded-lg bg-muted/20 p-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-foreground/70 leading-relaxed">{channel.observacoes}</p>
        </div>
      )}
    </div>
  );
}

function RateItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-foreground/40" />
      <div>
        <p className="text-[10px] text-foreground/40">{label}</p>
        <p className="text-xs font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
