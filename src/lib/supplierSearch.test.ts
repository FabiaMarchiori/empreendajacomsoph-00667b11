import { describe, it, expect } from "vitest";
import { matchesSupplier } from "./supplierSearch";
const s = { nome_loja: "Dafu Importadora", codigo_fornecedor: "F012" };
describe("matchesSupplier", () => {
  it("nome parcial", () => expect(matchesSupplier(s, "afu")).toBe(true));
  it("código exato", () => expect(matchesSupplier(s, "F012")).toBe(true));
  it("código sem zeros", () => expect(matchesSupplier(s, "f12")).toBe(true));
  it("não confunde código", () => expect(matchesSupplier(s, "F013")).toBe(false));
});
