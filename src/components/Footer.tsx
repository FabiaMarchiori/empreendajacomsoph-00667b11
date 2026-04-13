import { Link } from "react-router-dom";
import logoOficial from "@/assets/logo-oficial.png";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-foreground/50">
        <div className="flex items-center gap-3">
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-6 w-auto object-contain opacity-60 flex-shrink-0" />
          <p>© 2024 EmpreendaJá com Soph – Todos os direitos reservados</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/termos" className="hover:text-foreground/80 transition-colors">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-foreground/80 transition-colors">Privacidade</Link>
          <Link to="/cookies" className="hover:text-foreground/80 transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
