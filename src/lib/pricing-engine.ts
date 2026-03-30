/**
 * Engine de Precificação – Ecossistema EmpreendaJá com Soph
 *
 * Fórmula central:
 *   Preço Sugerido = CT / (1 - (Sum_Taxas + M_Des) / 100)
 *
 * Onde:
 *   CT        = custo_compra + custo_variavel
 *   Sum_Taxas = imposto_pct + comissao_pct + taxa_cartao_pct
 *   M_Des     = margem desejada (%)
 */

// ── Tipos ──────────────────────────────────────────────

export interface PricingInput {
  /** Custo de compra do produto */
  custoCompra: number;
  /** Custos variáveis (frete, embalagem, etc.) */
  custoVariavel: number;
  /** Percentual de imposto do canal (%) */
  impostoPct: number;
  /** Percentual de comissão do canal (%) */
  comissaoPct: number;
  /** Percentual de taxa de cartão (%) */
  taxaCartaoPct: number;
  /** Margem de lucro desejada (%) */
  margemDesejada: number;
}

export interface PricingResult {
  /** Custo total (CT) */
  custoTotal: number;
  /** Soma das taxas em % */
  somaTaxasPct: number;
  /** Divisor usado na fórmula (1 - (Sum_Taxas + M_Des) / 100) */
  divisor: number;
  /** Preço sugerido de venda */
  precoSugerido: number;
  /** Lucro líquido por unidade */
  lucroLiquido: number;
  /** Margem final real (%) */
  margemFinal: number;
  /** Detalhamento dos componentes */
  detalhamento: {
    impostoValor: number;
    comissaoValor: number;
    taxaCartaoValor: number;
    margemValor: number;
  };
  /** Indica se o cálculo é válido */
  valido: boolean;
  /** Mensagem de erro, se houver */
  erro?: string;
}

// ── Engine ─────────────────────────────────────────────

export function calcularPreco(input: PricingInput): PricingResult {
  const { custoCompra, custoVariavel, impostoPct, comissaoPct, taxaCartaoPct, margemDesejada } = input;

  const custoTotal = custoCompra + custoVariavel;
  const somaTaxasPct = impostoPct + comissaoPct + taxaCartaoPct;
  const divisor = 1 - (somaTaxasPct + margemDesejada) / 100;

  // Validação: divisor deve ser positivo (taxas + margem < 100%)
  if (divisor <= 0) {
    return {
      custoTotal,
      somaTaxasPct,
      divisor,
      precoSugerido: 0,
      lucroLiquido: 0,
      margemFinal: 0,
      detalhamento: { impostoValor: 0, comissaoValor: 0, taxaCartaoValor: 0, margemValor: 0 },
      valido: false,
      erro: "A soma das taxas e margem desejada não pode ser igual ou superior a 100%.",
    };
  }

  const precoSugerido = custoTotal / divisor;

  // Detalhamento dos componentes em valor absoluto
  const impostoValor = precoSugerido * (impostoPct / 100);
  const comissaoValor = precoSugerido * (comissaoPct / 100);
  const taxaCartaoValor = precoSugerido * (taxaCartaoPct / 100);

  const totalDeducoes = impostoValor + comissaoValor + taxaCartaoValor;
  const lucroLiquido = precoSugerido - custoTotal - totalDeducoes;
  const margemFinal = precoSugerido > 0 ? (lucroLiquido / precoSugerido) * 100 : 0;

  return {
    custoTotal,
    somaTaxasPct,
    divisor,
    precoSugerido: round2(precoSugerido),
    lucroLiquido: round2(lucroLiquido),
    margemFinal: round2(margemFinal),
    detalhamento: {
      impostoValor: round2(impostoValor),
      comissaoValor: round2(comissaoValor),
      taxaCartaoValor: round2(taxaCartaoValor),
      margemValor: round2(lucroLiquido),
    },
    valido: true,
  };
}

// ── Helpers ────────────────────────────────────────────

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * Calcula markup percentual sobre o custo
 * Markup = ((Preço - Custo) / Custo) * 100
 */
export function calcularMarkup(preco: number, custo: number): number {
  if (custo <= 0) return 0;
  return round2(((preco - custo) / custo) * 100);
}
