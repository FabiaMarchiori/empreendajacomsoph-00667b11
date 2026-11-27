import { useState } from "react";
import { contacts, products, sales, movements } from "./fixtures";

export type Line = { sku: string; quantity: number; cents: number };
export const demoDate = "27/11/2026";
export const stockStatus = (quantity: number, minimum: number) =>
  quantity === 0 ? "Sem estoque" : quantity <= minimum ? "Estoque baixo" : "Em estoque";
export const totalCents = (lines: Line[]) => lines.reduce((sum, line) => sum + line.quantity * line.cents, 0);
export const seedProducts = products.map((product) => ({ ...product, cost: Math.round(product.price * 60) / 100, minimum: 9 }));
export const seedSales = sales.map((sale) => {
  const sku = products.find((product) => product.name === sale.product)?.sku;
  const cents = Math.round(sale.value * 100);
  const unit = Math.floor(cents / sale.items);
  const remainder = cents % sale.items;
  const lines: Line[] = sku ? [
    { sku, quantity: sale.items - remainder, cents: unit },
    ...(remainder ? [{ sku, quantity: remainder, cents: unit + 1 }] : []),
  ] : [];
  return { ...sale, lines };
});
export type Purchase = { id: string; supplier: string; date: string; lines: Line[] };
export type Entry = typeof movements[number] & {
  id: string;
  kind: "Receita" | "Despesa" | "A pagar" | "A receber";
  dueDate: string;
};
export const seedEntries: Entry[] = movements.map((entry, index) => ({
  ...entry, id: `entry-${index}`, kind: entry.value > 0 ? "Receita" : "Despesa", dueDate: "",
}));
export function useDemoState() {
  const [people, setPeople] = useState(contacts);
  const [catalog, setCatalog] = useState(seedProducts);
  const [orders, setOrders] = useState(seedSales);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [entries, setEntries] = useState(seedEntries);
  return { people, setPeople, catalog, setCatalog, orders, setOrders, purchases, setPurchases, entries, setEntries };
}
export type DemoState = ReturnType<typeof useDemoState>;

export function parseCents(raw: string, label: string, allowZero = false) {
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(raw)) throw new Error(`Informe um valor válido em ${label}.`);
  const cents = Math.round(Number(raw.replace(",", ".")) * 100);
  if (!allowZero && cents === 0) throw new Error(`${label} precisa ser maior que zero.`);
  return cents;
}

export function parseQuantity(raw: string, label: string, allowZero = false) {
  if (!/^\d{1,6}$/.test(raw) || (!allowZero && Number(raw) === 0)) {
    throw new Error(`Informe uma quantidade inteira válida em ${label}.`);
  }
  return Number(raw);
}

export function changeStock(catalog: typeof seedProducts, lines: Line[], direction: 1 | -1) {
  return catalog.map((product) => {
    const qty = product.qty + direction * lines.filter((line) => line.sku === product.sku)
      .reduce((sum, line) => sum + line.quantity, 0);
    if (qty < 0) throw new Error(`Estoque insuficiente para ${product.name}.`);
    return { ...product, qty, status: stockStatus(qty, product.minimum) };
  });
}

export function financeDelta(entries: Entry[]) {
  const received = (list: Entry[]) => list.filter((e) => e.status === "Recebido" || e.status === "Concluído").reduce((sum, e) => sum + Math.max(e.value, 0), 0);
  const paid = (list: Entry[]) => list.filter((e) => e.status === "Pago").reduce((sum, e) => sum + Math.abs(e.value), 0);
  const receivables = entries.filter((e) => e.status === "Pendente" && e.kind === "A receber");
  return {
    received: received(entries) - received(seedEntries),
    paid: paid(entries) - paid(seedEntries),
    receivable: receivables.reduce((sum, e) => sum + e.value, 0),
    receivableCount: receivables.length,
    payable: entries.filter((e) => e.status === "Pendente" && e.kind === "A pagar").reduce((sum, e) => sum + Math.abs(e.value), 0),
  };
}
