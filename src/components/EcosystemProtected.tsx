import { Lock, ExternalLink, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import logoOficial from "@/assets/logo-oficial-cropped.png";

const UPGRADE_URL = "https://empreendajacomsophi.netlify.app/";

interface Props {
  children: React.ReactNode;
}

const BENEFITS = [
  "Importadoras 25 de Março",
  "Estruturação de negócio",
  "Vendas online",
  "Gestão empresarial",
  "Soph IA",
  "Todos nichos liberados",
];

/**
 * Protege rotas do Ecossistema Completo.
 * Usuários com plano apenas Bolsas (R$19,99) veem oferta de upgrade premium.
 */
export default function EcosystemProtected({ children }: Props) {
  const { hasEcosystemAccess, isLoading } = usePlanAccess();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (hasEcosystemAccess) return <>{children}</>;

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0A192F 0%, #102A43 55%, #0A192F 100%)" }}
    >
      <div className="w-full max-w-lg text-center">
        <div className="mb-6">
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-14 w-auto max-w-[200px] mx-auto object-contain" />
        </div>

        <div className="rounded-2xl border border-primary/30 bg-gradient-card p-8 shadow-glow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[80px] opacity-20" style={{ background: "radial-gradient(circle, #00EFFF 0%, transparent 70%)" }} />

          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                <Lock className="h-7 w-7 text-primary" />
              </div>
            </div>

            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-primary inline-block mb-2">
              Upgrade Premium
            </p>
            <h1 className="font-display text-2xl font-bold text-white mb-3 leading-tight">
              Disponível no Ecossistema Completo
            </h1>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Seu plano atual <strong className="text-white">Bolsas, Mochilas e Malas</strong> libera apenas esse nicho.
              <br />
              Faça upgrade para desbloquear todos os módulos premium.
            </p>

            <ul className="text-left space-y-2.5 mb-7 max-w-sm mx-auto">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-white/90">
                  <span className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)" }}>
                    <Check className="h-3 w-3 text-[#0A192F]" strokeWidth={3} />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <a
                href={UPGRADE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_24px_-6px_rgba(0,239,255,0.5)]"
                style={{
                  backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)",
                  color: "#0A192F",
                }}
              >
                Conhecer Ecossistema Completo <ExternalLink className="h-4 w-4" />
              </a>

              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
