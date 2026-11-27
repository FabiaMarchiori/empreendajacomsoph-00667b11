import { useState } from "react";
import { brl } from "./fixtures";
import { parseCents, parseQuantity, totalCents, type Line, type seedProducts } from "./demo-state";

type Draft = { sku: string; quantity: string; value: string };
export function readLines(data: FormData, catalog: typeof seedProducts): Line[] {
  const quantities = data.getAll("Quantidade do item");
  const values = data.getAll("Valor unitário");
  const lines = data.getAll("Produto do item").map((value, index) => {
    const sku = String(value);
    if (!catalog.some((product) => product.sku === sku)) throw new Error("Selecione um produto válido.");
    return {
      sku,
      quantity: parseQuantity(String(quantities[index] ?? ""), "Quantidade"),
      cents: parseCents(String(values[index] ?? ""), "Valor unitário"),
    };
  });
  if (!lines.length) throw new Error("Adicione pelo menos um item.");
  return lines;
}

export function LineItems({ catalog, initial, purchase }: { catalog: typeof seedProducts; initial?: Line[]; purchase?: boolean }) {
  const [items, setItems] = useState<Draft[]>(() => initial?.length
    ? initial.map((line) => ({ sku: line.sku, quantity: String(line.quantity), value: (line.cents / 100).toFixed(2) }))
    : [{ sku: "", quantity: "1", value: "" }]);
  function update(index: number, changes: Partial<Draft>) {
    setItems((previous) => previous.map((item, i) => i === index ? { ...item, ...changes } : item));
  }
  const validLines = items.flatMap((item) => {
    try {
      return [{ sku: item.sku, quantity: parseQuantity(item.quantity, "Quantidade"), cents: parseCents(item.value, "Valor") }];
    } catch {
      return [];
    }
  });
  return <fieldset className="sg-demo-items">
    <legend>Itens</legend>
    {items.map((item, index) => <div className="sg-demo-item" key={index}>
      <label>Produto {index + 1}<select required aria-label={`Produto ${index + 1}`} name="Produto do item" value={item.sku} onChange={(event) => {
        const sku = event.target.value;
        const product = catalog.find((p) => p.sku === sku);
        update(index, { sku, value: product ? (purchase ? product.cost : product.price).toFixed(2) : "" });
      }}><option value="">Selecione</option>{catalog.map((p) => <option key={p.sku} value={p.sku}>{p.name} · {p.sku}</option>)}</select></label>
      <label>Quantidade {index + 1}<input required name="Quantidade do item" inputMode="numeric" value={item.quantity} onChange={(e) => update(index, { quantity: e.target.value })} /></label>
      <label>Valor unitário {index + 1}<input required name="Valor unitário" inputMode="decimal" value={item.value} onChange={(e) => update(index, { value: e.target.value })} /></label>
      {items.length > 1 && <button type="button" className="sg-text-button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}>Remover item {index + 1}</button>}
    </div>)}
    <button type="button" className="sg-text-button" onClick={() => setItems((prev) => [...prev, { sku: "", quantity: "1", value: "" }])}>Adicionar item</button>
    <strong>Total: {brl.format(totalCents(validLines) / 100)}</strong>
  </fieldset>;
}
