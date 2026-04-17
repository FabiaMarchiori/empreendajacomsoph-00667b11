import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoOficial from "@/assets/logo-oficial-cropped.png";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase coloca o token no hash (#access_token=...&type=recovery)
    // O SDK trata automaticamente via onAuthStateChange (PASSWORD_RECOVERY)
    const hash = window.location.hash;
    const search = window.location.search;

    console.log("[ResetPassword] hash:", hash);
    console.log("[ResetPassword] search:", search);

    // Captura erros vindos do Supabase no hash (link expirado etc.)
    if (hash.includes("error")) {
      const params = new URLSearchParams(hash.substring(1));
      const errorDescription = params.get("error_description") || "Link inválido ou expirado.";
      console.error("[ResetPassword] Erro no hash:", errorDescription);
      setErrorMsg(decodeURIComponent(errorDescription).replace(/\+/g, " "));
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("[ResetPassword] auth event:", event, "session:", !!session);
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setSessionReady(true);
      }
    });

    // Fallback: já existe sessão (ex.: token PKCE já trocado)
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[ResetPassword] sessão atual:", !!session);
      if (session) setSessionReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (!sessionReady) {
      toast.error("Sessão de recuperação inválida. Solicite um novo link.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      console.error("[ResetPassword] updateUser error:", error);
      toast.error(error.message || "Não foi possível atualizar a senha.");
      return;
    }

    setSuccess(true);
    toast.success("Senha redefinida com sucesso!");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0A192F 0%, #102A43 55%, #0A192F 100%)" }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-20 w-auto max-w-[300px] mx-auto object-contain" />
          <h1 className="font-display text-2xl font-extrabold text-white mt-4">Redefinir senha</h1>
          <p className="text-sm text-white/70 mt-1">Crie uma nova senha para acessar sua conta</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-glow-sm">
          {errorMsg ? (
            <div className="text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-7 w-7 text-red-400" />
              </div>
              <p className="text-sm text-white/80">{errorMsg}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)", color: "#0A192F" }}
              >
                Voltar para login
              </button>
            </div>
          ) : success ? (
            <div className="text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>
              <p className="text-sm text-white/80">Senha atualizada! Redirecionando para o login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-11 py-3 text-sm text-foreground placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/60 mb-1 block">Confirmar nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {!sessionReady && (
                <p className="text-xs text-amber-300/80">Validando link de recuperação...</p>
              )}

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)", color: "#0A192F" }}
              >
                {loading ? "Salvando..." : "Redefinir senha"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
