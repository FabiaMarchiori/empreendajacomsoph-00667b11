import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search, Pencil, AlertTriangle, CreditCard, Tag, Truck, BarChart3, Plus,
  ShoppingCart, Zap, Globe, Smartphone, Store, CreditCard as CardIcon, Wallet
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefaultChannels, type DefaultChannel } from "@/hooks/useDefaultChannels";
import { usePricingChannels } from "@/hooks/usePricingData";
import ChannelModal, { type ChannelFormData } from "@/components/precificacao/ChannelModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const channelIconMap: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Mercado Livre — Clássico": { icon: ShoppingCart, color: "#FFE600", bg: "rgba(255,230,0,0.12)" },
  "Mercado Livre — Premium": { icon: ShoppingCart, color: "#FFE600", bg: "rgba(255,230,0,0.12)" },
  "Shopee — CNPJ sem frete grátis": { icon: Zap, color: "#EE4D2D", bg: "rgba(238,77,45,0.12)" },
  "Shopee — CNPJ com frete grátis": { icon: Zap, color: "#EE4D2D", bg: "rgba(238,77,45,0.12)" },
  "Amazon Brasil — Profissional": { icon: Globe, color: "#FF9900", bg: "rgba(255,153,0,0.12)" },
  "Magalu Marketplace": { icon: Store, color: "#0086FF", bg: "rgba(0,134,255,0.12)" },
  "Americanas Marketplace": { icon: Store, color: "#E60014", bg: "rgba(230,0,20,0.12)" },
  "Loja Própria — Cartão": { icon: CreditCard, color: "#00EFFF", bg: "rgba(0,239,255,0.12)" },
  "Loja Própria — Pix": { icon: Wallet, color: "#32BCAD", bg: "rgba(50,188,173,0.12)" },
  "WhatsApp / Instagram + Link": { icon: Smartphone, color: "#25D366", bg: "rgba(37,211,102,0.12)" },
  "Maquininha / PDV": { icon: CardIcon, color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
};

function getChannelVisual(name: string) {
  for (const key of Object.keys(channelIconMap)) {
    if (name.toLowerCase().includes(key.toLowerCase().slice(0, 10))) {
      return channelIconMap[key];
    }
  }
  return { icon: Store, color: "#00EFFF", bg: "rgba(0,239,255,0.12)" };
}

const badgeMap: Record<string, { label: string; color: string }> = {
  usa_faixa_preco: { label: "Taxa variável", color: "border-amber-500/30 text-amber-400 bg-amber-500/10" },
  usa_categoria: { label: "Varia por categoria", color: "border-purple-400/30 text-purple-400 bg-purple-500/10" },
  usa_parcelamento: { label: "Custo parcelamento", color: "border-blue-400/30 text-blue-400 bg-blue-500/10" },
};

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pctFmt = (v: number) => `${v.toFixed(1)}%`;

export default function PrecificacaoCanais() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { defaultChannels, isLoading } = useDefaultChannels();
  const { channels: userChannels, isLoading: loadingUser, create: createUserChannel, remove: removeUserChannel } = usePricingChannels();
  const [search, setSearch] = useState("");

  // Merge: user custom channels (not matching any default) for display
  const customUserChannels = useMemo(() => {
    if (!userChannels.length) return [];
    const defaultNames = new Set(defaultChannels.map(d => d.canal_nome.toLowerCase()));
    return userChannels.filter(uc => !defaultNames.has(uc.canal_nome.toLowerCase()));
  }, [userChannels, defaultChannels]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<DefaultChannel | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return defaultChannels;
    const q = search.toLowerCase();
    return defaultChannels.filter((c) => c.canal_nome.toLowerCase().includes(q) || c.tipo_canal.toLowerCase().includes(q));
  }, [defaultChannels, search]);

  const handleNewChannel = () => {
    setEditingChannel(null);
    setModalOpen(true);
  };

  const handleEditChannel = (channel: DefaultChannel) => {
    setEditingChannel(channel);
    setModalOpen(true);
  };

  const handleSave = async (data: ChannelFormData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingChannel) {
        // Update user's own pricing channel (or create from default)
        const { error } = await supabase
          .from("pricing_channels")
          .upsert({
            user_id: user.id,
            canal_nome: editingChannel.canal_nome,
            comissao_pct: data.comissao_pct,
            taxa_cartao_pct: data.taxa_cartao_pct,
            taxa_fixa: data.taxa_fixa,
            imposto_pct: data.imposto_pct,
            ativo: data.ativo,
          }, { onConflict: "user_id,canal_nome", ignoreDuplicates: false });
        if (error) throw error;
        toast.success("Taxas atualizadas com sucesso!");
      } else {
        const { data: inserted, error } = await supabase
          .from("pricing_channels")
          .insert({
            user_id: user.id,
            canal_nome: data.canal_nome,
            comissao_pct: data.comissao_pct,
            taxa_cartao_pct: data.taxa_cartao_pct,
            taxa_fixa: data.taxa_fixa,
            imposto_pct: data.imposto_pct,
            ativo: data.ativo,
          })
          .select();
        if (error) throw error;
        if (!inserted || inserted.length === 0) throw new Error("Canal não foi salvo");
        toast.success("Canal criado com sucesso!");
      }
      await qc.invalidateQueries({ queryKey: ["pricing-channels"] });
      setModalOpen(false);
    } catch (err) {
      toast.error("Erro ao salvar canal. Verifique suas permissões.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
              <span>Canais e </span>
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #FFFFFF 0%, #F2FBFF 30%, #00FFFF 100%)" }}
              >
                Taxas
              </span>
            </h1>
            <p className="text-sm text-white/80 max-w-lg leading-relaxed mt-1">
              Canais pré-configurados com taxas de referência. Edite as taxas para refletir sua realidade comercial.
            </p>
          </div>
          <Button
            onClick={handleNewChannel}
            className="font-bold text-sm text-[#062638] shrink-0 shadow-[0_0_20px_rgba(0,239,255,0.2)] hover:shadow-[0_0_28px_rgba(0,239,255,0.35)] transition-shadow"
            style={{ background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 50%, #00EFFF 100%)" }}
          >
            <Plus className="h-4 w-4 mr-1.5" /> Novo Canal
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar canal..."
            className="pl-10 border-border/50 text-white placeholder:text-white/40"
            style={{ background: "#102A43" }}
          />
        </div>
      </motion.div>

      {/* Channels grid */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
          Canais Pré-configurados ({filtered.length})
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} onEdit={() => handleEditChannel(channel)} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-sm text-white/50 text-center py-8">Nenhum canal encontrado.</p>
        )}
      </motion.div>

      {/* User custom channels */}
      {(customUserChannels.length > 0 || loadingUser) && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3" style={{ fontFamily: "Manrope, sans-serif" }}>
            Meus Canais Personalizados ({customUserChannels.length})
          </h3>
          {loadingUser ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customUserChannels.map((uc) => {
                const visual = getChannelVisual(uc.canal_nome);
                const Icon = visual.icon;
                return (
                  <div
                    key={uc.id}
                    className="rounded-2xl border border-white/10 p-5 space-y-3.5 hover:border-[#00EFFF]/30 transition-all"
                    style={{ background: "#102A43" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{ background: visual.bg, borderColor: `${visual.color}30` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: visual.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>{uc.canal_nome}</h4>
                        <p className="text-[10px] text-white/50 uppercase tracking-wide font-semibold mt-0.5">personalizado</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <RateItem icon={Tag} label="Comissão" value={pctFmt(Number(uc.comissao_pct))} />
                      <RateItem icon={CreditCard} label="Gateway" value={pctFmt(Number(uc.taxa_cartao_pct))} />
                      <RateItem icon={BarChart3} label="Imposto" value={pctFmt(Number(uc.imposto_pct))} />
                      <RateItem icon={Truck} label="Taxa fixa" value={Number(uc.taxa_fixa) > 0 ? fmt(Number(uc.taxa_fixa)) : "—"} />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeUserChannel.mutate(uc.id)}
                        className="flex-1 border-white/10 text-white/60 hover:border-red-400/40 hover:text-red-400 hover:bg-red-400/5 text-xs font-semibold transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remover
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* Modal */}
      <ChannelModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        channel={editingChannel}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
}

function ChannelCard({ channel, onEdit }: { channel: DefaultChannel; onEdit: () => void }) {
  const visual = getChannelVisual(channel.canal_nome);
  const Icon = visual.icon;
  const badges: { label: string; color: string }[] = [];
  if (channel.usa_faixa_preco) badges.push(badgeMap.usa_faixa_preco);
  if (channel.usa_categoria) badges.push(badgeMap.usa_categoria);
  if (channel.usa_parcelamento) badges.push(badgeMap.usa_parcelamento);

  return (
    <div
      className="rounded-2xl border border-white/10 p-5 space-y-3.5 hover:border-[#00EFFF]/30 transition-all group"
      style={{ background: "#102A43" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ background: visual.bg, borderColor: `${visual.color}30` }}
        >
          <Icon className="h-5.5 w-5.5" style={{ color: visual.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-white leading-tight" style={{ fontFamily: "Manrope, sans-serif" }}>{channel.canal_nome}</h4>
          <p className="text-[10px] text-white/50 uppercase tracking-wide font-semibold mt-0.5">{channel.tipo_canal}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <RateItem icon={Tag} label="Comissão" value={pctFmt(channel.comissao_pct_default)} />
        <RateItem icon={CreditCard} label="Gateway" value={pctFmt(channel.taxa_cartao_pct_default)} />
        <RateItem icon={BarChart3} label="Imposto" value={pctFmt(channel.imposto_pct_sugerido)} />
        <RateItem icon={Truck} label="Taxa fixa" value={channel.taxa_fixa_default > 0 ? fmt(channel.taxa_fixa_default) : "—"} />
      </div>

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b, i) => (
            <span key={i} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${b.color}`}>
              {b.label}
            </span>
          ))}
        </div>
      )}

      {channel.observacoes && (
        <div className="flex items-start gap-2 rounded-lg p-2.5" style={{ background: "rgba(255,191,0,0.06)" }}>
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/70 leading-relaxed">{channel.observacoes}</p>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={onEdit}
        className="w-full border-white/10 text-white hover:border-[#00EFFF]/40 hover:text-[#00EFFF] hover:bg-[#00EFFF]/5 text-xs font-semibold transition-all"
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar Taxas
      </Button>
    </div>
  );
}

function RateItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-white/40" />
      <div>
        <p className="text-[10px] text-white/50">{label}</p>
        <p className="text-xs font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
