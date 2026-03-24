import { motion } from "framer-motion";
import { Package, BarChart3, Star, MessageCircle, Sparkles, Lock, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface AccessItem {
  title: string;
  description: string;
  status: "liberado" | "bonus" | "disponivel";
  icon: React.ReactNode;
}

const activeAccess: AccessItem[] = [
  { title: "Central de Fornecedores", description: "Importadoras 25 de Março e mais", status: "liberado", icon: <Package className="h-5 w-5" /> },
  { title: "Sistema de Precificação", description: "Calcule margens e preços ideais", status: "liberado", icon: <BarChart3 className="h-5 w-5" /> },
  { title: "Soph, sua Sócia Digital", description: "Orientação inteligente para seu negócio", status: "liberado", icon: <MessageCircle className="h-5 w-5" /> },
];

const bonusAccess: AccessItem[] = [
  { title: "ERP – Soph Gestão", description: "Gestão completa do seu negócio", status: "bonus", icon: <Star className="h-5 w-5" /> },
  { title: "Moda Íntima – Fornecedores", description: "Acesso bônus ao catálogo", status: "bonus", icon: <Package className="h-5 w-5" /> },
];

const availableAccess: AccessItem[] = [
  { title: "Semi-jóias de Limeira", description: "Fabricantes direto de Limeira", status: "disponivel", icon: <Package className="h-5 w-5" /> },
  { title: "Calçados dos Polos", description: "Fábricas dos principais polos", status: "disponivel", icon: <Package className="h-5 w-5" /> },
  { title: "Fabricantes Nacionais", description: "Brinquedos, decoração e mais", status: "disponivel", icon: <Package className="h-5 w-5" /> },
  { title: "Moda Masculina", description: "Fornecedores atacado", status: "disponivel", icon: <Package className="h-5 w-5" /> },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function AccessSection({ title, subtitle, items }: { title: string; subtitle: string; items: AccessItem[] }) {
  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-foreground mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {items.map((a) => (
          <motion.div key={a.title} variants={item} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:border-primary/20 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-foreground">{a.title}</h3>
              <p className="text-xs text-muted-foreground">{a.description}</p>
            </div>
            <StatusBadge status={a.status} />
            {a.status !== "disponivel" ? (
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-primary/10 transition-colors flex items-center gap-1">
                Acessar <ArrowRight className="h-3 w-3" />
              </button>
            ) : (
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary border border-border hover:border-primary/30 transition-colors flex items-center gap-1">
                <Lock className="h-3 w-3" /> Ativar
              </button>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function AcessosPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Meus Acessos</h1>
        <p className="text-sm text-muted-foreground">Veja tudo o que você já possui e o que pode ativar.</p>
      </motion.div>

      <AccessSection title="Ativos" subtitle="Produtos liberados e disponíveis para uso" items={activeAccess} />
      <AccessSection title="Inclusos no seu plano" subtitle="Itens recebidos como bônus ou benefício" items={bonusAccess} />
      <AccessSection title="Disponíveis para expandir" subtitle="Produtos e módulos que você pode ativar" items={availableAccess} />
    </div>
  );
}
