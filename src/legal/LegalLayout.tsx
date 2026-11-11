import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "@/assets/logo-oficial-cropped.png";
import { LegalLinks } from "./LegalLinks";

export function LegalLayout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="legal-layout">
      <a href="#documento-juridico" className="legal-skip">
        Pular para o documento
      </a>
      <header className="legal-header">
        <div className="legal-header-row">
          <Link to="/login" aria-label="EmpreendaJá com Soph — ir para o login">
            <img
              src={logo}
              alt="EmpreendaJá com Soph"
              width="220"
              height="60"
            />
          </Link>
          <div className="legal-return">
            <Link to="/login">Voltar ao login</Link>
            <Link to="/">Ir para o aplicativo</Link>
          </div>
        </div>
        <p className="legal-eyebrow">Transparência e seus direitos</p>
        <p className="legal-intro">
          Conheça as condições de uso, os cuidados com seus dados e os canais de
          atendimento.
        </p>
        <LegalLinks />
      </header>
      <main
        id="documento-juridico"
        ref={main}
        tabIndex={-1}
        className="legal-main"
      >
        <Outlet />
      </main>
      <footer className="legal-contact" aria-label="Atendimento e privacidade">
        <h2>Atendimento e privacidade</h2>
        <a href="mailto:acesso@empreendajacomsoph.com.br">
          acesso@empreendajacomsoph.com.br
        </a>
        <div>
          <a
            href="https://wa.me/5511983348749"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp (11) 98334-8749
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
          <span aria-hidden="true"> · </span>
          <a href="tel:+5511983348749">Ligar</a>
        </div>
        <Link to="/login">Voltar ao login</Link>
      </footer>
    </div>
  );
}
