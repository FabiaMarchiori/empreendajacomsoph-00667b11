import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-foreground/50">
        <p>© 2024 EmpreendaJá com Soph – Todos os direitos reservados</p>
        <div className="flex items-center gap-4">
          <Link to="/termos" className="hover:text-foreground/80 transition-colors">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-foreground/80 transition-colors">Privacidade</Link>
          <Link to="/cookies" className="hover:text-foreground/80 transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
