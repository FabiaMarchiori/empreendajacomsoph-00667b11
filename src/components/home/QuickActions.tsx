import { Heart, History, HelpCircle, RotateCcw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

/** Existing destinations shared by the desktop bar and mobile More menu. */
export function QuickActions({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const last = localStorage.getItem("empreendaja_last_page");
          navigate(
            last?.startsWith("/") && !last.startsWith("//") && last !== "/"
              ? last
              : "/fornecedores",
          );
          onNavigate?.();
        }}
      >
        <RotateCcw size={16} aria-hidden="true" />
        Último acesso
      </button>
      <Link to="/fornecedores/importadoras-25/favoritos" onClick={onNavigate}>
        <Heart size={16} aria-hidden="true" />
        Favoritos
      </Link>
      <Link to="/gestao/precificacao/simulador" onClick={onNavigate}>
        <History size={16} aria-hidden="true" />
        Histórico
      </Link>
      <a
        href="https://wa.me/5511983348749?text=Suporte%20Ecossistema"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        <HelpCircle size={16} aria-hidden="true" />
        Suporte
      </a>
    </>
  );
}
