import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logoOficial from "@/assets/logo-oficial-cropped.png";

const RESET_REDIRECT_URL = "https://appempreendajacomsoph.netlify.app/reset-password";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    console.log("[ForgotPassword] → Enviando reset para:", email);
    console.log("[ForgotPassword] → redirectTo:", RESET_REDIRECT_URL);
    console.log("[ForgotPassword] → origin atual:", window.location.origin);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: RESET_REDIRECT_URL,
      });

      setLoading(false);

      if (error) {
        console.error("[ForgotPassword] ✗ Erro Supabase:", error);
        toast.error(error.message || "Não foi possível enviar o e-mail. Tente novamente.");
        return;
      }

      console.log("[ForgotPassword] ✓ E-mail enviado com sucesso.");
      setSent(true);
      toast.success("E-mail de recuperação enviado!");
    } catch (err: any) {
      setLoading(false);
      console.error("[ForgotPassword] ✗ Erro de rede/fetch:", err);
      const isPreview = window.location.hostname.includes("lovable.app");
      if (err?.message === "Failed to fetch" && isPreview) {
        toast.error(
          "Não funciona no preview do Lovable. Teste no domínio publicado: appempreendajacomsoph.netlify.app/forgot-password",
          { duration: 8000 }
        );
      } else {
        toast.error(err?.message || "Erro de conexão. Verifique sua internet e tente novamente.");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0A192F 0%, #102A43 55%, #0A192F 100%)" }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-20 w-auto max-w-[300px] mx-auto object-contain" />
          <h1 className="font-display text-2xl font-extrabold text-white mt-4">Recupere sua senha</h1>
          <p className="text-sm text-white/70 mt-1">Enviaremos um link para redefinir sua senha</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-glow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/80">
                  Enviamos um link para <span className="font-semibold text-white">{email}</span>.
                </p>
                <p className="text-xs text-white/50 mt-2">Verifique também a caixa de spam.</p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all"
                style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)", color: "#0A192F" }}
              >
                Voltar para login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/60 mb-1 block">E-mail da conta</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)", color: "#0A192F" }}
              >
                {loading ? "Enviando..." : "Enviar link de recuperação"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full text-sm text-white/60 hover:text-white flex items-center justify-center gap-1.5 pt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar para login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
