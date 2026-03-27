export interface Supplier {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  logo: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  mapUrl?: string;
  instagramPreview?: string;
  description?: string;
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  count: number;
}

export const categories: Category[] = [
  { name: "Acessórios e Laços", slug: "acessorios-lacos", image: "/categories/acessorios-lacos.png", count: 12 },
  { name: "Bijuterias e Semijoias", slug: "bijuterias-semijoias", image: "/categories/bijuterias-semijoias.png", count: 18 },
  { name: "Cosméticos e Perfumes", slug: "cosmeticos-perfumes", image: "/categories/cosmeticos-perfumes.png", count: 9 },
  { name: "Eletrônicos", slug: "eletronicos", image: "/categories/eletronicos.png", count: 15 },
  { name: "Embalagens Personalizadas", slug: "embalagens-personalizadas", image: "/categories/embalagens-personalizadas.png", count: 8 },
  { name: "Games e Acessórios", slug: "games-acessorios", image: "/categories/games-acessorios.png", count: 14 },
  { name: "Garrafas e Marmitas", slug: "garrafas-marmitas", image: "/categories/garrafas-marmitas.png", count: 11 },
  { name: "Maquiagem", slug: "maquiagem", image: "/categories/maquiagem.png", count: 7 },
  { name: "Mochilas e Malas", slug: "mochilas-malas", image: "/categories/mochilas-malas.png", count: 10 },
  { name: "Papelaria Fofa", slug: "papelaria-fofa", image: "/categories/papelaria-fofa.png", count: 6 },
  { name: "Películas e Capinhas", slug: "peliculas-capinhas", image: "/categories/peliculas-capinhas.png", count: 8 },
  { name: "Perucas e Cabelos", slug: "perucas-cabelos", image: "/categories/perucas-cabelos.png", count: 5 },
  { name: "Presentes e Pelúcias", slug: "presentes-pelucias", image: "/categories/presentes-pelucias.png", count: 10 },
  { name: "Unhas e Cílios", slug: "unhas-cilios", image: "/categories/unhas-cilios.png", count: 9 },
  { name: "Utilidades Domésticas", slug: "utilidades-domesticas", image: "/categories/utilidades-domesticas.png", count: 12 },
];

export const suppliers: Supplier[] = [
  // Brinquedos
  { id: "1", name: "WM Importadora", category: "Brinquedos", categorySlug: "brinquedos", logo: "", whatsapp: "5511999990001", instagram: "wmimportadora", address: "R. 25 de Março, 100 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Importadora especializada em brinquedos educativos e de lazer." },
  { id: "2", name: "ToyBrasil Import", category: "Brinquedos", categorySlug: "brinquedos", logo: "", whatsapp: "5511999990002", instagram: "toybrasil", address: "R. 25 de Março, 200 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Brinquedos importados com preços competitivos." },
  { id: "3", name: "KidsToys Import", category: "Brinquedos", categorySlug: "brinquedos", logo: "", whatsapp: "5511999990003", instagram: "kidstoys", address: "R. 25 de Março, 300 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Grande variedade de brinquedos para todas as idades." },

  // Eletrônicos
  { id: "4", name: "TechImport SP", category: "Eletrônicos", categorySlug: "eletronicos", logo: "", whatsapp: "5511999990004", instagram: "techimportsp", address: "R. Santa Ifigênia, 100 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Eletrônicos e acessórios importados." },
  { id: "5", name: "Mega Eletrônicos", category: "Eletrônicos", categorySlug: "eletronicos", logo: "", whatsapp: "5511999990005", instagram: "megaeletronicos", address: "R. 25 de Março, 500 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Importadora de eletrônicos com amplo catálogo." },
  { id: "6", name: "Digital Import", category: "Eletrônicos", categorySlug: "eletronicos", logo: "", whatsapp: "5511999990006", instagram: "digitalimport", address: "R. 25 de Março, 600 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Smartphones, acessórios e gadgets importados." },

  // Decoração
  { id: "7", name: "Casa & Decor Import", category: "Decoração", categorySlug: "decoracao", logo: "", whatsapp: "5511999990007", instagram: "casadecor", address: "R. 25 de Março, 700 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Itens de decoração importados para casa e escritório." },
  { id: "8", name: "Mundo Decor", category: "Decoração", categorySlug: "decoracao", logo: "", whatsapp: "5511999990008", instagram: "mundodecor", address: "R. 25 de Março, 800 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Decoração moderna e sofisticada." },

  // Utilidades
  { id: "9", name: "Utillar Import", category: "Utilidades", categorySlug: "utilidades", logo: "", whatsapp: "5511999990009", instagram: "utillarimport", address: "R. 25 de Março, 900 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Utilidades domésticas importadas." },
  { id: "10", name: "PratiK Import", category: "Utilidades", categorySlug: "utilidades", logo: "", whatsapp: "5511999990010", instagram: "pratikimport", address: "R. 25 de Março, 1000 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Produtos práticos para o dia a dia." },

  // Papelaria
  { id: "11", name: "PaperWorld", category: "Papelaria", categorySlug: "papelaria", logo: "", whatsapp: "5511999990011", instagram: "paperworld", address: "R. 25 de Março, 1100 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Papelaria importada e criativa." },

  // Bijuterias
  { id: "12", name: "Glamour Import", category: "Bijuterias", categorySlug: "bijuterias", logo: "", whatsapp: "5511999990012", instagram: "glamourimport", address: "R. 25 de Março, 1200 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Bijuterias e acessórios importados." },
  { id: "13", name: "Style Bijoux", category: "Bijuterias", categorySlug: "bijuterias", logo: "", whatsapp: "5511999990013", instagram: "stylebijoux", address: "R. 25 de Março, 1300 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Tendências em bijuterias finas." },

  // Bolsas e Malas
  { id: "14", name: "BagImport", category: "Bolsas e Malas", categorySlug: "bolsas-malas", logo: "", whatsapp: "5511999990014", instagram: "bagimport", address: "R. 25 de Março, 1400 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Bolsas, mochilas e malas importadas." },

  // Cosméticos
  { id: "15", name: "BeautyImport SP", category: "Cosméticos", categorySlug: "cosmeticos", logo: "", whatsapp: "5511999990015", instagram: "beautyimportsp", address: "R. 25 de Março, 1500 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Cosméticos e maquiagens importadas." },

  // Ferramentas
  { id: "16", name: "ToolBox Import", category: "Ferramentas", categorySlug: "ferramentas", logo: "", whatsapp: "5511999990016", instagram: "toolboximport", address: "R. 25 de Março, 1600 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Ferramentas e equipamentos importados." },

  // Presentes
  { id: "17", name: "Gift Center", category: "Presentes", categorySlug: "presentes", logo: "", whatsapp: "5511999990017", instagram: "giftcenter", address: "R. 25 de Março, 1700 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Presentes criativos e personalizados." },

  // Pet Shop
  { id: "18", name: "PetImport SP", category: "Pet Shop", categorySlug: "pet-shop", logo: "", whatsapp: "5511999990018", instagram: "petimportsp", address: "R. 25 de Março, 1800 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Produtos pet importados." },

  // Fitness
  { id: "19", name: "FitImport", category: "Fitness", categorySlug: "fitness", logo: "", whatsapp: "5511999990019", instagram: "fitimport", address: "R. 25 de Março, 1900 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Acessórios fitness e esportivos." },
];
