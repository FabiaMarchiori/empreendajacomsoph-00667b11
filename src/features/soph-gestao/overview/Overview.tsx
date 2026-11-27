import { useState, type CSSProperties } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Bell, CalendarDays, CalendarClock, ChartNoAxesColumnIncreasing,
  ChevronDown, ChevronRight, CircleAlert, Coins, CreditCard, Database, HandCoins, Headset,
  House, Package, PieChart, ReceiptText, ShoppingCart,
  Store, Target, UserRound, UsersRound, Wallet, Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import bagImage from "@/assets/importadoras/categories/03-bolsas-mochilas-malas.png";
import perfumeImage from "@/assets/importadoras/categories/04-cosmeticos-perfumes.png";
import brushesImage from "@/assets/importadoras/categories/08-maquiagem.png";
import "./overview.css";
import { financeDelta, seedSales, useDemoState } from "../screens/demo-state";
import { ErpScreen, screenConfig, type ScreenName } from "../screens/ErpScreen";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const metrics = [
  { label: "Faturamento do período", value: 62450, change: "+18,6%", icon: Database, color: "cyan" },
  { label: "Despesas do período", value: 24160, change: "+7,9%", icon: CreditCard, color: "coral" },
  { label: "Resultado estimado", value: 38290, change: "+26,4%", icon: ChartNoAxesColumnIncreasing, color: "green" },
  { label: "Contas a Receber", value: 11580, change: null, icon: HandCoins, color: "purple" },
];
const actions = [
  { label: "Nova venda", icon: ShoppingCart, color: "cyan" },
  { label: "Registrar compra", icon: Package, color: "blue" },
  { label: "Nova despesa", icon: ReceiptText, color: "coral" },
  { label: "Consultar recebimentos", icon: Coins, color: "purple" },
];
const navigation = [
  { label: "Visão Geral", slug: "", icon: House },
  { label: "Vendas", slug: "vendas", icon: ShoppingCart },
  { label: "Produtos e Estoque", slug: "produtos-estoque", short: "Produtos", icon: Package },
  { label: "Financeiro", slug: "financeiro", icon: Wallet },
  { label: "Contatos", slug: "contatos", icon: UsersRound },
];
const months = [
  { name: "Jun", income: 32000, expense: 16000 }, { name: "Jul", income: 36000, expense: 18000 },
  { name: "Ago", income: 42500, expense: 22000 }, { name: "Set", income: 47000, expense: 24000 },
  { name: "Out", income: 54000, expense: 26500 }, { name: "Nov", income: 62450, expense: 24160 },
];
const categories = [
  { label: "Moda e Acessórios", value: 42, color: "#0cf2f7" },
  { label: "Beleza e Cosméticos", value: 24, color: "#2ee98e" },
  { label: "Papelaria e Presentes", value: 18, color: "#bd79f7" },
  { label: "Eletrônicos e Games", value: 10, color: "#43aef7" },
  { label: "Outros", value: 6, color: "#e6f0fb" },
];
let angle = 0;
const categoryGradient = categories.map(({ value, color }) => {
  const start = angle;
  angle += value;
  return `${color} ${start}% ${angle}%`;
}).join(", ");
const products = [
  { name: "Bolsa Transversal", sku: "BOL-001", stock: 5, image: bagImage },
  { name: "Kit Pincéis Premium", sku: "KIT-004", stock: 7, image: brushesImage },
  { name: "Perfume Feminino 100ml", sku: "PERF-010", stock: 4, image: perfumeImage },
];
const receivables = [
  { label: "Vencidos", value: 3450, count: 3, icon: CircleAlert, color: "coral" },
  { label: "Próximos vencimentos", value: 8130, count: 5, icon: CalendarClock, color: "green" },
];

function Brand() {
  return <div className="sg-brand"><ChartNoAxesColumnIncreasing aria-hidden="true" /><div>
    <strong><span>Soph</span> Gestão <b>2.0</b></strong><small>EmpreendaJá</small>
  </div></div>;
}

const rootPath = "/gestao/soph-gestao";

function OverviewNav({ mobile, current }: { mobile?: boolean; current: string }) {
  return <nav aria-label={mobile ? "Menu inferior do Soph Gestão" : "Menu do Soph Gestão"} className={mobile ? "sg-mobile-nav" : "sg-desktop-nav"}>
    {navigation.map(({ label, short, slug, icon: Icon }) =>
      <Link key={label} to={slug ? `${rootPath}/${slug}` : rootPath} aria-current={slug === current ? "page" : undefined}>
        <Icon aria-hidden="true" /><span>{mobile ? short ?? label : label}</span>
      </Link>)}
  </nav>;
}

function CashChart({ empty }: { empty: boolean }) {
  return <section className="sg-panel sg-cash" aria-labelledby="sg-cash-title">
    <div className="sg-chart-header"><h2 id="sg-cash-title"><ChartNoAxesColumnIncreasing /> Entradas x Saídas</h2>
      {!empty && <div className="sg-chart-key"><span><i />Entradas (R$)</span><span><i />Saídas (R$)</span></div>}
    </div>
    {empty ? <p className="sg-empty">Nenhuma movimentação registrada no período.</p> :
      <figure className="sg-bars" aria-label="Entradas e saídas de junho a novembro">
        <div className="sg-axis" aria-hidden="true">{[70, 60, 50, 40, 30, 20, 10, 0].map((n) => <span key={n}>{n ? `${n}K` : "0"}</span>)}</div>
        <div className="sg-plot">
          {months.map(({ name, income, expense }) => <div key={name} className="sg-month" role="group" aria-label={`${name}: entradas ${money.format(income)}, saídas ${money.format(expense)}`}>
            <i style={{ height: `${income / 700}%` }} /><i style={{ height: `${expense / 700}%` }} /><span>{name}</span>
          </div>)}
        </div>
      </figure>}
  </section>;
}

function CategoryChart({ empty }: { empty: boolean }) {
  return <section className="sg-panel sg-categories" aria-labelledby="sg-category-title">
    <h2 id="sg-category-title"><PieChart /> Vendas por Categoria</h2>
    {empty ? <p className="sg-empty">Nenhuma venda por categoria no período.</p> : <div className="sg-category-body">
      <div className="sg-donut" style={{ "--category-gradient": categoryGradient } as CSSProperties}>
        <div><strong>R$ 62.450</strong><span>Faturamento</span></div>
      </div>
      <ul>{categories.map(({ label, value, color }) => <li key={label}><i style={{ backgroundColor: color }} /><span>{label}</span><b>{value}%</b></li>)}</ul>
    </div>}
  </section>;
}

export default function Overview() {
  const { pathname } = useLocation();
  const slug = pathname.slice(rootPath.length + 1).replace(/\/$/, "");
  const area = Object.prototype.hasOwnProperty.call(screenConfig, slug) ? slug as ScreenName : null;
  const screen = area ? screenConfig[area] : null;
  const ScreenIcon = screen?.icon ?? ChartNoAxesColumnIncreasing;
  const [empty, setEmpty] = useState(false);
  const demo = useDemoState();
  const { paid: extraPaid, received: extraReceived, receivable: pendingValue, receivableCount } = financeDelta(demo.entries);
  const revenueDelta = demo.orders.reduce((sum, sale) => sum + sale.value, 0) - seedSales.reduce((sum, sale) => sum + sale.value, 0);
  const demoMetricValues = [62450 + revenueDelta, 24160 + extraPaid, 38290 + revenueDelta + extraReceived - extraPaid, 11580 + pendingValue];
  const [detail, setDetail] = useState<string | null>(null);

  return <div className={`sg-overview${area ? " sg-inner-screen" : ""}`} id="visao-geral">
    <aside className="sg-sidebar">
      <Brand />
      <OverviewNav current={area ?? ""} />
      <div className="sg-sidebar-footer">
        <button className="sg-panel sg-company" onClick={() => setDetail("Minha Empresa")}><Store /><span><strong>Minha Empresa</strong><small>CNPJ: 00.000.000/0001-00</small></span><ChevronDown /></button>
        <button className="sg-panel sg-help" onClick={() => setDetail("Ajuda e Suporte")}><Headset />Ajuda e Suporte</button>
      </div>
    </aside>

    <main className="sg-main" key={area ?? "overview"}>
      <Link className="sg-return" to={area ? rootPath : "/"}>
        <ArrowLeft size={16} aria-hidden="true" />
        {area ? "Voltar" : "Voltar ao EmpreendaJá"}
      </Link>
      <header className="sg-header">
        <div className="sg-mobile-brand"><Brand /></div>
        <div className="sg-welcome"><ScreenIcon aria-hidden="true" /><div>
          <h1>{screen?.title ?? "Olá, empreendedora!"}</h1><p>{screen?.subtitle ?? "Aqui está o resumo do seu negócio hoje."}</p>
        </div></div>
        <div className="sg-tools">
          <label className="sg-period">
            <CalendarDays aria-hidden="true" /><span className="sg-period-label">Período:</span>
            <span className="sg-period-value" aria-hidden="true">{empty ? "Mês anterior" : "Este mês"}</span>
            <select aria-label="Período" value={empty ? "empty" : "current"} onChange={(event) => setEmpty(event.target.value === "empty")}>
              <option value="current">Este mês</option><option value="empty">Mês anterior</option>
            </select>
            {!empty && !area && <span className="sg-period-dates" aria-hidden="true">(01 a 30 nov)</span>}
            <ChevronDown aria-hidden="true" />
          </label>
          <button className="sg-round sg-bell" aria-label="Notificações" onClick={() => setDetail("Notificações")}><Bell /></button>
          <Link className="sg-round" aria-label="Minha conta do EmpreendaJá" to="/conta"><UserRound /></Link>
        </div>
      </header>
      <p className="sg-demo-notice">Modo demonstração. Os dados são fictícios e os cadastros e alterações são descartados ao sair ou recarregar.</p>

      {area ? <ErpScreen key={area} area={area} empty={empty} onPeriodChange={setEmpty} demo={demo} /> : <>
      <section className="sg-metrics" aria-label="Indicadores do período">
        {metrics.map(({ label, change, icon: Icon, color }, index) => <article key={label} className={`sg-metric sg-${color}`}>
          <Icon className="sg-metric-icon" aria-hidden="true" />
          <div><h2>{label}</h2><strong>{money.format(empty ? 0 : demoMetricValues[index])}</strong>
            {change ? <p>{empty ? "Sem movimentações" : <><b>▲ {change}</b> vs. mês anterior</>}</p>
              : <p>{empty ? "0" : 8 + receivableCount} recebimentos pendentes</p>}
          </div>
          {change && !empty && <svg className="sg-sparkline" viewBox="0 0 72 47" aria-hidden="true"><path d="M0 45 24 18Q27 14 30 16L42 24Q45 27 48 22L64 2H72" /></svg>}
        </article>)}
      </section>

      <section className="sg-actions sg-panel" aria-labelledby="sg-actions-title">
        <h2 id="sg-actions-title"><Zap /> Ações rápidas:</h2>
        {actions.map(({ label, icon: Icon, color }) => <button key={label} className={`sg-action sg-${color}`} onClick={() => setDetail(label)}><Icon /><span>{label}</span><ChevronRight /></button>)}
      </section>

      <div className="sg-dashboard">
        <CashChart empty={empty} />
        <CategoryChart empty={empty} />

        <section className="sg-panel sg-receivables" aria-labelledby="sg-receivables-title">
          <h2 id="sg-receivables-title"><CalendarDays /> Recebimentos</h2>
          {empty ? <p className="sg-empty">Nenhum recebimento pendente no período.</p> : <div className="sg-receivable-list">
            {receivables.map(({ label, value, count, icon: Icon, color }) => <button key={label} className={`sg-receivable sg-${color}`} onClick={() => setDetail(label)}><Icon /><b>{label}</b><strong>{money.format(value)}</strong><small>{count} contas</small><ChevronRight /></button>)}
          </div>}
        </section>

        <section className="sg-panel sg-summary" aria-labelledby="sg-summary-title">
          <h2 id="sg-summary-title"><Target /><span>Resumo<br /> do período</span></h2>
          {[["Vendas", empty ? "0" : String(128 + demo.orders.length - seedSales.length)], ["Ticket médio", money.format(empty ? 0 : 488.67 + (62450 + revenueDelta) / (128 + demo.orders.length - seedSales.length) - 62450 / 128)], ["Produtos vendidos", empty ? "0" : String(384 + demo.orders.reduce((sum, sale) => sum + sale.items, 0) - seedSales.reduce((sum, sale) => sum + sale.items, 0))]].map(([label, value]) =>
            <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
        </section>

        <section className="sg-panel sg-inventory" aria-labelledby="sg-inventory-title">
          <div className="sg-inventory-title"><h2 id="sg-inventory-title"><Package /> Estoque em atenção</h2><button onClick={() => setDetail("Estoque")}>Ver estoque <ArrowRight /></button></div>
          <div className="sg-stock-list">
            {products.map(({ name, sku, stock, image }) => <button key={sku} onClick={() => setDetail(name)}>
              <span className="sg-product-icon"><img src={image} alt="" width="48" height="48" /></span><span><b>{name}</b><small>SKU: {sku}</small></span><strong>{stock} un.</strong><ChevronRight />
            </button>)}
          </div>
        </section>
      </div>
      </>}
    </main>
    <OverviewNav mobile current={area ?? ""} />
    <Dialog open={detail !== null} onOpenChange={(open) => { if (!open) setDetail(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{detail}</DialogTitle>
          <DialogDescription>{detail === "Notificações" ? "Nenhuma notificação nova." : "Esta opção ainda não está disponível nesta versão da Visão Geral."}</DialogDescription>
        </DialogHeader>
        <Link to="/gestao" className="sg-back-link">Voltar à Gestão do EmpreendaJá <ArrowRight size={16} /></Link>
      </DialogContent>
    </Dialog>
  </div>;
}
