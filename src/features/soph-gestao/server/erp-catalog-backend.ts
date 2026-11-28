import { authorizeErpOperation, erpUuid, type ErpBackendDependencies, type ErpCompanyRequest } from "./erp-backend.ts";
import type { CatalogRepository, ContactInput, ProductInput, ErpCatalogReader } from "./erp-catalog-data.ts";

type TenantRow = { id: string; empresa_id: string };
type Result<Row extends TenantRow> =
  | { status: 200; records: Row[]; next: string | null }
  | { status: 200 | 201; record: Row }
  | { status: 400 | 401 | 403 | 404 | 503 };

const contactFields = ["telefone", "email", "documento"] as const;
const money = /^\d{1,10}(?:\.\d{1,2})?$/;

function object(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function normalizeContact(value: unknown): ContactInput | null {
  const input = object(value);
  if (!input || (input.tipo !== "cliente" && input.tipo !== "fornecedor") || typeof input.nome !== "string" || !input.nome.trim() || input.nome.length > 255) return null;
  const contact: ContactInput = { tipo: input.tipo, nome: input.nome.trim() };
  for (const key of contactFields) {
    const field = input[key];
    if (field === undefined) continue;
    if (field === null) { contact[key] = null; continue; }
    if (typeof field !== "string" || field.length > 1024) return null;
    contact[key] = field.trim() || null;
  }
  const status = input.status;
  if (status === "ativo" || status === "em_negociacao") contact.status = status;
  else if (status === null) contact.status = null;
  else if (status !== undefined) return null;
  return contact;
}

function normalizeProduct(value: unknown): ProductInput | null {
  const input = object(value);
  if (!input || typeof input.nome !== "string" || !input.nome.trim() || input.nome.length > 255
    || typeof input.categoria !== "string" || !input.categoria.trim() || input.categoria.length > 255
    || typeof input.custo !== "string" || !money.test(input.custo)
    || typeof input.preco !== "string" || !money.test(input.preco)) return null;
  const product: ProductInput = { nome: input.nome.trim(), categoria: input.categoria.trim(), custo: input.custo, preco: input.preco };
  const sku = input.sku;
  if (typeof sku === "string" && sku.length <= 255) product.sku = sku.trim() || null;
  else if (sku === null) product.sku = null;
  else if (sku !== undefined) return null;
  const minimum = input.estoque_minimo;
  if (typeof minimum === "number" && Number.isInteger(minimum) && minimum >= 0 && minimum <= 2147483647) {
    product.estoque_minimo = minimum;
  } else if (minimum === null) product.estoque_minimo = null;
  else if (minimum !== undefined) return null;
  return product;
}

export function createErpCatalogBackend(dependencies: ErpBackendDependencies<ErpCatalogReader>) {
  const run = authorizeErpOperation(dependencies);

  function resource<Input, Row extends TenantRow>(
    repo: (reader: ErpCatalogReader) => CatalogRepository<Input, Row>,
    normalize: (input: unknown) => Input | null,
  ) {
    return {
      list(request: ErpCompanyRequest & { after?: string }): Promise<Result<Row>> {
        return run<Result<Row>>(request, "read", async (reader, companyId) => {
          if (request.after !== undefined && (typeof request.after !== "string" || !erpUuid.test(request.after))) return { status: 400 };
          const rows = await repo(reader).list(request.after);
          if (rows.some((row) => row.empresa_id !== companyId)) return { status: 503 };
          const records = rows.slice(0, 100);
          return { status: 200, records, next: rows.length > 100 ? records[99].id : null };
        });
      },
      create(request: ErpCompanyRequest & { input: unknown }): Promise<Result<Row>> {
        return run<Result<Row>>(request, "write", async (reader, companyId) => {
          const input = normalize(request.input);
          if (!input) return { status: 400 };
          const record = await repo(reader).create(input);
          if (record && record.empresa_id !== companyId) throw new Error("Unexpected company in created row");
          return record ? { status: 201, record } : { status: 403 };
        });
      },
      update(request: ErpCompanyRequest & { id: string; input: unknown }): Promise<Result<Row>> {
        return run<Result<Row>>(request, "write", async (reader, companyId) => {
          if (typeof request.id !== "string" || !erpUuid.test(request.id)) return { status: 400 };
          const input = normalize(request.input);
          if (!input) return { status: 400 };
          const id = request.id.toLowerCase();
          const record = await repo(reader).update(id, input);
          if (record && (record.empresa_id !== companyId || record.id !== id)) throw new Error("Unexpected company or id in updated row");
          return record ? { status: 200, record } : { status: 404 };
        });
      },
    };
  }

  return {
    contacts: resource((reader) => reader.contacts, normalizeContact),
    products: resource((reader) => reader.products, normalizeProduct),
  };
}
