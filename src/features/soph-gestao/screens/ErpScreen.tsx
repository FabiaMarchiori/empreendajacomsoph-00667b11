import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown, ArrowUp, ArrowRight, Boxes, CalendarDays, ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight,
  CreditCard, Database, Eye, Filter, List, Mail, Package, PackageMinus, Pencil, Phone, PieChart, Plus, ReceiptText,
  Search, ShoppingCart, SlidersHorizontal, Tag, Trash2, TriangleAlert, UsersRound, Wallet, Zap, type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, contacts, products, sales, movements, due } from "./fixtures";
import "./screens.css";

export const screenConfig = {
  vendas: { title: "Vendas", subtitle: "Registre suas vendas e acompanhe seus resultados.", icon: ShoppingCart },
  "produtos-estoque": { title: "Produtos e Estoque", subtitle: "Cadastre, organize e acompanhe seu estoque em tempo real.", icon: Package },
  financeiro: { title: "Financeiro", subtitle: "Controle seu fluxo de caixa, contas, despesas e resultados.", icon: Wallet },
  contatos: { title: "Contatos", subtitle: "Gerencie seus clientes e fornecedores em um só lugar.", icon: UsersRound },
};

export type ScreenName = keyof typeof screenConfig;
type Metric = [label: string, value: string, icon: LucideIcon, color: string, change?: string];
type Action = [label: string, icon: LucideIcon, color: string, run: () => void];
type Detail = { title: string; content?: ReactNode; submit?: (data: FormData) => void; fields?: string[]; values?: Record<string, string> };
type Open = (detail: Detail) => void;

function Metrics({ items }: { items: Metric[] }) {
  return <section className={`sg-metrics${items.length === 2 ? " sg-two-metrics" : ""}`} aria-label="Indicadores do período">
    {items.map(([label, value, Icon, color, change]) => <article className={`sg-metric sg-${color}`} key={label}>
      <Icon className="sg-metric-icon" aria-hidden="true" /><div><h2>{label}</h2><strong>{value}</strong>
        {change && <p><b>{change}</b> vs. mês anterior</p>}
      </div>
    </article>)}
  </section>;
}

function QuickActions({ items }: { items: Action[] }) {
  return <section className="sg-actions sg-screen-actions sg-panel" aria-label="Ações rápidas">
    <h2><Zap /> Ações rápidas:</h2>
    {items.map(([label, Icon, color, run]) =>
      <button className={`sg-action sg-${color}`} key={label} onClick={run}><Icon /><span>{label}</span><ChevronRight /></button>)}
  </section>;
}

function SelectFilter({ label, value, onChange, options, icon: Icon = Filter }: {
  label: string; value: string; onChange: (value: string) => void; options: string[]; icon?: LucideIcon;
}) {
  return <label className="sg-filter"><Icon aria-hidden="true" />
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  </label>;
}

function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="sg-filter sg-search"><Search aria-hidden="true" />
    <input type="search" aria-label="Buscar" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>;
}

function Badge({ label, color }: { label: string; color?: string }) {
  const tone = color ?? (/^(Ativo|Conclu|Pago|Em estoque)/.test(label) ? "green"
    : /andamento|negociação|Pendente|baixo|amanhã/.test(label) ? "gold"
      : /Aguardando|Sem estoque/.test(label) ? "coral" : "blue");
  return <span className={`sg-badge sg-${tone}`}>{label}</span>;
}

function Avatar({ name }: { name: string }) {
  const colors = ["cyan", "purple", "coral", "blue"];
  const initials = name.split(" ").slice(0, 2).map((part) => part[0]).join("");
  return <span className={`sg-avatar sg-${colors[name.length % colors.length]}`} aria-hidden="true">{initials}</span>;
}

function RowActions({ name, view, edit, remove }: { name: string; view: () => void; edit?: () => void; remove?: () => void }) {
  return <div className="sg-row-actions">
    <button aria-label={`Ver ${name}`} onClick={view}><Eye /></button>
    {edit && <button aria-label={`Editar ${name}`} onClick={edit}><Pencil /></button>}
    {remove && <button aria-label={`Excluir ${name}`} className="sg-remove" onClick={remove}><Trash2 /></button>}
  </div>;
}

type Row = { id: string; cells: ReactNode[]; mobile: ReactNode };
function Records({ name, headers, rows }: { name: string; headers: string[]; rows: Row[] }) {
  const [page, setPage] = useState(0);
  const last = Math.max(0, Math.ceil(rows.length / 5) - 1);
  const active = Math.min(page, last);
  const first = active * 5;
  const visible = rows.slice(first, first + 5);
  return <section className="sg-panel sg-records" aria-label={name}>
    <h2 className="sg-mobile-list-heading">{name} ({rows.length})</h2>
    {visible.length === 0 ? <p className="sg-empty">Nenhum registro encontrado.</p> : <>
      <table><thead><tr>{headers.map((header) => <th key={header} scope="col">{header}</th>)}</tr></thead>
        <tbody>{visible.map(({ id, cells }) => <tr key={id}>{cells.map((cell, i) => <td key={headers[i]}>{cell}</td>)}</tr>)}</tbody>
      </table>
      <ul className="sg-mobile-rows">{visible.map(({ id, mobile }) => <li key={id}>{mobile}</li>)}</ul>
      <footer className="sg-list-footer"><span>Mostrando {first + 1} a {first + visible.length} de {rows.length} registros</span>
        {last > 0 && <div className="sg-pages" aria-label="Paginação">
          <button onClick={() => setPage(active - 1)} disabled={active === 0} aria-label="Página anterior"><ChevronLeft /></button>
          {Array.from({ length: last + 1 }, (_, index) => <button key={index} aria-current={active === index ? "page" : undefined} onClick={() => setPage(index)}>{index + 1}</button>)}
          <button onClick={() => setPage(active + 1)} disabled={active === last} aria-label="Próxima página"><ChevronRight /></button>
        </div>}
      </footer>
    </>}
  </section>;
}

const matching = (query: string, ...values: string[]) => {
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return normalize(values.join(" ")).includes(normalize(query.trim()));
};
const field = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const displayValue = (value: number, empty: boolean) => brl.format(empty ? 0 : value);
const previewDetail = (title: string, ...lines: string[]): Detail => ({ title, content: <ul className="sg-detail-list">{lines.map((line) => <li key={line}>{line}</li>)}</ul> });

function Contacts({ open }: { open: Open }) {
  const [kind, setKind] = useState("Cliente");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");
  const [sort, setSort] = useState("Mais recentes");
  const [items, setItems] = useState(contacts);
  const filtered = items.filter((c) => c.kind === kind && (status === "Todos os status" || c.status === status)
    && matching(query, c.name, c.phone, c.email, c.document));
  if (sort === "Nome A–Z") filtered.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  function form(contact?: typeof contacts[number], index?: number) {
    open({
      title: contact ? `Editar ${contact.name}` : "Novo contato",
      fields: ["Nome", "Telefone", "E-mail", "CPF/CNPJ"],
      values: contact && { Nome: contact.name, Telefone: contact.phone, "E-mail": contact.email, "CPF/CNPJ": contact.document },
      submit(data) {
        const item = { name: field(data, "Nome"), phone: field(data, "Telefone"), email: field(data, "E-mail"), document: field(data, "CPF/CNPJ"), kind, status: contact?.status ?? "Ativo" };
        setItems((prev) => index === undefined ? [item, ...prev] : prev.map((c, i) => i === index ? item : c));
        setQuery("");
      },
    });
  }

  const rows = filtered.map((c) => {
    const identity = <span className="sg-person"><Avatar name={c.name} /><b>{c.name}</b></span>;
    const info = <span className="sg-contact-info"><span><Phone />{c.phone}</span><span><Mail />{c.email}</span></span>;
    const actions = <RowActions name={c.name} view={() => open(previewDetail(c.name, c.phone, c.email, c.document, c.status))} edit={() => form(c, items.indexOf(c))} />;
    return { id: String(items.indexOf(c)), cells: [identity, info, <Badge label={c.kind} color="cyan" />, <Badge label={c.status} />, actions],
      mobile: <div className="sg-mobile-contact"><Avatar name={c.name} /><div><b>{c.name}</b>{info}</div><div><Badge label={c.kind} color={c.kind === "Cliente" ? "green" : "purple"} />{actions}</div></div> };
  });

  return <div className="sg-contacts">
    <Metrics items={[["Clientes", "248", UsersRound, "cyan", "▲ +12%"], ["Fornecedores", "58", Wallet, "purple", "▲ +8%"]]} />
    <div className="sg-contact-tabrow">
      <div className="sg-panel sg-contact-tabs" aria-label="Tipo de contato">
        <button aria-pressed={kind === "Cliente"} onClick={() => setKind("Cliente")}><UsersRound />Clientes ({items.filter((c) => c.kind === "Cliente").length})</button>
        <button aria-pressed={kind === "Fornecedor"} onClick={() => setKind("Fornecedor")}><Wallet />Fornecedores ({items.filter((c) => c.kind === "Fornecedor").length})</button>
      </div>
      <button className="sg-action sg-bright sg-cyan" onClick={() => form()}><Plus />Novo contato</button>
    </div>
    <div className="sg-filters">
      <SearchField value={query} onChange={setQuery} placeholder="Buscar por nome, telefone, e-mail ou CPF/CNPJ..." />
      <SelectFilter label="Status" value={status} onChange={setStatus} options={["Todos os status", "Ativo", "Em negociação"]} />
      <SelectFilter label="Ordenar contatos" value={sort} onChange={setSort} options={["Mais recentes", "Nome A–Z"]} icon={SlidersHorizontal} />
    </div>
    <Records key={kind + query + status + sort} name={kind === "Cliente" ? "Clientes" : "Fornecedores"} headers={["Nome", "Contato", "Tipo", "Status", "Ações"]} rows={rows} />
  </div>;
}

function Sales({ empty, onPeriodChange, open }: { empty: boolean; onPeriodChange: (empty: boolean) => void; open: Open }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");
  const [sort, setSort] = useState("Mais recentes");
  const [items, setItems] = useState(sales);
  const visible = empty ? [] : items.filter((s) => (status === "Todos os status" || s.status === status) && matching(query, s.id, s.customer, s.product));
  if (sort === "Mais antigas") visible.reverse();
  function form(sale?: typeof sales[number]) {
    open({
      title: sale ? `Editar ${sale.id}` : "Nova venda", fields: ["Cliente", "Produto", "Valor"],
      values: sale && { Cliente: sale.customer, Produto: sale.product, Valor: String(sale.value) },
      submit(data) {
        const next = { id: sale?.id ?? `V-${crypto.randomUUID().slice(0, 6).toUpperCase()}`, date: sale?.date ?? "27/11/2026", customer: field(data, "Cliente"),
          product: field(data, "Produto"), value: Number(field(data, "Valor").replace(",", ".")) || 0, items: sale?.items ?? 1, payment: sale?.payment ?? "PIX", status: sale?.status ?? "Em andamento" };
        setItems((prev) => sale ? prev.map((s) => s.id === sale.id ? next : s) : [next, ...prev]);
        onPeriodChange(false); setQuery(""); setStatus("Todos os status");
      },
    });
  }
  return <>
    <Metrics items={[
      ["Total de Vendas", empty ? "0" : "128", ShoppingCart, "cyan"],
      ["Faturamento", displayValue(62450, empty), Database, "green", empty ? undefined : "▲ +18,6%"],
      ["Ticket Médio", displayValue(488.67, empty), Tag, "purple"],
      ["Produtos Vendidos", empty ? "0" : "384", ChartNoAxesColumnIncreasing, "coral"],
    ]} />
    <QuickActions items={[
      ["Nova venda", Plus, "cyan sg-bright", () => form()],
      ["Vendas do período", CalendarDays, "blue", () => document.getElementById("sg-sales-filters")?.scrollIntoView({ block: "start" })],
      ["Relatórios", ChartNoAxesColumnIncreasing, "purple", () => open(previewDetail("Relatórios de vendas", `${visible.length} vendas no filtro atual`, brl.format(visible.reduce((total, s) => total + s.value, 0))))],
      ["Clientes", UsersRound, "outline", () => open(previewDetail("Clientes", ...Array.from(new Set(items.map((sale) => sale.customer)))))],
    ]} />
    <div id="sg-sales-filters" className="sg-filters">
      <SearchField value={query} onChange={setQuery} placeholder="Buscar por nº, cliente ou produto..." />
      <SelectFilter label="Período do histórico" value={empty ? "Mês anterior" : "Este mês"} onChange={(value) => onPeriodChange(value === "Mês anterior")} options={["Este mês", "Mês anterior"]} icon={CalendarDays} />
      <SelectFilter label="Status" value={status} onChange={setStatus} options={["Todos os status", "Concluída", "Em andamento", "Aguardando pgto"]} />
    </div>
    <div className="sg-sortline"><SelectFilter label="Ordenar vendas" value={sort} onChange={setSort} options={["Mais recentes", "Mais antigas"]} icon={SlidersHorizontal} /></div>
    <Records key={query + status + sort + empty} name="Vendas" headers={["Nº Venda", "Data", "Cliente", "Itens", "Valor", "Pagamento", "Status", "Ações"]} rows={visible.map((s) => {
      const view = () => open(previewDetail(s.id, s.customer, s.product, s.date, brl.format(s.value), s.status));
      return { id: s.id, cells: [<span className="sg-person"><ShoppingCart /><b>{s.id}</b></span>, s.date, <span className="sg-person"><Avatar name={s.customer} /><b>{s.customer}</b></span>, s.items, <b>{brl.format(s.value)}</b>, <Badge label={s.payment} color={s.payment === "PIX" ? "cyan" : s.payment === "Cartão" ? "purple" : "blue"} />, <Badge label={s.status} />, <RowActions name={s.id} view={view} edit={() => form(s)} />],
        mobile: <button className="sg-mobile-record" onClick={view}><ShoppingCart /><span><b>{s.id}</b><small>{s.date} · {s.customer}</small></span><span><b>{brl.format(s.value)}</b><Badge label={s.status} /></span><ChevronRight /></button> };
    })} />
  </>;
}

function Inventory({ open }: { open: Open }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas as categorias");
  const [status, setStatus] = useState("Todos os status");
  const [items, setItems] = useState(products);
  const [purchases, setPurchases] = useState(["26/11/2026 · Compra de produtos · R$ 1.250,00"]);
  const groups = Array.from(new Set(items.map((product) => product.group)));
  function form(product?: typeof products[number]) {
    open({
      title: product ? `Editar ${product.name}` : "Novo produto", fields: ["Produto", "SKU", "Categoria", "Quantidade", "Valor"],
      values: product && { Produto: product.name, SKU: product.sku, Categoria: product.group, Quantidade: String(product.qty), Valor: String(product.price) },
      submit(data) {
        const qty = Math.max(0, parseInt(field(data, "Quantidade"), 10) || 0);
        const next = { name: field(data, "Produto"), sku: product?.sku ?? field(data, "SKU"), group: field(data, "Categoria"), qty,
          price: Number(field(data, "Valor").replace(",", ".")) || 0, image: product?.image ?? items[0]?.image,
          status: qty === 0 ? "Sem estoque" : qty < 10 ? "Estoque baixo" : "Em estoque" };
        setItems((prev) => [next, ...prev.filter((item) => item.sku !== next.sku)]);
        setQuery(""); setCategory("Todas as categorias"); setStatus("Todos os status");
      },
    });
  }
  const visible = items.filter((p) => (category === "Todas as categorias" || p.group === category) && (status === "Todos os status" || p.status === status) && matching(query, p.name, p.sku, p.group));
  return <>
    <Metrics items={[["Total de Produtos", "384", Package, "cyan"], ["Em Estoque", "328", Boxes, "green"], ["Estoque Baixo", "18", TriangleAlert, "gold"], ["Sem Estoque", "6", PackageMinus, "coral"]]} />
    <QuickActions items={[
      ["Novo produto", Plus, "cyan sg-bright", () => form()],
      ["Registrar compra", ShoppingCart, "blue", () => open({ title: "Registrar compra", fields: ["Fornecedor", "Produto", "Quantidade", "Valor"], submit: (data) => setPurchases((prev) => [`${field(data, "Fornecedor")} · ${field(data, "Produto")} · ${field(data, "Quantidade")} un. · R$ ${field(data, "Valor")}`, ...prev]) })],
      ["Ajustar estoque", SlidersHorizontal, "purple", () => open({ title: "Ajustar estoque", fields: ["SKU", "Quantidade"], content: <p>Use um SKU da lista de produtos.</p>, submit: (data) => {
        const qty = Math.max(0, parseInt(field(data, "Quantidade"), 10) || 0);
        setItems((prev) => prev.map((p) => p.sku === field(data, "SKU").toUpperCase()
          ? { ...p, qty, status: qty === 0 ? "Sem estoque" : qty < 10 ? "Estoque baixo" : "Em estoque" } : p));
      } })],
      ["Categorias", Tag, "outline", () => open(previewDetail("Categorias", ...groups))],
    ]} />
    <div className="sg-filters">
      <SearchField value={query} onChange={setQuery} placeholder="Buscar por nome, SKU ou categoria..." />
      <SelectFilter label="Categoria" value={category} onChange={setCategory} options={["Todas as categorias", ...groups]} icon={Tag} />
      <SelectFilter label="Status" value={status} onChange={setStatus} options={["Todos os status", "Em estoque", "Estoque baixo", "Sem estoque"]} />
    </div>
    <Records key={query + category + status} name="Produtos" headers={["Produto", "SKU", "Categoria", "Estoque", "Situação", "Valor de venda", "Ações"]} rows={visible.map((p) => {
      const view = () => open(previewDetail(p.name, p.sku, p.group, `${p.qty} un.`, brl.format(p.price)));
      const image = <span className="sg-product-icon">{p.image && <img src={p.image} alt="" />}</span>;
      const quantity = <Badge label={`${p.qty} un.`} color={p.qty === 0 ? "coral" : p.qty < 10 ? "gold" : "cyan"} />;
      return { id: p.sku, cells: [<span className="sg-person">{image}<b>{p.name}</b></span>, p.sku, <Badge label={p.group} color={p.group === "Beleza e Cosméticos" ? "purple" : "cyan"} />, quantity, <Badge label={p.status} />, <b>{brl.format(p.price)}</b>, <RowActions name={p.name} view={view} edit={() => form(p)} remove={() => open({ title: `Excluir ${p.name}`, content: <p>O produto será removido apenas desta sessão de teste.</p>, submit: () => setItems((prev) => prev.filter((item) => item.sku !== p.sku)) })} />],
        mobile: <button className="sg-mobile-record" onClick={view}>{image}<span><b>{p.name}</b><small>SKU: {p.sku}</small></span><span>{quantity}<b>{brl.format(p.price)}</b></span><ChevronRight /></button> };
    })} />
    <button className="sg-text-button" onClick={() => open(previewDetail("Histórico de compras", ...purchases))}>Ver histórico de compras <ArrowRight /></button>
  </>;
}

const expenseMix = [
  ["Fornecedores", 42, "#009df8"], ["Aluguel", 18, "#02dc92"], ["Marketing", 12, "#ffcd34"],
  ["Transporte", 10, "#ff6388"], ["Outras", 18, "#b45bf4"],
] as const;
const expenseGradient = expenseMix.map(([, share, color], i) => {
  const start = expenseMix.slice(0, i).reduce((sum, [, value]) => sum + value, 0);
  return `${color} ${start}% ${start + share}%`;
}).join(", ");
const financeMonths = [
  ["Jun", 42500, 23900], ["Jul", 52500, 34000], ["Ago", 54500, 31700],
  ["Set", 44800, 29500], ["Out", 52500, 30800], ["Nov", 62450, 38760],
] as const;

function Finance({ empty, open }: { empty: boolean; open: Open }) {
  const [entries, setEntries] = useState(movements);
  function entryForm(income: boolean) {
    open({ title: income ? "Nova receita" : "Nova despesa", fields: ["Descrição", "Categoria", "Valor"], submit: (data) => {
      const value = Math.abs(Number(field(data, "Valor").replace(",", ".")) || 0);
      setEntries((prev) => [{ date: "27/11/2026", name: field(data, "Descrição"), category: field(data, "Categoria"), value: income ? value : -value, status: "Pendente" }, ...prev]);
    } });
  }
  return <>
    <Metrics items={[
      ["Contas a Receber", displayValue(28450, empty), Database, "green", empty ? undefined : "▲ +14,8%"],
      ["Contas a Pagar", displayValue(12680, empty), CreditCard, "coral", empty ? undefined : "▲ +6,2%"],
      ["Saldo em Caixa", displayValue(57320, empty), Wallet, "blue", empty ? undefined : "▲ +9,7%"],
      ["Despesas do Mês", displayValue(8940, empty), ChartNoAxesColumnIncreasing, "purple", empty ? undefined : "▼ -12,3%"],
    ]} />
    <QuickActions items={[
      ["Nova receita", Plus, "cyan sg-bright", () => entryForm(true)],
      ["Nova despesa", Plus, "coral sg-bright", () => entryForm(false)],
      ["Contas a receber", List, "blue", () => open(previewDetail("Contas a receber", empty ? "Nenhuma conta no período." : "Recebimento – Cliente · R$ 3.200,00 · 02/12/2026"))],
      ["Contas a pagar", List, "purple", () => open(previewDetail("Contas a pagar", ...(empty ? ["Nenhuma conta no período."] : due.map((item) => `${item.date} · ${item.name} · ${brl.format(item.value)}`))))],
    ]} />
    <div className="sg-finance-charts">
      <section className="sg-panel sg-finance-panel">
        <h2><ChartNoAxesColumnIncreasing /> Receitas x Despesas</h2>
        {empty ? <p className="sg-empty">Nenhuma movimentação registrada no período.</p> : <>
          <figure className="sg-bars sg-finance-bars" aria-label="Receitas e despesas de junho a novembro">
            <div className="sg-axis" aria-hidden="true">{[70, 60, 50, 40, 30, 20, 10, 0].map((n) => <span key={n}>{n ? `${n}K` : "0"}</span>)}</div>
            <div className="sg-plot">{financeMonths.map(([name, income, expense]) => <div key={name} className="sg-month" role="group" aria-label={`${name}: receitas ${brl.format(income)}, despesas ${brl.format(expense)}`}>
              <i style={{ height: `${income / 700}%` }} /><i style={{ height: `${expense / 700}%` }} /><span>{name}</span>
            </div>)}</div>
          </figure>
          <div className="sg-finance-key"><span><i />Receitas <b>{brl.format(62450)}</b></span><span><i />Despesas <b>{brl.format(38760)}</b></span></div>
        </>}
      </section>
      <section className="sg-panel sg-finance-panel">
        <h2><PieChart /> Composição das Despesas</h2>
        {empty ? <p className="sg-empty">Nenhuma despesa registrada no período.</p> : <div className="sg-category-body">
          <div className="sg-donut" style={{ "--category-gradient": expenseGradient } as CSSProperties}><div><strong>R$ 8.940,00</strong><span>Total</span></div></div>
          <ul>{expenseMix.map(([label, share, color]) => <li key={label}><i style={{ backgroundColor: color }} /><span>{label}</span><b>{share}%</b></li>)}</ul>
        </div>}
      </section>
    </div>
    <div className="sg-finance-lists">
      <section className="sg-panel sg-finance-panel">
        <h2><ReceiptText /> Lançamentos Recentes</h2>
        <Records name="Lançamentos" headers={["Data", "Descrição", "Categoria", "Valor", "Status"]} rows={(empty ? [] : entries).map((e, i) => ({
          id: String(i), cells: [e.date, e.name, <Badge label={e.category} color={e.value < 0 ? "purple" : "cyan"} />, <b>{brl.format(e.value)}</b>, <Badge label={e.status} />],
          mobile: <div className="sg-mobile-record sg-finance-record">{e.value < 0 ? <ArrowDown /> : <ArrowUp />}<span><b>{e.name}</b><small>{e.date}</small></span><span><b>{brl.format(e.value)}</b><Badge label={e.status} /></span></div>,
        }))} />
        <button className="sg-text-button" onClick={() => open(previewDetail("Todos os lançamentos", ...(empty ? ["Nenhum lançamento no período."] : entries.map((e) => `${e.date} · ${e.name} · ${brl.format(e.value)}`))))}>Ver todos os lançamentos <ArrowRight /></button>
      </section>
      <section className="sg-panel sg-finance-panel">
        <h2><CalendarDays /> Próximos Vencimentos</h2>
        <Records name="Vencimentos" headers={["Vencimento", "Descrição", "Valor", "Status"]} rows={(empty ? [] : due).map((e) => ({
          id: e.date, cells: [e.date, e.name, <b>{brl.format(e.value)}</b>, <Badge label={e.status} />],
          mobile: <div className="sg-mobile-record sg-finance-record"><CalendarDays /><span><b>{e.name}</b><small>{e.date}</small></span><span><b>{brl.format(e.value)}</b><Badge label={e.status} /></span></div>,
        }))} />
        <button className="sg-text-button" onClick={() => open(previewDetail("Todas as contas", ...(empty ? ["Nenhuma conta no período."] : due.map((e) => `${e.date} · ${e.name} · ${brl.format(e.value)}`))))}>Ver todas as contas <ArrowRight /></button>
      </section>
    </div>
  </>;
}

export function ErpScreen({ area, empty, onPeriodChange }: { area: ScreenName; empty: boolean; onPeriodChange: (empty: boolean) => void }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    detail?.submit?.(new FormData(event.currentTarget));
    setDetail(null);
  }
  return <>
    {area === "contatos" && <Contacts open={setDetail} />}
    {area === "vendas" && <Sales empty={empty} onPeriodChange={onPeriodChange} open={setDetail} />}
    {area === "produtos-estoque" && <Inventory open={setDetail} />}
    {area === "financeiro" && <Finance empty={empty} open={setDetail} />}
    <Dialog open={detail !== null} onOpenChange={(open) => { if (!open) setDetail(null); }}>
      {detail && <DialogContent className="sg-demo-dialog">
        <DialogHeader><DialogTitle>{detail.title}</DialogTitle><DialogDescription>Prévia com dados fictícios. As alterações duram apenas nesta tela.</DialogDescription></DialogHeader>
        {detail.content}
        {detail.submit && <form key={detail.title} onSubmit={submit}>
          {detail.fields?.map((name) => <label key={name}>{name}
            <input required name={name} defaultValue={detail.values?.[name]} type={name === "E-mail" ? "email" : "text"} inputMode={name === "Valor" ? "decimal" : name === "Quantidade" ? "numeric" : undefined} />
          </label>)}
          <button className="sg-action sg-bright sg-cyan" type="submit">Confirmar teste</button>
        </form>}
        {detail.title === "Clientes" && <Link className="sg-back-link" to="/gestao/soph-gestao/contatos">Abrir Contatos <ArrowRight size={16} /></Link>}
      </DialogContent>}
    </Dialog>
  </>;
}
