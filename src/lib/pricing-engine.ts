/**
 * Engine de Precificação – Ecossistema EmpreendaJá com Soph
 *
 * Fórmula central (expandida):
 *   Custo Total = custo_compra + custo_variavel + frete + embalagem + ads + outros
 *   Preço Sugerido = (CT + taxa_fixa) / (1 - (Sum_Taxas + M_Des) / 100)
 *
 * Onde:
 *   Sum_Taxas = imposto_pct + comissao_pct + taxa_cartao_pct
 *   M_Des     = margem desejada (%)
 *   taxa_fixa = custo fixo por unidade do canal
 */

// ── Tipos ──────────────────────────────────────────────

export interface PricingInput {
  /** Custo de compra do produto */
  custoCompra: number;
  /** Custos variáveis (outros custos diretos) */
  custoVariavel: number;
  /** Frete por unidade */
  frete: number;
  /** Embalagem por unidade */
  embalagem: number;
  /** Custo de ads/publicidade por unidade */
  ads: number;
  /** Outros custos variáveis */
  outrosCustos: number;
  /** Percentual de imposto do canal (%) */
  impostoPct: number;
  /** Percentual de comissão do canal (%) */
  comissaoPct: number;
  /** Percentual de taxa de cartão (%) */
  taxaCartaoPct: number;
  /** Taxa fixa por item do canal (R$) */
  taxaFixa: number;
  /** Margem de lucro desejada (%) */
  margemDesejada: number;
}

export interface PricingResult {
  /** Custo total (CT) */
  custoTotal: number;
  /** Soma das taxas em % */
  somaTaxasPct: number;
  /** Divisor usado na fórmula */
  divisor: number;
  /** Preço sugerido de venda */
  precoSugerido: number;
  /** Lucro líquido por unidade */
  lucroLiquido: number;
  /** Margem final real (%) */
  margemFinal: number;
  /** Detalhamento dos componentes */
  detalhamento: {
    custoCompra: number;
    custoVariavel: number;
    frete: number;
    embalagem: number;
    ads: number;
    outrosCustos: number;
    impostoValor: number;
    comissaoValor: number;
    taxaCartaoValor: number;
    taxaFixa: number;
    margemValor: number;
  };
  /** Indica se o cálculo é válido */
  valido: boolean;
  /** Mensagem de erro, se houver */
  erro?: string;
}

// ── Engine ─────────────────────────────────────────────

export function calcularPreco(input: PricingInput): PricingResult {
  const {
    custoCompra, custoVariavel, frete = 0, embalagem = 0, ads = 0, outrosCustos = 0,
    impostoPct, comissaoPct, taxaCartaoPct, taxaFixa = 0, margemDesejada,
  } = input;

  const custoTotal = custoCompra + custoVariavel + frete + embalagem + ads + outrosCustos;
  const somaTaxasPct = impostoPct + comissaoPct + taxaCartaoPct;
  const divisor = 1 - (somaTaxasPct + margemDesejada) / 100;

  if (divisor <= 0) {
    return {
      custoTotal, somaTaxasPct, divisor,
      precoSugerido: 0, lucroLiquido: 0, margemFinal: 0,
      detalhamento: {
        custoCompra, custoVariavel, frete, embalagem, ads, outrosCustos,
        impostoValor: 0, comissaoValor: 0, taxaCartaoValor: 0, taxaFixa, margemValor: 0,
      },
      valido: false,
      erro: "A soma das taxas e margem desejada não pode ser igual ou superior a 100%.",
    };
  }

  const precoSugerido = (custoTotal + taxaFixa) / divisor;

  const impostoValor = precoSugerido * (impostoPct / 100);
  const comissaoValor = precoSugerido * (comissaoPct / 100);
  const taxaCartaoValor = precoSugerido * (taxaCartaoPct / 100);

  const totalDeducoes = impostoValor + comissaoValor + taxaCartaoValor + taxaFixa;
  const lucroLiquido = precoSugerido - custoTotal - totalDeducoes;
  const margemFinal = precoSugerido > 0 ? (lucroLiquido / precoSugerido) * 100 : 0;

  return {
    custoTotal, somaTaxasPct, divisor,
    precoSugerido: round2(precoSugerido),
    lucroLiquido: round2(lucroLiquido),
    margemFinal: round2(margemFinal),
    detalhamento: {
      custoCompra: round2(custoCompra),
      custoVariavel: round2(custoVariavel),
      frete: round2(frete),
      embalagem: round2(embalagem),
      ads: round2(ads),
      outrosCustos: round2(outrosCustos),
      impostoValor: round2(impostoValor),
      comissaoValor: round2(comissaoValor),
      taxaCartaoValor: round2(taxaCartaoValor),
      taxaFixa: round2(taxaFixa),
      margemValor: round2(lucroLiquido),
    },
    valido: true,
  };
}

// ── Helpers ────────────────────────────────────────────

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export function calcularMarkup(preco: number, custo: number): number {
  if (custo <= 0) return 0;
  return round2(((preco - custo) / custo) * 100);
}
