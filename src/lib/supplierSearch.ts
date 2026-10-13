const norm = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/** Busca por nome parcial da loja ou pelo código (F012, f12, 12). */
export function matchesSupplier(
  s: { nome_loja: string; codigo_fornecedor?: string | null },
  query: string,
): boolean {
  const q = norm(query);
  if (!q) return true;
  if (norm(s.nome_loja).includes(q)) return true;
  const code = s.codigo_fornecedor ? norm(s.codigo_fornecedor) : "";
  if (!code) return false;
  if (code.includes(q)) return true;
  const digits = q.replace(/^f/, "");
  return /^\d+$/.test(digits) && parseInt(digits, 10) === parseInt(code.slice(1), 10);
}
