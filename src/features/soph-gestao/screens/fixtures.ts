import bag from "@/assets/importadoras/categories/03-bolsas-mochilas-malas.png";
import perfume from "@/assets/importadoras/categories/04-cosmeticos-perfumes.png";
import brushes from "@/assets/importadoras/categories/08-maquiagem.png";
import electronics from "@/assets/importadoras/categories/06-games-eletronicos.png";
import stationery from "@/assets/importadoras/categories/09-papelaria-fofa.png";

export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const contacts = [
  { name: "Ana Martins", phone: "(11) 99988-4455", status: "Ativo", kind: "Cliente" },
  { name: "Bruna Ribeiro", phone: "(11) 98877-3344", status: "Ativo", kind: "Cliente" },
  { name: "Carla Silva", phone: "(11) 97766-2211", status: "Ativo", kind: "Cliente" },
  { name: "Fernanda Melo", phone: "(11) 96655-7788", status: "Em negociação", kind: "Cliente" },
  { name: "Juliana Gomes", phone: "(11) 95544-6677", status: "Ativo", kind: "Cliente" },
  { name: "Ana Ferreira", phone: "(11) 98765-4321", status: "Ativo", kind: "Cliente" },
  { name: "Fornecedor ABC", phone: "(11) 90000-0001", status: "Ativo", kind: "Fornecedor" },
  { name: "Vitrine de Acessórios", phone: "(11) 90000-0002", status: "Em negociação", kind: "Fornecedor" },
  { name: "Papelaria Exemplo", phone: "(11) 90000-0003", status: "Ativo", kind: "Fornecedor" },
].map((contact) => ({
  ...contact,
  document: "00.000.000/0000-00",
  email: contact.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, ".") + "@example.com",
}));

export const products = [
  { name: "Bolsa Transversal", sku: "BOL-001", group: "Moda e Acessórios", qty: 32, price: 89.90, image: bag },
  { name: "Kit Pincéis Premium", sku: "KIT-004", group: "Beleza e Cosméticos", qty: 7, price: 49.90, image: brushes },
  { name: "Perfume Feminino 100ml", sku: "PERF-010", group: "Beleza e Cosméticos", qty: 4, price: 129.90, image: perfume },
  { name: "Fone Bluetooth", sku: "ELT-015", group: "Eletrônicos e Games", qty: 0, price: 199.90, image: electronics },
  { name: "Caderno Decorado A5", sku: "PAP-021", group: "Papelaria e Presentes", qty: 58, price: 24.90, image: stationery },
  { name: "Bolsa de Viagem", sku: "BOL-027", group: "Moda e Acessórios", qty: 3, price: 149.90, image: bag },
].map((product) => ({ ...product, status: product.qty === 0 ? "Sem estoque" : product.qty < 10 ? "Estoque baixo" : "Em estoque" }));

export const sales = [
  { id: "V-0128", date: "27/11/2026", customer: "Ana Martins", items: 3, value: 299.70, payment: "Cartão", status: "Concluída", product: "Bolsa Transversal" },
  { id: "V-0127", date: "26/11/2026", customer: "Bruna Ribeiro", items: 2, value: 159.80, payment: "PIX", status: "Concluída", product: "Kit Pincéis Premium" },
  { id: "V-0126", date: "25/11/2026", customer: "Carla Silva", items: 5, value: 489.50, payment: "Cartão", status: "Em andamento", product: "Perfume Feminino 100ml" },
  { id: "V-0125", date: "24/11/2026", customer: "Fernanda Melo", items: 1, value: 129.90, payment: "Boleto", status: "Aguardando pgto", product: "Perfume Feminino 100ml" },
  { id: "V-0124", date: "24/11/2026", customer: "Juliana Gomes", items: 4, value: 349.60, payment: "PIX", status: "Concluída", product: "Caderno Decorado A5" },
  { id: "V-0123", date: "23/11/2026", customer: "Ana Ferreira", items: 1, value: 199.90, payment: "PIX", status: "Concluída", product: "Fone Bluetooth" },
];

export const movements = [
  { date: "27/11/2026", name: "Venda nº V-0128", category: "Receitas", value: 299.70, status: "Concluído" },
  { date: "26/11/2026", name: "Compra de produtos", category: "Estoque", value: -1250, status: "Pago" },
  { date: "25/11/2026", name: "Aluguel da loja", category: "Estrutura", value: -2800, status: "Pendente" },
  { date: "24/11/2026", name: "Venda nº V-0125", category: "Receitas", value: 129.90, status: "Concluído" },
  { date: "23/11/2026", name: "Marketing digital", category: "Marketing", value: -450, status: "Pago" },
];
export const due = [
  { date: "28/11/2026", name: "Fornecedor ABC", value: 1250, status: "Vence amanhã" },
  { date: "30/11/2026", name: "Energia elétrica", value: 380, status: "Vence em 3 dias" },
  { date: "02/12/2026", name: "Internet", value: 129.90, status: "Vence em 5 dias" },
  { date: "05/12/2026", name: "Aluguel da loja", value: 2800, status: "Vence em 8 dias" },
];
