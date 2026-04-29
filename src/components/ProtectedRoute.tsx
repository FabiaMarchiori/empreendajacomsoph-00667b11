import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, ShieldX, Mail, ExternalLink } from "lucide-react";
import logoOficial from "@/assets/logo-oficial-cropped.png";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { hasActive, isLoading: subLoading } = useSubscription();
  const navigate = useNavigate();

  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A192F" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasActive) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0A192F 0%, #102A43 55%, #0A192F 100%)" }}>
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-16 w-auto max-w-[220px] mx-auto object-contain" />
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-glow-sm">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldX className="h-7 w-7 text-red-400" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-white mb-2">Acesso não liberado</h1>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              Seu acesso ainda não foi liberado. Verifique se a compra foi concluída com o mesmo e-mail usado no login.
            </p>

            <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6 text-left">
              <p className="text-xs text-white/40 mb-1">Logado como</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm text-white/80 truncate">{user.email}</span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href="https://wa.me/5511983348749?text=Suporte%3A%20Tela%20de%20acesso"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
                style={{ backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)", color: "#0A192F" }}
              >
                Falar com suporte <ExternalLink className="h-4 w-4" />
              </a>

              <button
                onClick={async () => { await signOut(); navigate("/login"); }}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                <LogOut className="h-4 w-4" /> Sair e usar outro e-mail
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
