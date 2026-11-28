import type { ErpCompanyReader, ErpDataAdapter } from "./erp-data.ts";

export type ContactInput = {
  tipo: "cliente" | "fornecedor";
  nome: string;
  telefone?: string | null;
  email?: string | null;
  documento?: string | null;
  status?: "ativo" | "em_negociacao" | null;
};
export type ProductInput = { nome: string; categoria: string; custo: string; preco: string; sku?: string | null; estoque_minimo?: number | null };
type TenantRow = { id: string; empresa_id: string };
export type Contact = TenantRow & Omit<ContactInput, "tipo"> & { tipo: string | null; endereco: string | null; instagram: string | null };
export type Product = TenantRow & Pick<ProductInput, "nome"> & { categoria: string | null; custo: string | null; preco: string | null; quantidade: number | null; sku: string | null; estoque_minimo: number | null };

export interface CatalogRepository<Input, Row extends TenantRow> {
  list(after?: string): Promise<Row[]>;
  create(input: Input): Promise<Row | null>;
  update(id: string, input: Input): Promise<Row | null>;
}

export type ErpCatalogReader = ErpCompanyReader & {
  contacts: CatalogRepository<ContactInput, Contact>;
  products: CatalogRepository<ProductInput, Product>;
};

// Only wiring supplied by the server may construct this scope. It must run all
// queries in one transaction with the authorized company bound and effective RLS.
export type ErpCatalogScope = ErpCompanyReader & {
  query<Row>(sql: string, parameters: readonly (string | null)[]): Promise<{ rows: Row[] }>;
};

export function createErpCatalogDataAdapter(scope: ErpDataAdapter<ErpCatalogScope>): ErpDataAdapter<ErpCatalogReader> {
  return {
    withCompanyScope(identity, companyId, operation) {
      return scope.withCompanyScope(identity, companyId, (db) => operation({
        findOwnership: () => db.findOwnership(),
        readCompany: () => db.readCompany(),
        contacts: {
          async list(after) {
            return (await db.query<Contact>(
              "select id, empresa_id, tipo, nome, telefone, email, documento, endereco, instagram, status from public.contatos where empresa_id = $1 and ($2::uuid is null or id > $2) order by id limit 101",
              [companyId, after ?? null],
            )).rows;
          },
          async create({ tipo, nome, telefone, email, documento, status }) {
            return (await db.query<Contact>(
              "insert into public.contatos (empresa_id, tipo, nome, telefone, email, documento, status) values ($1,$2,$3,$4,$5,$6,$7) returning id, empresa_id, tipo, nome, telefone, email, documento, endereco, instagram, status",
              [companyId, tipo, nome, telefone ?? null, email ?? null, documento ?? null, status ?? null],
            )).rows[0] ?? null;
          },
          async update(id, input) {
            const parameters: (string | null)[] = [companyId, id, input.tipo, input.nome];
            const assignments = ["tipo=$3", "nome=$4"];
            for (const field of ["telefone", "email", "documento", "status"] as const) {
              const value = input[field];
              if (value === undefined) continue;
              parameters.push(value);
              assignments.push(`${field}=$${parameters.length}`);
            }
            return (await db.query<Contact>(
              `update public.contatos set ${assignments.join(", ")} where empresa_id=$1 and id=$2 returning id, empresa_id, tipo, nome, telefone, email, documento, endereco, instagram, status`,
              parameters,
            )).rows[0] ?? null;
          },
        },
        products: {
          async list(after) {
            return (await db.query<Product>(
              "select id, empresa_id, nome, categoria, custo::text as custo, preco::text as preco, quantidade, sku, estoque_minimo from public.produtos where empresa_id=$1 and ($2::uuid is null or id > $2) order by id limit 101",
              [companyId, after ?? null],
            )).rows;
          },
          async create({ nome, categoria, custo, preco, sku, estoque_minimo }) {
            return (await db.query<Product>(
              "insert into public.produtos (empresa_id, nome, categoria, custo, preco, sku, estoque_minimo) values ($1,$2,$3,$4,$5,$6,$7) returning id, empresa_id, nome, categoria, custo::text as custo, preco::text as preco, quantidade, sku, estoque_minimo",
              [companyId, nome, categoria, custo, preco, sku ?? null, estoque_minimo == null ? null : String(estoque_minimo)],
            )).rows[0] ?? null;
          },
          async update(id, input) {
            const parameters: (string | null)[] = [companyId, id, input.nome, input.categoria, input.custo, input.preco];
            const assignments = ["nome=$3", "categoria=$4", "custo=$5", "preco=$6"];
            for (const field of ["sku", "estoque_minimo"] as const) {
              const value = input[field];
              if (value === undefined) continue;
              parameters.push(value === null ? null : String(value));
              assignments.push(`${field}=$${parameters.length}`);
            }
            return (await db.query<Product>(
              `update public.produtos set ${assignments.join(", ")} where empresa_id=$1 and id=$2 returning id, empresa_id, nome, categoria, custo::text as custo, preco::text as preco, quantidade, sku, estoque_minimo`,
              parameters,
            )).rows[0] ?? null;
          },
        },
      }));
    },
  };
}
