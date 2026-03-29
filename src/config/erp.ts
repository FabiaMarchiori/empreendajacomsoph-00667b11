/**
 * Configuração centralizada do ERP Soph.
 * Todas as URLs e constantes de integração ficam aqui.
 */
export const ERP_CONFIG = {
  /** URL base do ERP Soph (frontend) */
  appUrl: "https://erp-soph.lovable.app",

  /** Nome da Edge Function proxy no Ecossistema */
  proxyFunctionName: "erp-entry",
} as const;
