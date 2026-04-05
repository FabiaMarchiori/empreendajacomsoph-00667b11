import { motion } from "framer-motion";
import { User, CreditCard, Key, History, HelpCircle, Mail, Shield, Wallet, CheckCircle, ExternalLink, Lock, FileText, Loader2, LogOut, Pencil, X, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const WHATSAPP_SUPPORT = "https://wa.me/5511983348749?text=Suporte%20Ecossistema";

function PasswordChangeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      toast.error("Erro ao alterar senha: " + error.message);
    } else {
      toast.success("Senha alterada com sucesso!");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0A192F] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Alterar Senha
          </h3>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white font-medium mb-1 block">Nova senha</label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label className="text-xs text-white font-medium mb-1 block">Confirmar nova senha</label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10 text-white" placeholder="Repita a nova senha" />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-primary-btn text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? "Alterando..." : "Salvar nova senha"}
        </button>
      </motion.div>
    </div>
  );
}

export default function ContaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { signOut, user } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { hasActive, subscriptions, isLoading: loadingSubs } = useSubscription();

  const isLoading = loadingProfile || loadingSubs;

  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const activeSub = subscriptions.find((s) => s.status === "ativa");
  const displayName = profile?.first_name
    ? `${profile.first_name}${profile.last_name ? " " + profile.last_name : ""}`
    : user?.email || "Usuário";

  const startEditName = () => {
    setFirstName(profile?.first_name || "");
    setLastName(profile?.last_name || "");
    setEditingName(true);
  };

  const saveName = async () => {
    if (!firstName.trim()) {
      toast.error("O nome não pode ficar vazio.");
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ first_name: firstName.trim(), last_name: lastName.trim() || null })
      .eq("id", user!.id);
    setSavingName(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Nome atualizado com sucesso!");
      setEditingName(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  return (
    <motion.div
      className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PasswordChangeModal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} />

      {/* Hero */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-1">Conta / Plano</h1>
          <p className="text-sm text-white">
            Gerencie seus dados, seu plano, seus acessos e seu suporte em um só lugar.
          </p>
        </div>
        <button
          onClick={async () => { await signOut(); navigate("/login"); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-sm text-white hover:border-destructive/60 hover:text-red-400 transition-colors"
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
                {/* Nome - editable */}
                <div className="flex items-center gap-3 bg-background/40 rounded-lg px-3 py-2.5 border border-border/60">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white uppercase tracking-wider">Nome</p>
                    {editingName ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" className="h-7 text-xs bg-white/5 border-white/10 text-white" />
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sobrenome" className="h-7 text-xs bg-white/5 border-white/10 text-white" />
                        <button onClick={saveName} disabled={savingName} className="text-primary hover:text-primary/80">
                          {savingName ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        </button>
                        <button onClick={() => setEditingName(false)} className="text-white/60 hover:text-white"><X className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-foreground font-medium truncate">{displayName}</p>
                        <button onClick={startEditName} className="text-white/40 hover:text-primary transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email - read only with explanation */}
                <div className="flex items-center gap-3 bg-background/40 rounded-lg px-3 py-2.5 border border-border/60">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white uppercase tracking-wider">E-mail</p>
                    <p className="text-sm text-foreground font-medium truncate">{user?.email || "—"}</p>
                    <p className="text-[10px] text-white/50 mt-0.5">Para alterar o e-mail, entre em contato com o suporte.</p>
                  </div>
                </div>
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
                    {activeSub.valor && <p className="text-xs text-white mt-0.5">R$ {Number(activeSub.valor).toFixed(2)}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Início", value: format(new Date(activeSub.data_inicio), "dd/MM/yyyy") },
                      { label: "Expiração", value: activeSub.data_expiracao ? format(new Date(activeSub.data_expiracao), "dd/MM/yyyy") : "Sem limite" },
                      { label: "Status", value: activeSub.status },
                      { label: "Módulos", value: "Todos" },
                    ].map((s) => (
                      <div key={s.label} className="bg-background/40 rounded-lg p-3 border border-border/60">
                        <p className="text-[10px] text-white uppercase tracking-wider">{s.label}</p>
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
                  { label: "Gerenciar acessos", icon: <Key className="h-4 w-4 text-primary" />, desc: "Veja seus módulos e brindes", action: () => navigate("/acessos") },
                  { label: "Suporte", icon: <HelpCircle className="h-4 w-4 text-primary" />, desc: "Fale com nossa equipe via WhatsApp", action: () => window.open(WHATSAPP_SUPPORT, "_blank") },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-primary/5 border border-transparent hover:border-border/60 transition-all group"
                  >
                    {a.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{a.label}</p>
                      <p className="text-xs text-white">{a.desc}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-white/30 group-hover:text-primary transition-colors" />
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
                  { label: "Segurança e senha", icon: <Lock className="h-4 w-4 text-primary" />, desc: "Altere sua senha de acesso", action: () => setPasswordModalOpen(true) },
                  { label: "Métodos de pagamento", icon: <Wallet className="h-4 w-4 text-primary" />, desc: "Gerenciado pela plataforma de compra", badge: "Em breve" },
                  { label: "Central de ajuda", icon: <FileText className="h-4 w-4 text-primary" />, desc: "Fale com nosso suporte", action: () => window.open(WHATSAPP_SUPPORT, "_blank") },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    disabled={!a.action}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-primary/5 border border-transparent hover:border-border/60 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {a.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{a.label}</p>
                      <p className="text-xs text-white">{a.desc}</p>
                    </div>
                    {"badge" in a && a.badge ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-primary/20 text-primary">{a.badge}</span>
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5 text-white/30 group-hover:text-primary transition-colors" />
                    )}
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
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-white font-medium">Plano</th>
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-white font-medium">Data</th>
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-white font-medium">Valor</th>
                      <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-white font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((row) => (
                      <tr key={row.id} className="border-b border-border/30 last:border-0 hover:bg-primary/5 transition-colors">
                        <td className="py-3 px-3 text-foreground font-medium">{row.plano}</td>
                        <td className="py-3 px-3 text-white">{format(new Date(row.data_inicio), "dd/MM/yyyy")}</td>
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
