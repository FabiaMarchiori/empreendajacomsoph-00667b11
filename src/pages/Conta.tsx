import { motion } from "framer-motion";
import { User, CreditCard, Key, History, HelpCircle, Mail, Phone, MapPin, Shield, Wallet, CheckCircle, ExternalLink, Lock, FileText, Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function ContaPage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { hasActive, subscriptions, isLoading: loadingSubs } = useSubscription();

  const isLoading = loadingProfile || loadingSubs;

  const activeSub = subscriptions.find((s) => s.status === "ativa");
  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? " " + profile.last_name : ""}`
    : user?.email || "Usuário";

  return (
    <motion.div
      className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">Conta / Plano</h1>
          <p className="text-sm text-foreground/80">
            Gerencie seus dados, seu plano, seus acessos e seu suporte em um só lugar.
          </p>
        </div>
        <button
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 text-sm text-white/70 hover:text-white hover:border-destructive/40 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </motion.div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
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
                  <CheckCircle className="h-3 w-3" /> {hasActive ? "Conta ativa" : "Sem plano ativo"}
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Nome", value: displayName, icon: <User className="h-3.5 w-3.5 text-primary" /> },
                  { label: "E-mail", value: user?.email || "—", icon: <Mail className="h-3.5 w-3.5 text-primary" /> },
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
            </motion.div>

            {/* Plano Atual */}
            <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-primary/20 p-6 shadow-glow-sm relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-80" />
              <h2 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Plano Atual
              </h2>

              {activeSub ? (
                <>
                  <div className="bg-gradient-primary-soft rounded-lg px-4 py-4 border border-primary/20 mb-4">
                    <p className="font-display font-bold text-xl text-gradient-primary inline-block">{activeSub.plano}</p>
                    {activeSub.valor && <p className="text-xs text-foreground/70 mt-0.5">R$ {Number(activeSub.valor).toFixed(2)}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Início", value: format(new Date(activeSub.data_inicio), "dd/MM/yyyy") },
                      { label: "Expiração", value: activeSub.data_expiracao ? format(new Date(activeSub.data_expiracao), "dd/MM/yyyy") : "Sem limite" },
                      { label: "Status", value: activeSub.status },
                      { label: "Módulos", value: "Todos" },
                    ].map((s) => (
                      <div key={s.label} className="bg-background/40 rounded-lg p-3 border border-border/60">
                        <p className="text-[10px] text-foreground/60 uppercase tracking-wider">{s.label}</p>
                        <p className="text-sm font-semibold text-foreground mt-0.5 capitalize">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center py-8">
                  <p className="text-sm text-white/50">Nenhum plano ativo encontrado.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Row 2: Ações Rápidas + Configurações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-border p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-40" />
              <h3 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> Ações Rápidas
              </h3>
              <div className="space-y-1.5">
                {[
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
          {subscriptions.length > 0 && (
            <motion.div variants={itemVariants} className="bg-gradient-card rounded-xl border border-border p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-primary-line opacity-40" />
              <h3 className="font-display font-semibold text-base text-foreground mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-primary" /> Histórico de Cobrança
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Plano</th>
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Data</th>
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Valor</th>
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-foreground/60 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((row) => (
                      <tr key={row.id} className="border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors">
                        <td className="py-3 px-3 text-foreground font-medium">{row.plano}</td>
                        <td className="py-3 px-3 text-foreground/80">{format(new Date(row.data_inicio), "dd/MM/yyyy")}</td>
                        <td className="py-3 px-3 text-foreground">{row.valor ? `R$ ${Number(row.valor).toFixed(2)}` : "—"}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${
                            row.status === "ativa" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border/40"
                          }`}>
                            {row.status === "ativa" && <CheckCircle className="h-3 w-3" />}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
