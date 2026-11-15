import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Phone,
  Instagram,
  MapPin,
  Loader2,
  ChevronRight,
  ImageOff,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSupabaseSupplierById } from "@/hooks/useSupabaseSuppliers";
import { useSupabaseFavorites } from "@/hooks/useSupabaseFavorites";
import { cn } from "@/lib/utils";
import "./importadoras-fornecedor.css";

export default function ImportadorasFornecedor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggle, isFavorite } = useSupabaseFavorites();
  const { data: supplier, isLoading, error } = useSupabaseSupplierById(id);

  if (isLoading) {
    return (
      <div className="supplier-profile-state" role="status">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
        <span>Carregando fornecedor...</span>
      </div>
    );
  }

  if (!supplier || error) {
    return (
      <div
        className="supplier-profile-state supplier-profile-state--missing"
        role="alert"
      >
        <p>Importadora não encontrada.</p>
        <button type="button" onClick={() => navigate(-1)}>
          Voltar
        </button>
      </div>
    );
  }

  const name = supplier.nome_loja || "Sem nome";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const fav = isFavorite(supplier.id);
  const numId = supplier.id;

  const instagramHandle = supplier.Instagram_url
    ? supplier.Instagram_url.replace(
        /https?:\/\/(www\.)?instagram\.com\//i,
        "",
      ).replace(/\/$/, "")
    : null;

  return (
    <div className="supplier-profile">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="supplier-profile-back-row"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="supplier-profile-back"
          aria-label="Voltar"
        >
          <ArrowLeft size={23} />
        </button>
      </motion.div>

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="supplier-profile-identity"
      >
        {/* Preserve the existing logo frame, image and favorite presentation. */}
        <div className="relative">
          <div className="h-36 w-36 rounded-full border-[3px] border-primary/40 bg-card flex items-center justify-center overflow-hidden shadow-glow">
            {supplier.logo_url ? (
              <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={supplier.logo_url}
                  alt={name}
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
            ) : (
              <span className="text-4xl font-bold text-primary">
                {initials}
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label={
              fav ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
            aria-pressed={fav}
            onClick={() => toggle(numId)}
            className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-card border-2 border-border/60 flex items-center justify-center hover:border-primary/40 transition-colors"
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                fav ? "fill-[#00EFFF] text-[#00EFFF]" : "text-white/40",
              )}
            />
          </button>
        </div>

        <div className="supplier-profile-heading">
          <h1>{name}</h1>
          <p>{supplier.categoria}</p>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="supplier-profile-contacts"
        aria-label="Contatos do fornecedor"
      >
        {supplier.Whatsapp && (
          <a
            href={`https://wa.me/${supplier.Whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="supplier-profile-contact supplier-profile-contact--whatsapp"
            aria-label={`WhatsApp de ${name}`}
          >
            <Phone
              className="supplier-profile-contact-icon"
              aria-hidden="true"
            />
            <span className="supplier-profile-contact-copy">
              <span className="supplier-profile-contact-title">WhatsApp</span>
              <span className="supplier-profile-contact-detail">
                {supplier.Whatsapp}
              </span>
              <span className="supplier-profile-contact-action">
                Abrir conversa
              </span>
            </span>
            <span className="supplier-profile-contact-arrow" aria-hidden="true">
              <ChevronRight size={22} />
            </span>
          </a>
        )}
        {instagramHandle && (
          <a
            href={supplier.Instagram_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="supplier-profile-contact supplier-profile-contact--instagram"
            aria-label={`Instagram de ${name}`}
          >
            <Instagram
              className="supplier-profile-contact-icon"
              aria-hidden="true"
            />
            <span className="supplier-profile-contact-copy">
              <span className="supplier-profile-contact-title">
                @{instagramHandle}
              </span>
              <span className="supplier-profile-contact-action">
                Ver página
              </span>
            </span>
            <span className="supplier-profile-contact-arrow" aria-hidden="true">
              <ChevronRight size={22} />
            </span>
          </a>
        )}
        {supplier.Endereco && (
          <a
            href={`https://maps.google.com/maps?q=${encodeURIComponent(supplier.Endereco)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="supplier-profile-contact supplier-profile-contact--map"
            aria-label={`Mapa de ${name}`}
          >
            <MapPin
              className="supplier-profile-contact-icon"
              aria-hidden="true"
            />
            <span className="supplier-profile-contact-copy">
              <span className="supplier-profile-contact-title">
                {supplier.Endereco}
              </span>
              <span className="supplier-profile-contact-action">
                Abrir mapa
              </span>
            </span>
            <span className="supplier-profile-contact-arrow" aria-hidden="true">
              <ChevronRight size={22} />
            </span>
          </a>
        )}
      </motion.div>

      {supplier.mockup_url ? (
        <motion.figure
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="supplier-profile-media"
        >
          {/* Display the complete individual file; it may already contain a phone. */}
          <img
            src={supplier.mockup_url}
            alt={`Imagem de ${name}`}
            loading="lazy"
          />
        </motion.figure>
      ) : (
        <div className="supplier-profile-media-empty">
          <ImageOff size={28} aria-hidden="true" />
          <p>Imagem do fornecedor indisponível.</p>
        </div>
      )}
    </div>
  );
}
