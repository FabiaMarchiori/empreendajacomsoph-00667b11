import termos from "../../docs/legal/termos-de-uso.md?raw";
import privacidade from "../../docs/legal/politica-de-privacidade.md?raw";
import cookies from "../../docs/legal/politica-de-cookies.md?raw";
import cancelamento from "../../docs/legal/cancelamento-reembolso-renovacao.md?raw";
import soph from "../../docs/legal/aviso-soph-ia.md?raw";

export const legalDocuments = [
  { id: "termos", path: "/termos", label: "Termos de Uso", markdown: termos },
  {
    id: "privacidade",
    path: "/privacidade",
    label: "Privacidade e LGPD",
    markdown: privacidade,
  },
  { id: "cookies", path: "/cookies", label: "Cookies", markdown: cookies },
  {
    id: "cancelamento",
    path: "/cancelamento-reembolso",
    label: "Cancelamento e Reembolso",
    markdown: cancelamento,
  },
  {
    id: "soph",
    path: "/aviso-soph-ia",
    label: "Aviso Soph IA",
    markdown: soph,
  },
] as const;
export type LegalDocumentId = (typeof legalDocuments)[number]["id"];
