import { Lock, ExternalLink, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoOficial from "@/assets/logo-oficial-cropped.png";

// TODO: substituir pelo link de checkout Kiwify do nicho Bolsas
const CHECKOUT_URL = "#";

export default function BolsasGate() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0A192F 0%, #102A43 55%, #0A192F 100%)" }}
    >
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-14 w-auto max-w-[200px] mx-auto object-contain" />
        </div>

        <div className="rounded-2xl border border-border/60 bg-gradient-card p-8 shadow-glow-sm">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
          </div>

          <p className="text-xs font-semibold tracking-widest uppercase text-primary/80 mb-2">
            Nicho Premium
          </p>
          <h1 className="text-xl font-bold text-white mb-2">Bolsas, Mochilas e Malas</h1>
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            Esse nicho é liberado para clientes do plano <strong className="text-white/80">Starter Bolsas</strong> ou
            do <strong className="text-white/80">Ecossistema Completo</strong>.
          </p>

          <div className="space-y-3">
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
              style={{
                backgroundImage: "linear-gradient(90deg, #F2FBFF 0%, #9EEBFF 40%, #00EFFF 100%)",
                color: "#0A192F",
              }}
            >
              Comprar acesso <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={() => navigate("/fornecedores")}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-white/15 bg-white/5 text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para Fornecedores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
