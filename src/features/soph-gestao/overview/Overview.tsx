import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Bell, CalendarDays, CalendarClock, ChartNoAxesColumnIncreasing,
  ChevronDown, ChevronRight, CircleAlert, Coins, CreditCard, Database, HandCoins, Headset,
  House, Package, PieChart, ReceiptText, ShoppingCart,
  Store, Target, UserRound, UsersRound, Wallet, Zap,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import bagImage from "@/assets/importadoras/categories/03-bolsas-mochilas-malas.png";
import perfumeImage from "@/assets/importadoras/categories/04-cosmeticos-perfumes.png";
import brushesImage from "@/assets/importadoras/categories/08-maquiagem.png";
import "./overview.css";

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
  { label: "Visão Geral", icon: House },
  { label: "Vendas", icon: ShoppingCart },
  { label: "Produtos e Estoque", short: "Produtos", icon: Package },
  { label: "Financeiro", icon: Wallet },
  { label: "Contatos", icon: UsersRound },
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

function OverviewNav({ mobile, onSelect }: { mobile?: boolean; onSelect: (label: string) => void }) {
  return <nav aria-label={mobile ? "Menu inferior do Soph Gestão" : "Menu do Soph Gestão"} className={mobile ? "sg-mobile-nav" : "sg-desktop-nav"}>
    {navigation.map(({ label, short, icon: Icon }, index) => index === 0
      ? <a key={label} href="#visao-geral" aria-current="page"><Icon aria-hidden="true" /><span>{label}</span></a>
      : <button key={label} type="button" onClick={() => onSelect(label)}><Icon aria-hidden="true" /><span>{mobile ? short ?? label : label}</span></button>)}
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
  const [empty, setEmpty] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);

  return <div className="sg-overview" id="visao-geral">
    <aside className="sg-sidebar">
      <Brand />
      <OverviewNav onSelect={setDetail} />
      <div className="sg-sidebar-footer">
        <button className="sg-panel sg-company" onClick={() => setDetail("Minha Empresa")}><Store /><span><strong>Minha Empresa</strong><small>CNPJ: 00.000.000/0001-00</small></span><ChevronDown /></button>
        <button className="sg-panel sg-help" onClick={() => setDetail("Ajuda e Suporte")}><Headset />Ajuda e Suporte</button>
      </div>
    </aside>

    <main className="sg-main">
      <header className="sg-header">
        <div className="sg-mobile-brand"><Brand /></div>
        <div className="sg-welcome"><ChartNoAxesColumnIncreasing aria-hidden="true" /><div>
          <h1>Olá, empreendedora!</h1><p>Aqui está o resumo do seu negócio hoje.</p>
        </div></div>
        <div className="sg-tools">
          <label className="sg-period">
            <CalendarDays aria-hidden="true" /><span className="sg-period-label">Período:</span>
            <span className="sg-period-value" aria-hidden="true">{empty ? "Mês anterior" : "Este mês"}</span>
            <select aria-label="Período" value={empty ? "empty" : "current"} onChange={(event) => setEmpty(event.target.value === "empty")}>
              <option value="current">Este mês</option><option value="empty">Mês anterior</option>
            </select>
            {!empty && <span className="sg-period-dates" aria-hidden="true">(01 a 30 nov)</span>}
            <ChevronDown aria-hidden="true" />
          </label>
          <button className="sg-round sg-bell" aria-label="Notificações" onClick={() => setDetail("Notificações")}><Bell /></button>
          <Link className="sg-round" aria-label="Minha conta do EmpreendaJá" to="/conta"><UserRound /></Link>
        </div>
      </header>

      <section className="sg-metrics" aria-label="Indicadores do período">
        {metrics.map(({ label, value, change, icon: Icon, color }) => <article key={label} className={`sg-metric sg-${color}`}>
          <Icon className="sg-metric-icon" aria-hidden="true" />
          <div><h2>{label}</h2><strong>{money.format(empty ? 0 : value)}</strong>
            {change ? <p>{empty ? "Sem movimentações" : <><b>▲ {change}</b> vs. mês anterior</>}</p>
              : <p>{empty ? "0" : "8"} recebimentos pendentes</p>}
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
          {[["Vendas", empty ? "0" : "128"], ["Ticket médio", money.format(empty ? 0 : 488.67)], ["Produtos vendidos", empty ? "0" : "384"]].map(([label, value]) =>
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
    </main>
    <OverviewNav mobile onSelect={setDetail} />
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
