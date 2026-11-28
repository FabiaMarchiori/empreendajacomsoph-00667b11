import type { ErpCatalogScope } from "./erp-catalog-data.ts";
import { erpUuid } from "./erp-backend.ts";

export type SaleRow = {
  id: string; empresa_id: string; cliente_id: string; cliente_nome: string; valor_total: string;
  status: string; forma_pagamento: string | null; data_vencimento: string | null; created_at: string;
  total_itens: number;
};
export type FinanceRow = {
  id: string; empresa_id: string; type: "receita" | "despesa"; descricao: string; value: string;
  date: string; category: string; status: string; created_at: string; venda_id: string | null;
};
type Result<T> = { status: number; records?: T[]; next?: string | null; record?: T; error?: string };
type Db = ErpCatalogScope;

const amountPattern = /^\d{1,10}(?:\.\d{1,2})?$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function moneyCents(value: unknown): number | null {
  if (typeof value !== "string" || !amountPattern.test(value)) return null;
  const [whole, decimals = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
export function centsString(value: number): string {
  if (!Number.isSafeInteger(value) || value <= 0) throw new Error("invalid cents");
  return `${Math.floor(value / 100)}.${String(value % 100).padStart(2, "0")}`;
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}
type SaleInput = {
  cliente_id: string;
  itens: Array<{ produto_id: string; quantidade: number }>;
  forma_pagamento: string;
  status: "Recebido" | "Pendente";
  data_vencimento?: string;
};
function saleInput(value: unknown): SaleInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const x = value as Record<string, unknown>;
  if (typeof x.cliente_id !== "string" || !erpUuid.test(x.cliente_id)
      || !Array.isArray(x.itens) || x.itens.length === 0 || x.itens.length > 40
      || !["Recebido", "Pendente"].includes(String(x.status))
      || typeof x.forma_pagamento !== "string" || !x.forma_pagamento.trim() || x.forma_pagamento.length > 64
      || (x.data_vencimento != null && !validDate(x.data_vencimento))) return null;
  const seen = new Set<string>();
  for (const line of x.itens) {
    if (!line || typeof line !== "object" || Array.isArray(line)) return null;
    const item = line as Record<string, unknown>;
    if (typeof item.produto_id !== "string" || !erpUuid.test(item.produto_id)
      || !Number.isInteger(item.quantidade) || Number(item.quantidade) < 1 || Number(item.quantidade) > 10000
      || seen.has(item.produto_id.toLowerCase())) return null;
    seen.add(item.produto_id.toLowerCase());
  }
  return {
    cliente_id: x.cliente_id.toLowerCase(),
    itens: (x.itens as SaleInput["itens"]).map(line => ({ produto_id: line.produto_id.toLowerCase(), quantidade: line.quantidade }))
      .sort((a,b) => a.produto_id.localeCompare(b.produto_id)),
    forma_pagamento: x.forma_pagamento.trim(), status: x.status as SaleInput["status"],
    ...(x.data_vencimento ? { data_vencimento: x.data_vencimento as string } : {}),
  };
}
type FinanceInput = {
  type: "receita" | "despesa"; descricao: string; value: string; date: string; category: string;
  status: "Recebido" | "Pago" | "Pendente";
};
function financeInput(value: unknown): FinanceInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const x = value as Record<string, unknown>;
  if ((x.type !== "receita" && x.type !== "despesa")
    || typeof x.descricao !== "string" || !x.descricao.trim() || x.descricao.length > 250
    || typeof x.category !== "string" || !x.category.trim() || x.category.length > 100
    || moneyCents(x.value) === null || !validDate(x.date)
    || !["Recebido", "Pago", "Pendente"].includes(String(x.status))
    || (x.type === "receita" && x.status === "Pago")
    || (x.type === "despesa" && x.status === "Recebido")) return null;
  return { type: x.type, descricao: x.descricao.trim(), value: x.value as string, date: x.date as string,
    category: x.category.trim(), status: x.status as FinanceInput["status"] };
}
const cursor = (after?: string) => after === undefined || erpUuid.test(after);
export function createSalesFinanceBackend() {
  return {
    async salesList(db: Db, companyId: string, after?: string): Promise<Result<SaleRow>> {
      if (!cursor(after)) return { status: 400, error: "INVALID_CURSOR" };
      const rows = (await db.query<SaleRow>(
        `select v.id,v.empresa_id,v.cliente_id,c.nome as cliente_nome,v.valor_total::text as valor_total,
         v.status,v.forma_pagamento,v.data_vencimento::text as data_vencimento,v.created_at,
         (select count(*)::integer from public.itens_venda iv where iv.venda_id=v.id) as total_itens
         from public.vendas v join public.contatos c on c.id=v.cliente_id and c.empresa_id=v.empresa_id
         where v.empresa_id=$1::uuid and ($2::uuid is null or v.id>$2::uuid)
         order by v.id limit 101`, [companyId,after??null],
      )).rows;
      return { status: 200, records: rows.slice(0,100), next: rows.length>100?rows[99].id:null };
    },
    async financeList(db: Db, companyId: string, after?: string): Promise<Result<FinanceRow>> {
      if (!cursor(after)) return { status: 400, error: "INVALID_CURSOR" };
      const rows = (await db.query<FinanceRow>(
        `select id,empresa_id,type,descricao,value::text as value,date,category,status,created_at,venda_id
         from public.financeiro where empresa_id=$1::uuid and ($2::uuid is null or id>$2::uuid)
         order by id limit 101`, [companyId,after??null],
      )).rows;
      return { status: 200, records: rows.slice(0,100), next: rows.length>100?rows[99].id:null };
    },
    async financeCreate(db: Db, companyId: string, input: unknown): Promise<Result<FinanceRow>> {
      const value = financeInput(input);
      if (!value) return { status: 400, error: "INVALID_FINANCE_INPUT" };
      const row=(await db.query<FinanceRow>(
        `insert into public.financeiro(empresa_id,type,descricao,value,date,category,status)
         values ($1::uuid,$2,$3,$4::numeric,$5,$6,$7)
         returning id,empresa_id,type,descricao,value::text as value,date,category,status,created_at,venda_id`,
        [companyId,value.type,value.descricao,value.value,value.date,value.category,value.status],
      )).rows[0];
      return row?{status:201,record:row}:{status:503,error:"INSERT_FAILED"};
    },
    async financeSettle(db: Db, companyId: string, id: unknown): Promise<Result<FinanceRow>> {
      if (typeof id !== "string" || !erpUuid.test(id)) return {status:400,error:"INVALID_ID"};
      const result=await db.query<FinanceRow>(
        `update public.financeiro set status=case when type='receita' then 'Recebido' else 'Pago' end
         where id=$1::uuid and empresa_id=$2::uuid and status='Pendente'
           and venda_id is null and compra_id is null
         returning id,empresa_id,type,descricao,value::text as value,date,category,status,created_at,venda_id`,
        [id,companyId],
      );
      return result.rows[0]?{status:200,record:result.rows[0]}:{status:404,error:"ENTRY_NOT_PENDING"};
    },
    async salesCreate(db: Db, companyId: string, input: unknown): Promise<Result<SaleRow>> {
      const value = saleInput(input);
      if (!value) return {status:400,error:"INVALID_SALE_INPUT"};
      const customer = (await db.query<{id:string}>(
        "select id from public.contatos where empresa_id=$1::uuid and id=$2::uuid and tipo='cliente'",
        [companyId,value.cliente_id],
      )).rows[0];
      if (!customer) return {status:422,error:"INVALID_CUSTOMER"};

      let total=0;
      const items: Array<{id:string;qty:number;unit:number}>=[];
      for (const line of value.itens) {
        // The SQL transaction is held throughout, with locks acquired in UUID order.
        const product=(await db.query<{id:string;quantidade:number;preco:string}>(
          `select id,quantidade,preco::text as preco from public.produtos
           where id=$1::uuid and empresa_id=$2::uuid for update`,
          [line.produto_id,companyId],
        )).rows[0];
        const unit=product?moneyCents(product.preco):null;
        if (!product || unit===null || product.quantidade < line.quantidade) return {status:422,error:"INSUFFICIENT_STOCK"};
        const subtotal=unit*line.quantidade;
        if (!Number.isSafeInteger(subtotal) || subtotal+total>1_000_000_000_00) return {status:422,error:"TOTAL_LIMIT"};
        total+=subtotal;
        items.push({id:line.produto_id,qty:line.quantidade,unit});
      }
      const sale=(await db.query<SaleRow>(
        `insert into public.vendas(empresa_id,cliente_id,valor_total,status,forma_pagamento,data_vencimento)
         values ($1::uuid,$2::uuid,$3::numeric,'concluida',$4,$5::date)
         returning id,empresa_id,cliente_id,valor_total::text as valor_total,status,
           forma_pagamento,data_vencimento::text as data_vencimento,created_at`,
        [companyId,value.cliente_id,centsString(total),value.forma_pagamento,value.data_vencimento??null],
      )).rows[0];
      if (!sale) throw new Error("SALE_INSERT_FAILED");
      for (const line of items) {
        const amount=centsString(line.qty*line.unit);
        await db.query(
          `insert into public.itens_venda(venda_id,produto_id,quantidade,preco_unitario,subtotal)
           values($1::uuid,$2::uuid,$3::integer,$4::numeric,$5::numeric)`,
          [sale.id,line.id,String(line.qty),centsString(line.unit),amount],
        );
        const updated=(await db.query<{id:string}>(
          `update public.produtos set quantidade=quantidade-$1::integer
           where id=$2::uuid and empresa_id=$3::uuid and quantidade >= $1::integer returning id`,
          [String(line.qty),line.id,companyId],
        )).rows;
        if (updated.length!==1) throw new Error("STOCK_CHANGED");
      }
      const due=value.data_vencimento??new Date().toISOString().slice(0,10);
      await db.query(
        `insert into public.financeiro(empresa_id,type,value,descricao,category,status,date,venda_id)
         values($1::uuid,'receita',$2::numeric,$3,'Vendas',$4,$5,$6::uuid)`,
        [companyId,centsString(total),"Venda para "+value.cliente_id,value.status,due,sale.id],
      );
      return {status:201,record:{...sale,cliente_nome:"",total_itens:items.reduce((sum,item)=>sum+item.qty,0)}};
    },
  };
}
