import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown, ArrowUp, ArrowRight, Boxes, CalendarDays, ChartNoAxesColumnIncreasing, ChevronLeft, ChevronRight,
  CreditCard, Database, Eye, Filter, List, Mail, Package, PackageMinus, Pencil, Phone, PieChart, Plus, ReceiptText,
  Search, ShoppingCart, SlidersHorizontal, Tag, Trash2, TriangleAlert, UsersRound, Wallet, Zap, type LucideIcon,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { brl, contacts, due } from "./fixtures";
import { changeStock, demoDate, financeDelta, parseCents, parseQuantity, seedProducts, seedSales, stockStatus, totalCents, type DemoState, type Entry } from "./demo-state";
import { LineItems, readLines } from "./LineItems";
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
type Field = string | { name: string; options?: string[]; type?: "date" | "tel"; optional?: boolean };
type Detail = { title: string; content?: ReactNode; submit?: (data: FormData) => void; fields?: Field[]; values?: Record<string, string | undefined>; edit?: () => void };
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

function Contacts({ open, demo }: { open: Open; demo: DemoState }) {
  const [kind, setKind] = useState("Cliente");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");
  const [sort, setSort] = useState("Mais recentes");
  const { people: items, setPeople: setItems } = demo;
  const filtered = items.filter((c) => c.kind === kind && (status === "Todos os status" || c.status === status)
    && matching(query, c.name, c.phone, c.email, c.document));
  if (sort === "Nome A–Z") filtered.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  function form(contact?: typeof contacts[number], index?: number) {
    open({
      title: contact ? `Editar ${contact.name}` : "Novo contato",
      fields: ["Nome", { name: "Tipo", options: ["Cliente", "Fornecedor"] }, { name: "Telefone", type: "tel", optional: true }, { name: "E-mail", optional: true }, { name: "CPF/CNPJ", optional: true }, { name: "Status", options: ["Ativo", "Em negociação"] }],
      values: { Nome: contact?.name, Tipo: contact?.kind ?? kind, Telefone: contact?.phone, "E-mail": contact?.email, "CPF/CNPJ": contact?.document, Status: contact?.status ?? "Ativo" },
      submit(data) {
        const item = { name: field(data, "Nome"), phone: field(data, "Telefone"), email: field(data, "E-mail"), document: field(data, "CPF/CNPJ"), kind: field(data, "Tipo"), status: field(data, "Status") };
        if (items.some((c, i) => i !== index && c.kind === item.kind && c.name.toLowerCase() === item.name.toLowerCase())) throw new Error("Já existe um contato com esse nome e tipo.");
        setItems((prev) => index === undefined ? [item, ...prev] : prev.map((c, i) => i === index ? item : c));
        setKind(item.kind); setStatus("Todos os status"); setQuery("");
      },
    });
  }

  const rows = filtered.map((c) => {
    const identity = <span className="sg-person"><Avatar name={c.name} /><b>{c.name}</b></span>;
    const info = <span className="sg-contact-info"><span><Phone />{c.phone}</span><span><Mail />{c.email}</span></span>;
    const actions = <RowActions name={c.name} view={() => open({ ...previewDetail(c.name, ...[c.phone, c.email, c.document, c.status].filter(Boolean)), edit: () => form(c, items.indexOf(c)) })} edit={() => form(c, items.indexOf(c))} />;
    return { id: String(items.indexOf(c)), cells: [identity, info, <Badge label={c.kind} color="cyan" />, <Badge label={c.status} />, actions],
      mobile: <div className="sg-mobile-contact"><Avatar name={c.name} /><div><b>{c.name}</b>{info}</div><div><Badge label={c.kind} color={c.kind === "Cliente" ? "green" : "purple"} />{actions}</div></div> };
  });

  return <div className="sg-contacts">
    <Metrics items={[["Clientes", String(248 + items.filter((c) => c.kind === "Cliente").length - contacts.filter((c) => c.kind === "Cliente").length), UsersRound, "cyan", "▲ +12%"], ["Fornecedores", String(58 + items.filter((c) => c.kind === "Fornecedor").length - contacts.filter((c) => c.kind === "Fornecedor").length), Wallet, "purple", "▲ +8%"]]} />
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

function Sales({ empty, onPeriodChange, open, demo }: { empty: boolean; onPeriodChange: (empty: boolean) => void; open: Open; demo: DemoState }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Todos os status");
  const [sort, setSort] = useState("Mais recentes");
  const { orders: items, setOrders: setItems, people, catalog, setCatalog } = demo;
  const visible = empty ? [] : items.filter((s) => (status === "Todos os status" || s.status === status) && matching(query, s.id, s.customer, s.product));
  if (sort === "Mais antigas") visible.reverse();
  const count = 128 + items.length - seedSales.length;
  const revenue = 62450 + items.reduce((sum, sale) => sum + sale.value, 0) - seedSales.reduce((sum, sale) => sum + sale.value, 0);
  const sold = 384 + items.reduce((sum, sale) => sum + sale.items, 0) - seedSales.reduce((sum, sale) => sum + sale.items, 0);
  function form(sale?: typeof seedSales[number]) {
    const previous = sale?.lines ?? [];
    const clients = Array.from(new Set([...people.filter((person) => person.kind === "Cliente").map((person) => person.name), ...(sale ? [sale.customer] : [])]));
    open({
      title: sale ? `Editar ${sale.id}` : "Nova venda",
      fields: [{ name: "Cliente", options: clients }, { name: "Pagamento", options: ["PIX", "Cartão", "Boleto", "Dinheiro"] }],
      values: { Cliente: sale?.customer, Pagamento: sale?.payment ?? "PIX" },
      content: <LineItems catalog={catalog} initial={previous} />,
      submit(data) {
        const lines = readLines(data, catalog);
        const nextCatalog = changeStock(changeStock(catalog, previous, 1), lines, -1);
        const next = {
          id: sale?.id ?? `V-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
          date: sale?.date ?? demoDate, customer: field(data, "Cliente"),
          product: lines.map((line) => catalog.find((p) => p.sku === line.sku)?.name ?? line.sku).join(", "),
          value: totalCents(lines) / 100, items: lines.reduce((sum, line) => sum + line.quantity, 0),
          payment: field(data, "Pagamento"), status: sale?.status ?? "Em andamento", lines,
        };
        setCatalog(nextCatalog);
        setItems((prev) => sale ? prev.map((s) => s.id === sale.id ? next : s) : [next, ...prev]);
        onPeriodChange(false); setQuery(""); setStatus("Todos os status");
      },
    });
  }
  return <>
    <Metrics items={[
      ["Total de Vendas", empty ? "0" : String(count), ShoppingCart, "cyan"],
      ["Faturamento", displayValue(revenue, empty), Database, "green", empty ? undefined : "▲ +18,6%"],
      ["Ticket Médio", displayValue(488.67 + revenue / count - 62450 / 128, empty), Tag, "purple"],
      ["Produtos Vendidos", empty ? "0" : String(sold), ChartNoAxesColumnIncreasing, "coral"],
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
      const view = () => open({ ...previewDetail(s.id, s.customer, s.product, s.date, s.payment, brl.format(s.value), s.status), edit: () => form(s) });
      return { id: s.id, cells: [<span className="sg-person"><ShoppingCart /><b>{s.id}</b></span>, s.date, <span className="sg-person"><Avatar name={s.customer} /><b>{s.customer}</b></span>, s.items, <b>{brl.format(s.value)}</b>, <Badge label={s.payment} color={s.payment === "PIX" ? "cyan" : s.payment === "Cartão" ? "purple" : "blue"} />, <Badge label={s.status} />, <RowActions name={s.id} view={view} edit={() => form(s)} />],
        mobile: <button className="sg-mobile-record" onClick={view}><ShoppingCart /><span><b>{s.id}</b><small>{s.date} · {s.customer}</small></span><span><b>{brl.format(s.value)}</b><Badge label={s.status} /></span><ChevronRight /></button> };
    })} />
  </>;
}

function Inventory({ open, demo }: { open: Open; demo: DemoState }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas as categorias");
  const [status, setStatus] = useState("Todos os status");
  const { catalog: items, setCatalog: setItems, people, orders, purchases, setPurchases } = demo;
  const groups = Array.from(new Set(items.map((product) => product.group)));
  function form(product?: typeof seedProducts[number]) {
    open({
      title: product ? `Editar ${product.name}` : "Novo produto", fields: ["Produto", "SKU", "Categoria", "Custo", "Preço", "Quantidade", "Estoque mínimo"],
      values: product && { Produto: product.name, SKU: product.sku, Categoria: product.group, Custo: String(product.cost), Preço: String(product.price), Quantidade: String(product.qty), "Estoque mínimo": String(product.minimum) },
      submit(data) {
        const qty = parseQuantity(field(data, "Quantidade"), "Quantidade", true);
        const minimum = parseQuantity(field(data, "Estoque mínimo"), "Estoque mínimo", true);
        const sku = field(data, "SKU").toUpperCase();
        if (items.some((p) => p.sku === sku && p.sku !== product?.sku)) throw new Error("Esse SKU já está em uso.");
        if (product && sku !== product.sku && [...orders, ...purchases].some((order) => order.lines.some((line) => line.sku === product.sku))) {
          throw new Error("Este SKU está vinculado a uma venda ou compra.");
        }
        const next = { name: field(data, "Produto"), sku, group: field(data, "Categoria"), qty, minimum,
          cost: parseCents(field(data, "Custo"), "Custo", true) / 100, price: parseCents(field(data, "Preço"), "Preço") / 100,
          image: product?.image ?? "", status: stockStatus(qty, minimum) };
        setItems((prev) => product ? prev.map((item) => item.sku === product.sku ? next : item) : [next, ...prev]);
        setQuery(""); setCategory("Todas as categorias"); setStatus("Todos os status");
      },
    });
  }
  function purchase() {
    open({
      title: "Registrar compra", fields: [{ name: "Fornecedor", options: people.filter((p) => p.kind === "Fornecedor").map((p) => p.name) }],
      content: <LineItems catalog={items} purchase />,
      submit(data) {
        const lines = readLines(data, items);
        setItems(changeStock(items, lines, 1));
        setPurchases((prev) => [{ id: crypto.randomUUID(), supplier: field(data, "Fornecedor"), date: demoDate, lines }, ...prev]);
      },
    });
  }
  function adjust() {
    open({ title: "Ajustar estoque", fields: [{ name: "SKU", options: items.map((p) => p.sku) }, "Quantidade"], submit(data) {
      const qty = parseQuantity(field(data, "Quantidade"), "Quantidade", true);
      setItems((prev) => prev.map((p) => p.sku === field(data, "SKU") ? { ...p, qty, status: stockStatus(qty, p.minimum) } : p));
    } });
  }
  function count(status: string, original: number) {
    return String(original + items.filter((item) => item.status === status).length - seedProducts.filter((item) => item.status === status).length);
  }
  const visible = items.filter((p) => (category === "Todas as categorias" || p.group === category) && (status === "Todos os status" || p.status === status) && matching(query, p.name, p.sku, p.group));
  return <>
    <Metrics items={[["Total de Produtos", String(384 + items.length - seedProducts.length), Package, "cyan"], ["Em Estoque", count("Em estoque", 328), Boxes, "green"], ["Estoque Baixo", count("Estoque baixo", 18), TriangleAlert, "gold"], ["Sem Estoque", count("Sem estoque", 6), PackageMinus, "coral"]]} />
    <QuickActions items={[
      ["Novo produto", Plus, "cyan sg-bright", () => form()],
      ["Registrar compra", ShoppingCart, "blue", purchase],
      ["Ajustar estoque", SlidersHorizontal, "purple", adjust],
      ["Categorias", Tag, "outline", () => open(previewDetail("Categorias", ...groups))],
    ]} />
    <div className="sg-filters">
      <SearchField value={query} onChange={setQuery} placeholder="Buscar por nome, SKU ou categoria..." />
      <SelectFilter label="Categoria" value={category} onChange={setCategory} options={["Todas as categorias", ...groups]} icon={Tag} />
      <SelectFilter label="Status" value={status} onChange={setStatus} options={["Todos os status", "Em estoque", "Estoque baixo", "Sem estoque"]} />
    </div>
    <Records key={query + category + status} name="Produtos" headers={["Produto", "SKU", "Categoria", "Estoque", "Situação", "Valor de venda", "Ações"]} rows={visible.map((p) => {
      const view = () => open({ ...previewDetail(p.name, p.sku, p.group, `Quantidade: ${p.qty} un.`, `Estoque mínimo: ${p.minimum} un.`, `Custo: ${brl.format(p.cost)}`, `Preço: ${brl.format(p.price)}`), edit: () => form(p) });
      const image = <span className="sg-product-icon">{p.image && <img src={p.image} alt="" />}</span>;
      const quantity = <Badge label={`${p.qty} un.`} color={p.qty === 0 ? "coral" : p.qty < 10 ? "gold" : "cyan"} />;
      return { id: p.sku, cells: [<span className="sg-person">{image}<b>{p.name}</b></span>, p.sku, <Badge label={p.group} color={p.group === "Beleza e Cosméticos" ? "purple" : "cyan"} />, quantity, <Badge label={p.status} />, <b>{brl.format(p.price)}</b>, <RowActions name={p.name} view={view} edit={() => form(p)} remove={() => open({ title: `Excluir ${p.name}`, content: <p>O produto será removido apenas desta sessão de teste.</p>, submit: () => {
        if ([...orders, ...purchases].some((order) => order.lines.some((line) => line.sku === p.sku))) throw new Error("O produto está vinculado a uma venda ou compra.");
        setItems((prev) => prev.filter((item) => item.sku !== p.sku));
      } })} />],
        mobile: <button className="sg-mobile-record" onClick={view}>{image}<span><b>{p.name}</b><small>SKU: {p.sku}</small></span><span>{quantity}<b>{brl.format(p.price)}</b></span><ChevronRight /></button> };
    })} />
    <button className="sg-text-button" onClick={() => open(previewDetail("Histórico de compras", ...purchases.map((p) => `${p.date} · ${p.supplier} · ${p.lines.map((line) => `${line.quantity} × ${line.sku}`).join(", ")} · ${brl.format(totalCents(p.lines) / 100)}`), "26/11/2026 · Compra de produtos · R$ 1.250,00"))}>Ver histórico de compras <ArrowRight /></button>
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

function Finance({ empty, open, demo, onPeriodChange }: { empty: boolean; open: Open; demo: DemoState; onPeriodChange: (empty: boolean) => void }) {
  const { entries, setEntries } = demo;
  const newEntries = entries.filter((entry) => !entry.id.startsWith("entry-"));
  const { received, paid, receivable, payable } = financeDelta(entries);
  const axisStep = Math.ceil(Math.max(70000, 62450 + received, 38760 + paid) / 70000) * 10;
  const deadlines = [
    ...newEntries.filter((e) => e.dueDate && e.status === "Pendente").map((e) => ({
      date: e.dueDate.split("-").reverse().join("/"), name: e.name, value: Math.abs(e.value), status: e.kind, entry: e,
    })),
    ...due.map((item) => ({ ...item, entry: undefined })),
  ];

  function entryForm(kind: Entry["kind"], entry?: Entry) {
    const income = kind === "Receita" || kind === "A receber";
    const scheduled = kind === "A receber" || kind === "A pagar";
    const settled = income ? "Recebido" : "Pago";
    const title = { Receita: "Nova receita", Despesa: "Nova despesa", "A receber": "Nova conta a receber", "A pagar": "Nova conta a pagar" }[kind];
    open({
      title: entry ? `Editar ${entry.name}` : title,
      fields: ["Descrição", "Categoria", "Valor", { name: "Vencimento", type: "date", optional: !scheduled }, { name: "Situação", options: ["Pendente", settled] }],
      values: { Descrição: entry?.name, Categoria: entry?.category, Valor: entry && String(Math.abs(entry.value)), Vencimento: entry?.dueDate,
        Situação: entry?.status === "Concluído" ? settled : entry?.status ?? (scheduled ? "Pendente" : settled) },
      submit(data) {
        const value = parseCents(field(data, "Valor"), "Valor") / 100;
        const next: Entry = { id: entry?.id ?? crypto.randomUUID(), date: entry?.date ?? demoDate, name: field(data, "Descrição"), category: field(data, "Categoria"),
          value: income ? value : -value, status: field(data, "Situação"), dueDate: field(data, "Vencimento"), kind };
        setEntries((prev) => entry ? prev.map((e) => e.id === entry.id ? next : e) : [next, ...prev]);
        onPeriodChange(false);
      },
    });
  }
  const entryDetail = (entry: Entry) => open({
    ...previewDetail(entry.name, entry.kind, entry.category, brl.format(entry.value), entry.status, ...(entry.dueDate ? [entry.dueDate.split("-").reverse().join("/")] : [])),
    edit: () => entryForm(entry.kind, entry),
  });
  return <>
    <Metrics items={[
      ["Contas a Receber", displayValue(28450 + receivable, empty), Database, "green", empty ? undefined : "▲ +14,8%"],
      ["Contas a Pagar", displayValue(12680 + payable, empty), CreditCard, "coral", empty ? undefined : "▲ +6,2%"],
      ["Saldo em Caixa", displayValue(57320 + received - paid, empty), Wallet, "blue", empty ? undefined : "▲ +9,7%"],
      ["Despesas do Mês", displayValue(8940 + paid, empty), ChartNoAxesColumnIncreasing, "purple", empty ? undefined : "▼ -12,3%"],
    ]} />
    <QuickActions items={[
      ["Nova receita", Plus, "cyan sg-bright", () => entryForm("Receita")],
      ["Nova despesa", Plus, "coral sg-bright", () => entryForm("Despesa")],
      ["Contas a receber", List, "blue", () => entryForm("A receber")],
      ["Contas a pagar", List, "purple", () => entryForm("A pagar")],
    ]} />
    <div className="sg-finance-charts">
      <section className="sg-panel sg-finance-panel">
        <h2><ChartNoAxesColumnIncreasing /> Receitas x Despesas</h2>
        {empty ? <p className="sg-empty">Nenhuma movimentação registrada no período.</p> : <>
          <figure className="sg-bars sg-finance-bars" aria-label="Receitas e despesas de junho a novembro">
            <div className="sg-axis" aria-hidden="true">{[70, 60, 50, 40, 30, 20, 10, 0].map((n) => <span key={n}>{n ? `${n * axisStep / 10}K` : "0"}</span>)}</div>
            <div className="sg-plot">{financeMonths.map(([name, baseIncome, baseExpense]) => {
              const income = baseIncome + (name === "Nov" ? received : 0);
              const expense = baseExpense + (name === "Nov" ? paid : 0);
              const max = axisStep * 70;
              return <div key={name} className="sg-month" role="group" aria-label={`${name}: receitas ${brl.format(income)}, despesas ${brl.format(expense)}`}>
              <i style={{ height: `${income / max}%` }} /><i style={{ height: `${expense / max}%` }} /><span>{name}</span>
            </div>; })}</div>
          </figure>
          <div className="sg-finance-key"><span><i />Receitas <b>{brl.format(62450 + received)}</b></span><span><i />Despesas <b>{brl.format(38760 + paid)}</b></span></div>
        </>}
      </section>
      <section className="sg-panel sg-finance-panel">
        <h2><PieChart /> Composição das Despesas</h2>
        {empty ? <p className="sg-empty">Nenhuma despesa registrada no período.</p> : <div className="sg-category-body">
          <div className="sg-donut" style={{ "--category-gradient": expenseGradient } as CSSProperties}><div><strong>{brl.format(8940 + paid)}</strong><span>Total</span></div></div>
          <ul>{expenseMix.map(([label, share, color]) => <li key={label}><i style={{ backgroundColor: color }} /><span>{label}</span><b>{share}%</b></li>)}</ul>
        </div>}
      </section>
    </div>
    <div className="sg-finance-lists">
      <section className="sg-panel sg-finance-panel">
        <h2><ReceiptText /> Lançamentos Recentes</h2>
        <Records name="Lançamentos" headers={["Data", "Descrição", "Categoria", "Valor", "Status"]} rows={(empty ? [] : entries).map((e) => ({
          id: e.id, cells: [e.date, <button onClick={() => entryDetail(e)}>{e.name}</button>, <Badge label={e.category} color={e.value < 0 ? "purple" : "cyan"} />, <b>{brl.format(e.value)}</b>, <Badge label={e.status} />],
          mobile: <button className="sg-mobile-record sg-finance-record" onClick={() => entryDetail(e)}>{e.value < 0 ? <ArrowDown /> : <ArrowUp />}<span><b>{e.name}</b><small>{e.date}</small></span><span><b>{brl.format(e.value)}</b><Badge label={e.status} /></span></button>,
        }))} />
        <button className="sg-text-button" onClick={() => open({ title: "Todos os lançamentos", content: empty ? <p>Nenhum lançamento no período.</p> : <ul className="sg-detail-list">{entries.map((e) => <li key={e.id}><button type="button" onClick={() => entryDetail(e)}>{e.date} · {e.name} · {brl.format(e.value)}</button></li>)}</ul> })}>Ver todos os lançamentos <ArrowRight /></button>
      </section>
      <section className="sg-panel sg-finance-panel">
        <h2><CalendarDays /> Próximos Vencimentos</h2>
        <Records name="Vencimentos" headers={["Vencimento", "Descrição", "Valor", "Status"]} rows={(empty ? [] : deadlines).map((e) => ({
          id: e.entry?.id ?? e.date, cells: [e.date, e.entry ? <button onClick={() => entryDetail(e.entry!)}>{e.name}</button> : e.name, <b>{brl.format(e.value)}</b>, <Badge label={e.status} />],
          mobile: <button className="sg-mobile-record sg-finance-record" onClick={() => e.entry ? entryDetail(e.entry) : open(previewDetail(e.name, e.date, brl.format(e.value), e.status))}><CalendarDays /><span><b>{e.name}</b><small>{e.date}</small></span><span><b>{brl.format(e.value)}</b><Badge label={e.status} /></span></button>,
        }))} />
        <button className="sg-text-button" onClick={() => open(previewDetail("Todas as contas", ...(empty ? ["Nenhuma conta no período."] : deadlines.map((e) => `${e.date} · ${e.name} · ${brl.format(e.value)}`))))}>Ver todas as contas <ArrowRight /></button>
      </section>
    </div>
  </>;
}

export function ErpScreen({ area, empty, onPeriodChange, demo }: { area: ScreenName; empty: boolean; onPeriodChange: (empty: boolean) => void; demo: DemoState }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  function open(next: Detail | null) {
    setError("");
    setDetail(next);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      for (const field of detail?.fields ?? []) {
        const spec = typeof field === "string" ? { name: field } : field;
        if (!spec.optional && !String(data.get(spec.name) ?? "").trim()) throw new Error(`Preencha ${spec.name}.`);
      }
      detail?.submit?.(data);
      open(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
    }
  }
  return <>
    {area === "contatos" && <Contacts open={open} demo={demo} />}
    {area === "vendas" && <Sales empty={empty} onPeriodChange={onPeriodChange} open={open} demo={demo} />}
    {area === "produtos-estoque" && <Inventory open={open} demo={demo} />}
    {area === "financeiro" && <Finance empty={empty} open={open} demo={demo} onPeriodChange={onPeriodChange} />}
    <Dialog open={detail !== null} onOpenChange={(isOpen) => { if (!isOpen) open(null); }}>
      {detail && <DialogContent className="sg-demo-dialog">
        <DialogHeader><DialogTitle>{detail.title}</DialogTitle><DialogDescription>Dados fictícios. As alterações são descartadas ao recarregar ou sair da demonstração.</DialogDescription></DialogHeader>
        {detail.submit ? <form key={detail.title} onSubmit={submit}>
          <div className="sg-demo-fields">
          {detail.fields?.map((field) => {
            const spec = typeof field === "string" ? { name: field } : field;
            const { name } = spec;
            return <label key={name}>{name}
              {spec.options
                ? <select name={name} aria-label={name} required={!spec.optional} defaultValue={detail.values?.[name] ?? ""}><option value="">Selecione</option>{spec.options.map((item) => <option key={item}>{item}</option>)}</select>
                : <input required={!spec.optional} name={name} defaultValue={detail.values?.[name]} type={spec.type ?? (name === "E-mail" ? "email" : "text")} inputMode={/Valor|Custo|Preço/.test(name) ? "decimal" : /Quantidade|Estoque mínimo/.test(name) ? "numeric" : undefined} />}
            </label>;
          })}
          </div>
          {detail.content}
          {error && <p role="alert" className="sg-demo-error">{error}</p>}
          <div className="sg-demo-buttons">
            <button type="button" className="sg-action sg-outline" onClick={() => open(null)}>Cancelar</button>
            <button className="sg-action sg-bright sg-cyan" type="submit">{detail.title.startsWith("Excluir") ? "Excluir" : "Salvar"}</button>
          </div>
        </form> : <>
          {detail.content}
          <div className="sg-demo-buttons">
            <button className="sg-action sg-outline" onClick={() => open(null)}>Voltar</button>
            {detail.edit && <button className="sg-action sg-bright sg-cyan" onClick={detail.edit}>Editar</button>}
          </div>
        </>}
        {detail.title === "Clientes" && <Link className="sg-back-link" to="/gestao/soph-gestao/contatos">Abrir Contatos <ArrowRight size={16} /></Link>}
      </DialogContent>}
    </Dialog>
  </>;
}
