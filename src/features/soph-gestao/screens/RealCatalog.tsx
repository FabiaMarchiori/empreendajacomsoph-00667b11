import { useCallback, useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ScreenName } from "./ErpScreen";

type Contact = {
  id: string; empresa_id: string; nome: string; tipo: string; telefone: string | null;
  email: string | null; documento: string | null; status: string | null;
};
type Product = {
  id: string; empresa_id: string; nome: string; categoria: string | null;
  custo: string | null; preco: string | null; quantidade: number | null;
  sku: string | null; estoque_minimo: number | null;
};
type CatalogRow = Contact | Product;
type ListResponse<T> = { status: number; records: T[]; next: string | null };
type RecordResponse<T> = { status: number; record: T };
type Field = { key: string; label: string; required?: boolean; type?: string };
const commonFields: Field[] = [
  { key: "nome", label: "Nome", required: true },
];
const contactFields: Field[] = [
  ...commonFields,
  { key: "telefone", label: "Telefone", type: "tel" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "documento", label: "CPF/CNPJ" },
];
const productFields: Field[] = [
  ...commonFields,
  { key: "sku", label: "SKU" },
  { key: "categoria", label: "Categoria", required: true },
  { key: "custo", label: "Custo (ex.: 10.50)", required: true },
  { key: "preco", label: "Preço (ex.: 25.90)", required: true },
  { key: "estoque_minimo", label: "Estoque mínimo", type: "number" },
];
type ApiError = Error & { status?: number };
async function catalogRequest<T>(resource: "scope" | "contacts" | "products", action = "GET", input?: object, params?: Record<string, string>): Promise<T> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session?.access_token) throw new Error("Faça login novamente no EmpreendaJá.");

  // The API belongs to Supabase. The website can move to another host without changing the backend.
  const { data, error } = await supabase.functions.invoke("soph-catalog", {
    method: "POST",
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: { resource, action, ...(input ? { input } : {}), ...(params ?? {}) },
  });
  if (error) {
    const response = "context" in error ? error.context as Response | undefined : undefined;
    const status = response?.status;
    const failure = new Error(status === 409
      ? "O vínculo da sua conta com a empresa ainda precisa de aprovação."
      : status === 403 ? "Seu acesso ao Soph Gestão não está autorizado."
      : status === 503 ? "A conexão segura do Soph Gestão ainda não está disponível."
      : status === 401 ? "Sua sessão expirou. Entre novamente."
      : "Não foi possível concluir a operação.") as ApiError;
    failure.status = status;
    throw failure;
  }
  return data as T;
}
function fieldValue(row: CatalogRow | null, key: string): string {
  if (!row) return "";
  const value = (row as unknown as Record<string, string | number | null>)[key];
  return value == null ? "" : String(value);
}
function mapContact(form: FormData): object {
  return {
    nome: String(form.get("nome") ?? "").trim(),
    tipo: String(form.get("tipo") ?? "cliente"),
    telefone: String(form.get("telefone") ?? "").trim() || null,
    email: String(form.get("email") ?? "").trim() || null,
    documento: String(form.get("documento") ?? "").trim() || null,
    status: String(form.get("status") ?? "ativo"),
  };
}
function mapProduct(form: FormData): object {
  const minimum = String(form.get("estoque_minimo") ?? "").trim();
  return {
    nome: String(form.get("nome") ?? "").trim(),
    categoria: String(form.get("categoria") ?? "").trim(),
    sku: String(form.get("sku") ?? "").trim() || null,
    custo: String(form.get("custo") ?? "").trim().replace(",", "."),
    preco: String(form.get("preco") ?? "").trim().replace(",", "."),
    estoque_minimo: minimum ? Number(minimum) : null,
  };
}

export function RealCatalog({ area }: { area: Extract<ScreenName, "contatos" | "produtos-estoque"> }) {
  const isContacts = area === "contatos";
  const resource = isContacts ? "contacts" : "products";
  const fields = isContacts ? contactFields : productFields;
  const [company, setCompany] = useState("");
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [editing, setEditing] = useState<CatalogRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async (after?: string) => {
    setLoading(true); setError("");
    try {
      const scope = await catalogRequest<{ company: { id: string; name: string } }>("scope");
      setCompany(scope.company.name);
      const results = await catalogRequest<ListResponse<CatalogRow>>(resource, "GET", undefined, after ? { after } : undefined);
      setRows((prev) => after ? [...prev, ...results.records] : results.records);
      setNext(results.next);
    } catch (e) { setError(e instanceof Error ? e.message : "Erro de conexão."); }
    finally { setLoading(false); }
  }, [resource]);

  useEffect(() => { setCompany(""); setRows([]); setNext(null); setEditing(null); setCreating(false); void load(); }, [load]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const input = isContacts ? mapContact(new FormData(event.currentTarget)) : mapProduct(new FormData(event.currentTarget));
      const id = editing?.id;
      await catalogRequest<RecordResponse<CatalogRow>>(resource, id ? "PATCH" : "POST", input, id ? { id } : undefined);
      setCreating(false); setEditing(null);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Erro ao salvar."); }
    finally { setBusy(false); }
  }
  const visible = rows.filter((row) => [row.nome, isContacts ? (row as Contact).email : (row as Product).sku]
    .some((value) => String(value ?? "").toLocaleLowerCase("pt-BR").includes(search.toLocaleLowerCase("pt-BR"))));
  return <section className="sg-panel p-5 md:p-7 space-y-5" aria-label={isContacts ? "Contatos reais" : "Produtos reais"}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold text-white">{isContacts ? "Contatos" : "Produtos e estoque"}</h2>
        <p className="text-sm text-cyan-100">Empresa: {company || "Aguardando autorização"}</p></div>
      <button className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50"
        type="button" disabled={!company || loading} onClick={() => { setEditing(null); setCreating(true); }}>
        {isContacts ? "Novo contato" : "Novo produto"}
      </button>
    </div>
    <p className="text-sm text-slate-200">Dados reais do ERP. Acesso protegido por empresa. Vendas, financeiro e alterações de estoque serão integrados separadamente.</p>
    {error && <p role="alert" className="rounded-xl border border-amber-400/50 p-4 text-amber-100">{error}</p>}
    {loading && <p role="status" className="text-cyan-100">Consultando dados reais…</p>}
    {company && <input aria-label="Buscar" type="search" placeholder="Buscar por nome, e-mail ou SKU"
      className="w-full rounded-xl border border-white/20 bg-slate-900 p-3 text-white"
      value={search} onChange={(e) => setSearch(e.target.value)} />}
    {!loading && company && visible.length === 0 && <p className="text-slate-200">Nenhum registro encontrado.</p>}
    <div className="space-y-3">
      {visible.map((row) => <article key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/15 p-4">
        <div><strong className="block text-white">{row.nome}</strong><span className="text-sm text-slate-200">
          {isContacts ? `${(row as Contact).tipo} · ${(row as Contact).email ?? (row as Contact).telefone ?? "Sem contato"}`
            : `${(row as Product).sku ?? "Sem SKU"} · ${(row as Product).categoria ?? "Sem categoria"} · R$ ${(row as Product).preco ?? "0"} · Estoque: ${(row as Product).quantidade ?? 0}`}
        </span></div>
        <button type="button" className="rounded-lg border border-cyan-400/60 px-4 py-2 text-cyan-100" onClick={() => { setEditing(row); setCreating(true); }}>Editar</button>
      </article>)}
    </div>
    {next && company && <button type="button" disabled={loading} onClick={() => void load(next)}
      className="rounded-xl border border-white/30 px-5 py-3 text-white">Carregar mais</button>}
    {creating && <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 p-5">
      <h3 className="mb-4 font-semibold text-white">{editing ? "Editar registro" : "Novo cadastro"}</h3>
      <form onSubmit={(e) => void submit(e)} className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => <label key={field.key} className="grid gap-1 text-sm text-white">
          {field.label}
          <input name={field.key} type={field.type ?? "text"} step={field.type === "number" ? "1" : undefined}
            min={field.type === "number" ? 0 : undefined} defaultValue={fieldValue(editing, field.key)}
            required={field.required} maxLength={255}
            className="rounded-lg border border-white/20 bg-slate-950 p-3 text-white" />
        </label>)}
        {isContacts && <>
          <label className="grid gap-1 text-sm text-white">Tipo
            <select name="tipo" defaultValue={(editing as Contact | null)?.tipo ?? "cliente"} className="rounded-lg bg-slate-950 p-3">
              <option value="cliente">Cliente</option><option value="fornecedor">Fornecedor</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm text-white">Status
            <select name="status" defaultValue={(editing as Contact | null)?.status ?? "ativo"} className="rounded-lg bg-slate-950 p-3">
              <option value="ativo">Ativo</option><option value="em_negociacao">Em negociação</option>
            </select>
          </label>
        </>}
        <div className="flex gap-3 md:col-span-2">
          <button type="submit" disabled={busy} className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">
            {busy ? "Salvando…" : "Salvar no ERP"}
          </button>
          <button type="button" className="rounded-xl border border-white/30 px-5 py-3 text-white" onClick={() => { setCreating(false); setEditing(null); }}>Cancelar</button>
        </div>
      </form>
    </div>}
  </section>;
}
