export type ErpBenefit = "included" | "promotional" | "legacy";
export interface ProductAccess {
  erpBenefit?: ErpBenefit;
  isAdmin: boolean;
  ecosystem: boolean;
  bolsas: boolean;
  soph: boolean;
  erp: boolean;
  basic: boolean;
}
export const noProductAccess: ProductAccess = {
  isAdmin: false,
  ecosystem: false,
  bolsas: false,
  soph: false,
  erp: false,
  basic: false,
};
export function parseProductAccess(value: unknown): ProductAccess {
  if (!value || typeof value !== "object") return { ...noProductAccess };
  const permissions = Object.fromEntries(
    Object.keys(noProductAccess).map((key) => [
      key,
      (value as Record<string, unknown>)[key] === true,
    ]),
  ) as unknown as ProductAccess;
  const benefit = (value as Record<string, unknown>).erpBenefit;
  if (
    benefit === "included" ||
    benefit === "promotional" ||
    benefit === "legacy"
  )
    permissions.erpBenefit = benefit;
  return permissions;
}
export function visibleBenefitRoutes(access: ProductAccess): string[] {
  return [
    ...(access.ecosystem
      ? [
          "/fornecedores/importadoras-25",
          "/gestao/precificacao",
          "/estrutura/abrir-mei",
          "/estrutura/logo-marca",
          "/estrutura/registrar-marca",
          "/vendas/dominio-site",
          "/vendas/marketplaces",
        ]
      : []),
    ...(access.bolsas ? ["/fornecedores/bolsas-mochilas-malas"] : []),
    ...(access.soph ? ["/soph"] : []),
    ...(access.erp ? ["/erp"] : []),
  ];
}
