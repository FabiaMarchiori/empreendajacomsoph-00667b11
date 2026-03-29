/**
 * Configuração centralizada do ERP Soph.
 *
 * - appUrl        → URL do app visual (redirecionamento do usuário)
 * - proxyFunctionName → Edge Function proxy no Ecossistema (chamada backend)
 *
 * A URL do backend/Supabase do ERP (ERP_SOPH_URL) é usada
 * exclusivamente dentro da Edge Function e nunca exposta ao client.
 */
export const ERP_CONFIG = {
  /** URL do app visual do ERP — usada para redirecionar o usuário */
  appUrl: "https://gestaosoph.netlify.app",

  /** Nome da Edge Function proxy no Ecossistema */
  proxyFunctionName: "erp-entry",
} as const;
