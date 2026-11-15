import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BolsasArtwork } from "./BolsasArtwork";
import "@/pages/bolsas/bolsas-premium.css";

interface Props {
  title: string;
  subtitle: ReactNode;
  search?: ReactNode;
  children: ReactNode;
}

// Presentation only. Each page retains its original hooks and filtering rules.
export function BolsasListingLayout({
  title,
  subtitle,
  search,
  children,
}: Props) {
  const navigate = useNavigate();
  const words = title.split(" ");
  const highlight = words.pop();
  return (
    <div className="bolsas-listing">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bolsas-listing-header"
      >
        <button
          type="button"
          className="bolsas-listing-back"
          aria-label="Voltar para Bolsas, Mochilas e Malas"
          onClick={() => navigate("/fornecedores/bolsas-mochilas-malas")}
        >
          <ArrowLeft size={23} />
        </button>
        <div className="bolsas-listing-heading">
          <h1>
            {words.length > 0 && `${words.join(" ")} `}
            <span>{highlight}</span>
          </h1>
          <p>{subtitle}</p>
        </div>
        <div className="bolsas-listing-header-art">
          <BolsasArtwork kind="header" />
        </div>
      </motion.header>
      {search && (
        <div className="bolsas-listing-search">
          <Search size={22} aria-hidden="true" />
          {search}
        </div>
      )}
      {children}
    </div>
  );
}
