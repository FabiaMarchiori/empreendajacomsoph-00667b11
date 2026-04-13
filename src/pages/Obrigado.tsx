import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import logoOficial from "@/assets/logo-oficial-cropped.png";

export default function ObrigadoPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0A192F 0%, #102A43 55%, #0A192F 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center"
      >
        {/* Logo */}
        <div className="mx-auto mb-6">
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-16 w-auto max-w-[260px] mx-auto object-contain mb-4" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-extrabold text-foreground mb-3">
          Pagamento confirmado!
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-base mb-6">
          Seu acesso ao Ecossistema está sendo liberado automaticamente.
        </p>

        {/* Info card */}
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur p-6 mb-8 text-left shadow-glow-sm">
          <p className="text-sm text-foreground/90 leading-relaxed">
            Para acessar o Ecossistema, utilize o{" "}
            <span className="font-semibold text-primary">mesmo e-mail informado na compra</span>.
            Caso ainda não tenha uma conta, crie uma com esse e-mail na tela de login.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all bg-gradient-primary-btn text-primary-foreground shadow-glow-sm"
          >
            Ir para o login
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="https://wa.me/5511983348749?text=Preciso%20de%20ajuda"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Falar com o suporte
          </a>
        </div>
      </motion.div>
    </div>
  );
}
