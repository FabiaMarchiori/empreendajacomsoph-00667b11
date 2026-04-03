import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DefaultChannel } from "@/hooks/useDefaultChannels";

interface ChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel?: DefaultChannel | null;
  onSave: (data: ChannelFormData) => void;
  isSaving?: boolean;
}

export interface ChannelFormData {
  canal_nome: string;
  tipo_canal: string;
  comissao_pct: number;
  taxa_cartao_pct: number;
  taxa_fixa: number;
  imposto_pct: number;
  observacoes: string;
  ativo: boolean;
}

const tipoOptions = ["marketplace", "loja_propria", "social", "presencial", "outro"];
const tipoLabels: Record<string, string> = {
  marketplace: "Marketplace",
  loja_propria: "Loja Própria",
  social: "Social / WhatsApp",
  presencial: "Presencial / PDV",
  outro: "Outro",
};

export default function ChannelModal({ open, onOpenChange, channel, onSave, isSaving }: ChannelModalProps) {
  const isEditing = !!channel;

  const [form, setForm] = useState<ChannelFormData>({
    canal_nome: "",
    tipo_canal: "marketplace",
    comissao_pct: 0,
    taxa_cartao_pct: 0,
    taxa_fixa: 0,
    imposto_pct: 6,
    observacoes: "",
    ativo: true,
  });

  useEffect(() => {
    if (channel) {
      setForm({
        canal_nome: channel.canal_nome,
        tipo_canal: channel.tipo_canal,
        comissao_pct: channel.comissao_pct_default,
        taxa_cartao_pct: channel.taxa_cartao_pct_default,
        taxa_fixa: channel.taxa_fixa_default,
        imposto_pct: channel.imposto_pct_sugerido,
        observacoes: channel.observacoes ?? "",
        ativo: channel.ativo,
      });
    } else {
      setForm({
        canal_nome: "",
        tipo_canal: "marketplace",
        comissao_pct: 0,
        taxa_cartao_pct: 0,
        taxa_fixa: 0,
        imposto_pct: 6,
        observacoes: "",
        ativo: true,
      });
    }
  }, [channel, open]);

  const update = (key: keyof ChannelFormData, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.canal_nome.trim()) return;
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg border-white/10"
        style={{ background: "#0A192F" }}
      >
        <DialogHeader>
          <DialogTitle className="text-white font-bold text-lg" style={{ fontFamily: "Manrope, sans-serif" }}>
            {isEditing ? "Editar Taxas do Canal" : "Novo Canal"}
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm">
            {isEditing
              ? "Ajuste as taxas para refletir sua realidade comercial."
              : "Crie um canal personalizado com suas taxas."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nome + Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold">Nome do Canal</Label>
              <Input
                value={form.canal_nome}
                onChange={(e) => update("canal_nome", e.target.value)}
                placeholder="Ex: Shopee Premium"
                className="border-white/10 text-white placeholder:text-white/30"
                style={{ background: "#102A43" }}
                disabled={isEditing}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold">Tipo</Label>
              <Select value={form.tipo_canal} onValueChange={(v) => update("tipo_canal", v)} disabled={isEditing}>
                <SelectTrigger className="border-white/10 text-white" style={{ background: "#102A43" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipoOptions.map((t) => (
                    <SelectItem key={t} value={t}>{tipoLabels[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rates 2x2 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold">Comissão (%)</Label>
              <Input
                type="number" min={0} step={0.1}
                value={form.comissao_pct || ""}
                onChange={(e) => update("comissao_pct", Number(e.target.value))}
                className="border-white/10 text-white"
                style={{ background: "#102A43" }}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold">Taxa Cartão (%)</Label>
              <Input
                type="number" min={0} step={0.1}
                value={form.taxa_cartao_pct || ""}
                onChange={(e) => update("taxa_cartao_pct", Number(e.target.value))}
                className="border-white/10 text-white"
                style={{ background: "#102A43" }}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold">Taxa Fixa (R$)</Label>
              <Input
                type="number" min={0} step={0.01}
                value={form.taxa_fixa || ""}
                onChange={(e) => update("taxa_fixa", Number(e.target.value))}
                className="border-white/10 text-white"
                style={{ background: "#102A43" }}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white text-xs font-semibold">Imposto (%)</Label>
              <Input
                type="number" min={0} step={0.1}
                value={form.imposto_pct || ""}
                onChange={(e) => update("imposto_pct", Number(e.target.value))}
                className="border-white/10 text-white"
                style={{ background: "#102A43" }}
                placeholder="0"
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label className="text-white text-xs font-semibold">Observações</Label>
            <Textarea
              value={form.observacoes}
              onChange={(e) => update("observacoes", e.target.value)}
              placeholder="Anotações sobre este canal..."
              rows={2}
              className="border-white/10 text-white placeholder:text-white/30 resize-none"
              style={{ background: "#102A43" }}
            />
          </div>

          {/* Ativo */}
          <div className="flex items-center justify-between rounded-xl p-3 border border-white/10" style={{ background: "#102A43" }}>
            <div>
              <p className="text-sm font-semibold text-white">Canal Ativo</p>
              <p className="text-[11px] text-white/50">Canais inativos não aparecem no simulador</p>
            </div>
            <Switch checked={form.ativo} onCheckedChange={(v) => update("ativo", v)} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !form.canal_nome.trim()}
              className="flex-1 font-bold text-[#062638]"
              style={{ background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 50%, #00EFFF 100%)" }}
            >
              {isSaving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Canal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
