import { motion } from "framer-motion";
import { User, CreditCard, Key, History, HelpCircle, Mail, Phone, MapPin } from "lucide-react";

export default function ContaPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Conta / Plano</h1>
        <p className="text-sm text-muted-foreground">Gerencie seus dados e visualize seu plano.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados pessoais */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Dados Pessoais
          </h2>
          <div className="space-y-4">
            {[
              { label: "Nome", value: "Maria Empreendedora", icon: <User className="h-3.5 w-3.5" /> },
              { label: "E-mail", value: "maria@email.com", icon: <Mail className="h-3.5 w-3.5" /> },
              { label: "Telefone", value: "(11) 99999-9999", icon: <Phone className="h-3.5 w-3.5" /> },
              { label: "Cidade", value: "São Paulo, SP", icon: <MapPin className="h-3.5 w-3.5" /> },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">{f.icon} {f.label}</label>
                <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm text-foreground border border-border">{f.value}</div>
              </div>
            ))}
            <button className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
              Editar dados
            </button>
          </div>
        </motion.div>

        {/* Plano */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
          <div className="bg-gradient-card rounded-xl border border-primary/20 p-6 shadow-glow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <h2 className="font-display font-semibold text-base text-foreground mb-2 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Plano Atual
            </h2>
            <div className="bg-primary/10 rounded-lg px-4 py-3 border border-primary/20 mb-3">
              <p className="font-display font-bold text-primary text-lg">Ecossistema Completo</p>
              <p className="text-xs text-muted-foreground">Acesso total a todas as ferramentas e módulos</p>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Próxima renovação: <span className="text-foreground">15/04/2026</span></p>
              <p>Acessos ativos: <span className="text-primary font-medium">5 produtos</span></p>
              <p>Bônus inclusos: <span className="text-primary font-medium">2 itens</span></p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Key className="h-4 w-4 text-primary" /> Ações rápidas
            </h3>
            <div className="space-y-2">
              {[
                { label: "Ver histórico de compras", icon: <History className="h-3.5 w-3.5" /> },
                { label: "Gerenciar acessos", icon: <Key className="h-3.5 w-3.5" /> },
                { label: "Suporte", icon: <HelpCircle className="h-3.5 w-3.5" /> },
              ].map((a) => (
                <button key={a.label} className="w-full flex items-center gap-2.5 p-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left">
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
