import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, MessageCircle, Smartphone, Copy, Check, Instagram, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import logoOficial from "@/assets/logo-oficial-cropped.png";

const LOGIN_URL = "https://appempreendajacomsoph.netlify.app/login";
const WHATSAPP_URL = "https://wa.me/5511983348749?text=Suporte%20App%20ecossistema%20Soph";
const INSTAGRAM_URL = "https://www.instagram.com/fornecedoresda25ebras";

export default function ObrigadoPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(LOGIN_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = LOGIN_URL;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
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
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-20 w-auto max-w-[300px] mx-auto object-contain mb-4" />
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary/40" style={{ boxShadow: '0 0 20px hsl(184 100% 50% / 0.2)' }}>
            <CheckCircle className="h-8 w-8 text-primary drop-shadow-[0_0_6px_hsl(184,100%,50%,0.4)]" />
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
        <div className="rounded-2xl border border-primary/20 bg-card/90 backdrop-blur p-6 mb-6 text-left" style={{ boxShadow: '0 0 16px -4px hsl(184 100% 50% / 0.08)' }}>
          <p className="text-sm text-white leading-relaxed">
            Para acessar o Ecossistema, utilize o{" "}
            <span className="font-bold text-primary drop-shadow-[0_0_4px_hsl(184,100%,50%,0.3)]">mesmo e-mail informado na compra</span>.
            Caso ainda não tenha uma conta, crie uma com esse e-mail na tela de login.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 mb-10">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all bg-gradient-primary-btn text-primary-foreground shadow-glow-sm"
          >
            Ir para o login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Bloco 1: Instalar o App ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-primary/15 bg-card/70 backdrop-blur p-5 mb-4 text-left" style={{ boxShadow: '0 0 14px -4px hsl(184 100% 50% / 0.06)' }}
        >
          <div className="flex items-center gap-2.5 mb-2.5">
            <Smartphone className="h-6 w-6 text-primary drop-shadow-[0_0_5px_hsl(184,100%,50%,0.35)]" />
            <h2 className="text-sm font-extrabold text-white tracking-tight">Acesse com mais facilidade</h2>
          </div>
          <p className="text-xs text-white/80 leading-relaxed mb-3">
            Adicione o Ecossistema à tela inicial do seu celular para entrar mais rápido sempre que precisar.
          </p>
          <div className="space-y-1.5 text-xs text-white/70">
            <p>
              <span className="font-bold text-white">Android:</span>{" "}
              menu do navegador → <span className="text-primary font-semibold">Instalar app</span>
            </p>
            <p>
              <span className="font-bold text-white">iPhone:</span>{" "}
              Compartilhar → <span className="text-primary font-semibold">Adicionar à Tela de Início</span>
            </p>
          </div>
        </motion.div>

        {/* ── Bloco 2: Salvar link de acesso ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-2xl border border-primary/15 bg-card/70 backdrop-blur p-5 mb-4 text-left" style={{ boxShadow: '0 0 14px -4px hsl(184 100% 50% / 0.06)' }}
        >
          <div className="flex items-center gap-2.5 mb-2.5">
            <ExternalLink className="h-6 w-6 text-primary drop-shadow-[0_0_5px_hsl(184,100%,50%,0.35)]" />
            <h2 className="text-sm font-extrabold text-white tracking-tight">Salve seu acesso</h2>
          </div>
          <p className="text-xs text-white/80 leading-relaxed mb-3">
            Copie e guarde seu link de entrada para acessar o Ecossistema quando quiser.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-background/60 border border-border/40 px-3 py-2 text-xs text-white/90 truncate select-all">
              {LOGIN_URL}
            </div>
            <button
              onClick={handleCopy}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-all border border-primary/50 text-primary bg-primary/10 hover:bg-primary/20 hover:border-primary/70 hover:shadow-[0_0_12px_-3px_hsl(184,100%,50%,0.25)]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* ── Bloco 3: Suporte ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl border border-primary/15 bg-card/70 backdrop-blur p-5 text-left" style={{ boxShadow: '0 0 14px -4px hsl(184 100% 50% / 0.06)' }}
        >
          <div className="flex items-center gap-2.5 mb-2.5">
            <MessageCircle className="h-6 w-6 text-primary drop-shadow-[0_0_5px_hsl(184,100%,50%,0.35)]" />
            <h2 className="text-sm font-extrabold text-white tracking-tight">Precisa de ajuda para acessar?</h2>
          </div>
          <p className="text-xs text-white/80 leading-relaxed mb-3">
            Fale com nosso suporte pelo WhatsApp ou nos encontre no Instagram.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-bold border border-primary/40 bg-primary/10 text-white hover:bg-primary/20 hover:border-primary/60 hover:shadow-[0_0_14px_-3px_hsl(184,100%,50%,0.25)] transition-all"
            >
              <MessageCircle className="h-4 w-4 text-primary" />
              WhatsApp
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-bold border border-border/60 bg-card/80 text-white hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_0_12px_-3px_hsl(184,100%,50%,0.15)] transition-all"
            >
              <Instagram className="h-4 w-4 text-primary" />
              Instagram
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
