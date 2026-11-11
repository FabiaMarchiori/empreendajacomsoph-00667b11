import { LegalLinks } from "@/legal/LegalLinks";
import logoOficial from "@/assets/logo-oficial-cropped.png";

export function Footer() {
  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col items-center justify-between gap-3 text-[11px] text-foreground/50">
        <div className="flex items-center gap-3">
          <img src={logoOficial} alt="EmpreendaJá com Soph" className="h-6 w-auto object-contain opacity-60 flex-shrink-0" />
          <p>© 2026 EmpreendaJá com Soph – Todos os direitos reservados</p>
        </div>
        <LegalLinks label="Documentos jurídicos no rodapé" />
      </div>
    </footer>
  );
}
