import { motion } from "framer-motion";
import { User, CreditCard, Key, History, HelpCircle, Mail, Phone, MapPin, Shield, Wallet, CheckCircle, ExternalLink, Lock, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const billingHistory = [
  { item: "Ecossistema Completo", date: "15/03/2026", value: "R$ 497,00", status: "Pago" },
  { item: "Ecossistema Completo", date: "15/02/2026", value: "R$ 497,00", status: "Pago" },
  { item: "Ecossistema Completo", date: "15/01/2026", value: "R$ 497,00", status: "Pago" },
  { item: "Acesso Inicial", date: "15/12/2025", value: "R$ 297,00", status: "Pago" },
];

export default function ContaPage() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">Conta / Plano</h1>
        <p className="text-sm text-foreground/80">
          Gerencie seus dados, seu plano, seus acessos e seu suporte em um só lugar.
        </p>
      </motion.div>

      {/* Row 1: Dados Pessoais + Plano Atual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Pessoais */}
        <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-60" />
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Dados Pessoais
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border border-primary/30 text-primary">
              <CheckCircle className="h-3 w-3" /> Conta ativa
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: "Nome", value: "Maria Empreendedora", icon: <User className="h-3.5 w-3.5 text-primary" /> },
              { label: "E-mail", value: "maria@email.com", icon: <Mail className="h-3.5 w-3.5 text-primary" /> },
              { label: "Telefone", value: "(11) 99999-9999", icon: <Phone className="h-3.5 w-3.5 text-primary" /> },
              { label: "Cidade", value: "São Paulo, SP", icon: <MapPin className="h-3.5 w-3.5 text-primary" /> },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 bg-background/40 rounded-lg px-3 py-2.5 border border-border/60">
                {f.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-foreground/60 uppercase tracking-wider">{f.label}</p>
                  <p className="text-sm text-foreground font-medium truncate">{f.value}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="mt-4 w-full px-4 py-2.5 rounded-lg border border-border text-sm text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors">
            Editar dados
          </button>
        </motion.div>

        {/* Plano Atual */}
        <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-primary/20 p-6 shadow-glow-sm relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-80" />
          <h2 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" /> Plano Atual
          </h2>

          <div className="bg-gradient-primary-soft rounded-lg px-4 py-4 border border-primary/20 mb-4">
            <p className="font-display font-bold text-xl text-gradient-primary inline-block">Ecossistema Completo</p>
            <p className="text-xs text-foreground/70 mt-0.5">Acesso total a todas as ferramentas e módulos</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Próxima renovação", value: "15/04/2026" },
              { label: "Acessos ativos", value: "5 produtos" },
              { label: "Brindes inclusos", value: "8 itens" },
              { label: "Status", value: "Ativo" },
            ].map((s) => (
              <div key={s.label} className="bg-background/40 rounded-lg p-3 border border-border/60">
                <p className="text-[10px] text-foreground/60 uppercase tracking-wider">{s.label}</p>
                <p className="text-sm font-semibold text-foreground mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <button className="w-full py-2.5 rounded-lg font-semibold text-sm bg-gradient-primary-btn shadow-glow-sm hover:brightness-110 transition-all" style={{ color: '#0A192F' }}>
              Gerenciar plano
            </button>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Ações Rápidas + Configurações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ações Rápidas */}
        <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-40" />
          <h3 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-primary" /> Ações Rápidas
          </h3>
          <div className="space-y-1.5">
            {[
              { label: "Ver histórico de compras", icon: <History className="h-4 w-4 text-primary" />, desc: "Confira pagamentos e faturas" },
              { label: "Gerenciar acessos", icon: <Key className="h-4 w-4 text-primary" />, desc: "Veja seus módulos e brindes", route: "/acessos" },
              { label: "Suporte", icon: <HelpCircle className="h-4 w-4 text-primary" />, desc: "Fale com nossa equipe" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => a.route && navigate(a.route)}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-primary/5 border border-transparent hover:border-border/60 transition-all group"
              >
                {a.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{a.label}</p>
                  <p className="text-xs text-foreground/60">{a.desc}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-foreground/30 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Configurações */}
        <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-40" />
          <h3 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Configurações
          </h3>
          <div className="space-y-1.5">
            {[
              { label: "Segurança e senha", icon: <Lock className="h-4 w-4 text-primary" />, desc: "Altere sua senha e dados de acesso" },
              { label: "Métodos de pagamento", icon: <Wallet className="h-4 w-4 text-primary" />, desc: "Gerencie cartões e formas de pagamento" },
              { label: "Central de ajuda", icon: <FileText className="h-4 w-4 text-primary" />, desc: "Perguntas frequentes e tutoriais" },
            ].map((a) => (
              <button
                key={a.label}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-primary/5 border border-transparent hover:border-border/60 transition-all group"
              >
                {a.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{a.label}</p>
                  <p className="text-xs text-foreground/60">{a.desc}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-foreground/30 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Histórico de Cobrança */}
      <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-border p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-40" />
        <h3 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> Histórico de Cobrança
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Item / Plano</th>
                <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Data</th>
                <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Valor</th>
                <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Status</th>
                <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {billingHistory.map((row, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="py-3 px-3 text-foreground font-medium">{row.item}</td>
                  <td className="py-3 px-3 text-foreground/80">{row.date}</td>
                  <td className="py-3 px-3 text-foreground">{row.value}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <CheckCircle className="h-3 w-3" /> {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-xs text-primary hover:underline">Ver recibo</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
