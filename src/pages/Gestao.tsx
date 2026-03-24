import { motion } from "framer-motion";
import { BarChart3, Star, MessageCircle, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function GestaoPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Gestão do Negócio</h1>
        <p className="text-sm text-muted-foreground">Controle sua operação, precifique corretamente e gerencie tudo em um só lugar.</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {/* Precificação */}
        <motion.div variants={item} className="bg-gradient-card rounded-xl border border-primary/20 p-6 shadow-glow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-lg text-foreground">Sistema de Precificação</h2>
                <StatusBadge status="liberado" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Calcule o preço ideal dos seus produtos com margem, custos e competitividade. Ferramenta essencial para lucrar de verdade.</p>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                Abrir Precificação <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ERP */}
        <motion.div variants={item} className="bg-gradient-card rounded-xl border border-primary/20 p-6 shadow-glow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-lg text-foreground">ERP – Soph Gestão</h2>
                <StatusBadge status="bonus" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Gerencie estoque, vendas, clientes e financeiro em uma única ferramenta. O braço direito do seu negócio.</p>
              <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                Abrir ERP <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Soph */}
        <motion.div variants={item} className="bg-gradient-card rounded-xl border border-accent/30 p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 animate-float">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-lg text-foreground">Soph, sua Sócia Digital</h2>
                <StatusBadge status="liberado" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Tire dúvidas, peça sugestões e receba orientação inteligente para cada fase do seu negócio.</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Como precificar?", "Dúvidas sobre MEI", "Dicas de vendas"].map((q) => (
                  <span key={q} className="px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/30 cursor-pointer transition-colors">{q}</span>
                ))}
              </div>
              <button onClick={() => navigate("/soph")} className="px-4 py-2 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/10 transition-colors flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" /> Conversar com a Soph
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
