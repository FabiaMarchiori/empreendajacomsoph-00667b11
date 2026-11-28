import { describe, expect, it } from "vitest";
import { centsString, createSalesFinanceBackend, moneyCents, validDate } from "./erp-sales-finance";
import type { ErpCatalogScope } from "./erp-catalog-data";

const companyA="aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const companyB="bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const customer="11111111-1111-1111-1111-111111111111";
const product="22222222-2222-2222-2222-222222222222";
const record="33333333-3333-3333-3333-333333333333";

describe("Soph Gestão sales / finance input contracts", () => {
  it("uses integer cents and refuses malformed/zero money", () => {
    expect(moneyCents("9.99")).toBe(999);
    expect(moneyCents("0.01")).toBe(1);
    expect(moneyCents("9")).toBe(900);
    expect(moneyCents("0.00")).toBeNull();
    expect(moneyCents("-5.50")).toBeNull();
    expect(moneyCents("1e5")).toBeNull();
    expect(moneyCents("1.234")).toBeNull();
    expect(centsString(1001)).toBe("10.01");
  });
  it("validates real calendar dates", () => {
    expect(validDate("2026-02-28")).toBe(true);
    expect(validDate("2026-02-30")).toBe(false);
    expect(validDate("2026-11-28")).toBe(true);
    expect(validDate("28/11/2026")).toBe(false);
  });
  it("rejects invalid sale before any write", async () => {
    const queries: string[]=[];
    const db={
      query: async (sql:string) => { queries.push(sql); return {rows:[]}; },
      findOwnership:async()=>null, readCompany:async()=>null,
    } as ErpCatalogScope;
    const api=createSalesFinanceBackend();
    const input={cliente_id:customer,itens:[
      {produto_id:product,quantidade:1},{produto_id:product,quantidade:2}
    ],forma_pagamento:"Pix",status:"Recebido"};
    const r=await api.salesCreate(db,companyA,input);
    expect(r.status).toBe(400);
    expect(queries).toEqual([]);
  });
  it("rejects customer from another company; all lookups carry company ID", async () => {
    const queries: Array<{sql:string;params:readonly (string|null)[]}> = [];
    const db={
      query:async (sql:string, params:readonly (string|null)[])=>{
        queries.push({sql,params});return {rows:[]};
      },
      findOwnership:async()=>null, readCompany:async()=>null,
    } as ErpCatalogScope;
    const api=createSalesFinanceBackend();
    const r=await api.salesCreate(db,companyA,{
      cliente_id:customer,itens:[{produto_id:product,quantidade:1}],
      forma_pagamento:"Pix",status:"Recebido"
    });
    expect(r.status).toBe(422);
    expect(queries).toHaveLength(1);
    expect(queries[0].params[0]).toBe(companyA);
    expect(queries[0].sql).toContain("tipo='cliente'");
  });
  it("uses prices from the database, never from client input", async () => {
    const queries:Array<{sql:string;params:readonly (string|null)[]}>= [];
    const db={
      query:async(sql:string,params:readonly (string|null)[])=>{
        queries.push({sql,params});
        if(sql.includes("select id from public.contatos")) return {rows:[{id:customer}]};
        if(sql.includes("for update")) return {rows:[{id:product,quantidade:5,preco:"12.34"}]};
        if(sql.includes("insert into public.vendas")) return {rows:[{
          id:record,empresa_id:companyA,cliente_id:customer,valor_total:"24.68",
          status:"concluida",forma_pagamento:"Pix",data_vencimento:null,
          created_at:"2026-11-28T12:00:00Z"
        }]};
        if(sql.includes("update public.produtos")) return {rows:[{id:product}]};
        return {rows:[]};
      },findOwnership:async()=>null,readCompany:async()=>null,
    } as ErpCatalogScope;
    const api=createSalesFinanceBackend();
    const r=await api.salesCreate(db,companyA,{
      cliente_id:customer,itens:[{produto_id:product,quantidade:2,preco:"0.01"}],
      forma_pagamento:"Pix",status:"Recebido",
    });
    expect(r.status).toBe(201);
    expect(queries.find(q=>q.sql.includes("insert into public.vendas"))?.params[2]).toBe("24.68");
    expect(queries.find(q=>q.sql.includes("insert into public.financeiro"))?.params[1]).toBe("24.68");
    expect(queries.find(q=>q.sql.includes("update public.produtos"))?.params).toEqual(["2",product,companyA]);
  });
  it("refuses settling another company's entry", async () => {
    const calls: Array<readonly (string|null)[]> = [];
    const db={
      query:async (_sql:string,params:readonly (string|null)[])=> {
        calls.push(params);
        return {rows:[]};
      },findOwnership:async()=>null,readCompany:async()=>null,
    } as ErpCatalogScope;
    const r=await createSalesFinanceBackend().financeSettle(db,companyA,record);
    expect(r.status).toBe(404);
    expect(calls[0]).toEqual([record,companyA]);
    expect(calls[0]).not.toContain(companyB);
  });
});
