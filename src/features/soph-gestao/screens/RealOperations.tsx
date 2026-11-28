import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { sophRequest } from "../api/soph-api";
import type { ScreenName } from "./ErpScreen";

type Scope = { company: { id: string; name: string } };
type Page<T> = { status: number; records: T[]; next: string | null };
type Contact = { id: string; nome: string; tipo: string };
type Product = { id: string; nome: string; quantidade: number; preco: string };
type Sale = { id: string; cliente_nome: string; valor_total: string; status: string; forma_pagamento: string;
  created_at: string; total_itens: number };
type Entry = { id: string; type: "receita" | "despesa"; descricao: string; value: string; date: string;
  category: string; status: "Pago" | "Pendente" | "Recebido"; venda_id: string | null };

const formatMoney = (amount: string | number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(amount));
const inputClass = "w-full min-h-11 rounded-xl border border-white/20 bg-slate-950 px-3 py-2.5 text-white";
const labelClass = "grid gap-1 text-sm text-white";
type SaleLine = { produto_id: string; quantidade: number };
const blankLine = (): SaleLine => ({ produto_id: "", quantidade: 1 });

async function loadPages<T>(resource: "contacts" | "products" | "sales" | "finance"): Promise<T[]> {
  let after: string | null = null;
  let all: T[] = [];
  for (let page = 0; page < 10; page++) {
    const data: Page<T> = await sophRequest<Page<T>>(resource, "GET", undefined, after ? { after } : undefined);
    all = [...all, ...data.records];
    if (!data.next) return all;
    after = data.next;
  }
  throw new Error("Há mais registros do que o limite da consulta. Contate o suporte.");
}
function dateNow(): string { return new Date().toISOString().slice(0, 10); }
function OperationButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button type={onClick ? "button" : "submit"} onClick={onClick} disabled={disabled}
    className="min-h-11 rounded-xl bg-cyan-400 px-5 py-2.5 font-semibold text-slate-950 disabled:opacity-50">{children}</button>;
}

export function RealOperations({ area }: { area: Extract<ScreenName, "vendas" | "financeiro"> }) {
  const isSales = area === "vendas";
  const [company, setCompany] = useState("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<SaleLine[]>([blankLine()]);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const scope = await sophRequest<Scope>("scope");
      setCompany(scope.company.name);
      const resource = isSales ? "sales" : "finance";
      if (isSales) {
        const [s, c, p] = await Promise.all([loadPages<Sale>("sales"), loadPages<Contact>("contacts"), loadPages<Product>("products")]);
        setSales(s); setContacts(c.filter(item => item.tipo === "cliente")); setProducts(p);
      } else {
        setEntries(await loadPages<Entry>(resource));
      }
    } catch (e) {
      setCompany(""); setError(e instanceof Error ? e.message : "Não foi possível carregar os dados.");
    } finally { setLoading(false); }
  }, [isSales]);
  useEffect(() => { setCompany(""); setSales([]); setEntries([]); setCreateOpen(false); void load(); }, [load]);

  const totalSelected = useMemo(() => lines.reduce((total, line) => {
    const product = products.find(item => item.id === line.produto_id);
    return total + (product ? Number(product.preco) * line.quantidade : 0);
  }, 0), [lines, products]);

  async function saleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const values = new FormData(event.currentTarget);
    if (lines.some(line => !line.produto_id || !Number.isInteger(line.quantidade) || line.quantidade < 1)
      || new Set(lines.map(line => line.produto_id)).size !== lines.length) {
      setError("Confira os produtos, quantidades e itens repetidos."); return;
    }
    setSaving(true); setError(""); setFeedback("");
    try {
      await sophRequest("sales", "POST", {
        cliente_id: String(values.get("cliente_id") ?? ""),
        itens: lines, forma_pagamento: String(values.get("forma_pagamento") ?? "Pix"),
        status: String(values.get("status") ?? "Recebido"),
        ...(values.get("data_vencimento") ? { data_vencimento: String(values.get("data_vencimento")) } : {}),
      });
      setFeedback("Venda registrada com sucesso. Estoque e lançamento financeiro atualizados.");
      setCreateOpen(false); setLines([blankLine()]); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao registrar venda."); }
    finally { setSaving(false); }
  }
  async function financeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    setSaving(true); setError(""); setFeedback("");
    try {
      await sophRequest("finance", "POST", {
        type: String(form.get("type")),
        descricao: String(form.get("descricao") ?? "").trim(),
        value: String(form.get("value") ?? "").replace(",", "."),
        date: String(form.get("date") ?? ""),
        category: String(form.get("category") ?? "").trim(),
        status: String(form.get("status") ?? "Pendente"),
      });
      setFeedback("Lançamento salvo no banco.");
      setCreateOpen(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao salvar lançamento."); }
    finally { setSaving(false); }
  }
  async function settle(entry: Entry) {
    if (saving) return;
    setSaving(true); setError(""); setFeedback("");
    try {
      await sophRequest("finance", "PATCH", undefined, { id: entry.id });
      setFeedback("Pagamento ou recebimento confirmado."); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Não foi possível confirmar."); }
    finally { setSaving(false); }
  }
  return <section className="sg-panel space-y-5 p-5 md:p-7" aria-label={isSales ? "Vendas reais" : "Financeiro real"}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold text-white">{isSales ? "Vendas" : "Financeiro"}</h2>
        <p className="text-sm text-cyan-100">Empresa: {company || "Aguardando autorização"}</p></div>
      <OperationButton disabled={!company || loading || saving} onClick={() => { setError(""); setCreateOpen(!createOpen); }}>
        {createOpen ? "Fechar formulário" : isSales ? "Registrar venda" : "Novo lançamento"}
      </OperationButton>
    </div>
    <p className="text-sm text-slate-200">Dados reais do ERP, separados por empresa. Nenhuma operação é salva apenas no navegador.</p>
    {error && <p role="alert" className="rounded-xl border border-amber-400/50 p-4 text-amber-100">{error}</p>}
    {feedback && <p role="status" className="rounded-xl border border-cyan-400/40 p-4 text-cyan-100">{feedback}</p>}
    {loading && <p role="status" className="text-cyan-100">Consultando registros…</p>}
    {createOpen && company && (isSales ? <form onSubmit={saleSubmit} className="grid gap-4 rounded-xl border border-cyan-400/30 p-5">
      <h3 className="text-lg font-semibold text-white">Nova venda</h3>
      <label className={labelClass}>Cliente
        <select name="cliente_id" required className={inputClass} defaultValue=""><option value="">Selecione</option>
          {contacts.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select></label>
      {lines.map((line, index) => <div key={index} className="grid grid-cols-1 gap-3 rounded-xl border border-white/15 p-3 md:grid-cols-[2fr_1fr_auto]">
        <label className={labelClass}>Produto
          <select className={inputClass} required value={line.produto_id} onChange={e => setLines(prev => prev.map((x, i) => i === index ? {...x, produto_id:e.target.value} : x))}>
            <option value="">Selecione</option>{products.map(p => <option key={p.id} value={p.id}>{p.nome} · {p.quantidade} un. · {formatMoney(p.preco)}</option>)}
          </select></label>
        <label className={labelClass}>Quantidade
          <input type="number" min={1} max={10000} step={1} required value={line.quantidade}
            className={inputClass} onChange={e => setLines(prev => prev.map((x,i) => i === index ? {...x,quantidade:Number(e.target.value)}:x))} />
        </label>
        <button type="button" disabled={lines.length === 1} className="rounded-xl border border-white/25 px-4 text-white disabled:opacity-50"
          onClick={() => setLines(prev => prev.filter((_, i) => i !== index))}>Remover</button>
      </div>)}
      <button type="button" disabled={lines.length >= 8} className="justify-self-start rounded-xl border border-cyan-400/60 px-4 py-2 text-cyan-100 disabled:opacity-50"
        onClick={() => setLines(prev => [...prev, blankLine()])}>Adicionar produto</button>
      <div className="grid gap-4 md:grid-cols-3">
        <label className={labelClass}>Forma de pagamento
          <select name="forma_pagamento" className={inputClass}><option>Pix</option><option>Dinheiro</option><option>Cartão</option><option>Boleto</option></select>
        </label>
        <label className={labelClass}>Recebimento
          <select name="status" className={inputClass}><option value="Recebido">Recebido</option><option value="Pendente">Pendente</option></select>
        </label>
        <label className={labelClass}>Vencimento, se houver
          <input type="date" name="data_vencimento" className={inputClass} />
        </label>
      </div>
      <p className="font-semibold text-cyan-100">Total estimado: {formatMoney(totalSelected)}</p>
      <p className="text-sm text-slate-200">O total definitivo será calculado no servidor. Após confirmar, a venda, o estoque e a receita serão registrados juntos.</p>
      <OperationButton disabled={saving || !contacts.length || !products.length}>{saving?"Registrando…":"Confirmar venda"}</OperationButton>
    </form> : <form onSubmit={financeSubmit} className="grid gap-4 rounded-xl border border-cyan-400/30 p-5 md:grid-cols-2">
      <h3 className="text-lg font-semibold text-white md:col-span-2">Novo lançamento</h3>
      <label className={labelClass}>Natureza
        <select name="type" className={inputClass}><option value="receita">Receita</option><option value="despesa">Despesa</option></select>
      </label>
      <label className={labelClass}>Status
        <select name="status" className={inputClass}><option value="Pendente">Pendente</option><option value="Recebido">Recebido (receita)</option><option value="Pago">Pago (despesa)</option></select>
      </label>
      <label className={labelClass}>Descrição<input name="descricao" maxLength={250} required className={inputClass} /></label>
      <label className={labelClass}>Categoria<input name="category" maxLength={100} defaultValue="Geral" required className={inputClass} /></label>
      <label className={labelClass}>Valor (R$)<input name="value" placeholder="0,00" required className={inputClass} /></label>
      <label className={labelClass}>Data<input name="date" type="date" defaultValue={dateNow()} required className={inputClass}/></label>
      <div className="md:col-span-2"><OperationButton disabled={saving}>{saving?"Salvando…":"Salvar lançamento"}</OperationButton></div>
    </form>)}
    {company && !loading && (isSales
      ? <div className="space-y-3">
        <h3 className="font-semibold text-white">Vendas registradas ({sales.length})</h3>
        {sales.length === 0 && <p className="text-slate-200">Nenhuma venda cadastrada.</p>}
        {sales.map(sale => <article key={sale.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 p-4">
          <div><strong className="text-white">{sale.cliente_nome}</strong>
            <p className="text-sm text-slate-200">{new Date(sale.created_at).toLocaleDateString("pt-BR")} · {sale.forma_pagamento} · {sale.total_itens} itens · {sale.status}</p></div>
          <strong className="text-cyan-100">{formatMoney(sale.valor_total)}</strong>
        </article>)}
      </div>
      : <div className="space-y-3">
        <h3 className="font-semibold text-white">Lançamentos ({entries.length})</h3>
        {entries.length === 0 && <p className="text-slate-200">Nenhum lançamento cadastrado.</p>}
        {entries.map(entry => <article key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 p-4">
          <div><strong className="text-white">{entry.descricao}</strong>
            <p className="text-sm text-slate-200">{entry.date} · {entry.category} · {entry.status}</p></div>
          <div className="flex items-center gap-3"><strong className={entry.type==="receita"?"text-cyan-100":"text-orange-200"}>
            {entry.type==="despesa"?"− ":"+ "}{formatMoney(entry.value)}</strong>
            {entry.status==="Pendente" && !entry.venda_id && <button disabled={saving} type="button"
              className="rounded-lg border border-cyan-400/60 px-3 py-2 text-cyan-100 disabled:opacity-50"
              onClick={() => void settle(entry)}>Confirmar</button>}
          </div>
        </article>)}
      </div>)}
  </section>;
}
