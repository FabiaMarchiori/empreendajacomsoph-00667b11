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
  // Acessórios e Laços
  { id: "1", name: "WM Importadora", category: "Acessórios e Laços", categorySlug: "acessorios-lacos", logo: "", whatsapp: "5511999990001", instagram: "wmimportadora", address: "R. 25 de Março, 100 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Importadora especializada em acessórios e laços." },
  { id: "2", name: "LaçoBrasil Import", category: "Acessórios e Laços", categorySlug: "acessorios-lacos", logo: "", whatsapp: "5511999990002", instagram: "lacobrasil", address: "R. 25 de Março, 200 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Laços e acessórios importados com preços competitivos." },
  { id: "3", name: "AccessFashion Import", category: "Acessórios e Laços", categorySlug: "acessorios-lacos", logo: "", whatsapp: "5511999990003", instagram: "accessfashion", address: "R. 25 de Março, 300 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Grande variedade de acessórios para todas as idades." },

  // Bijuterias e Semijoias
  { id: "4", name: "Glamour Import", category: "Bijuterias e Semijoias", categorySlug: "bijuterias-semijoias", logo: "", whatsapp: "5511999990004", instagram: "glamourimport", address: "R. 25 de Março, 400 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Bijuterias e semijoias importadas." },
  { id: "5", name: "Style Bijoux", category: "Bijuterias e Semijoias", categorySlug: "bijuterias-semijoias", logo: "", whatsapp: "5511999990005", instagram: "stylebijoux", address: "R. 25 de Março, 500 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Tendências em bijuterias finas." },

  // Cosméticos e Perfumes
  { id: "6", name: "BeautyImport SP", category: "Cosméticos e Perfumes", categorySlug: "cosmeticos-perfumes", logo: "", whatsapp: "5511999990006", instagram: "beautyimportsp", address: "R. 25 de Março, 600 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Cosméticos e perfumes importados." },

  // Eletrônicos
  { id: "7", name: "TechImport SP", category: "Eletrônicos", categorySlug: "eletronicos", logo: "", whatsapp: "5511999990007", instagram: "techimportsp", address: "R. Santa Ifigênia, 100 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Eletrônicos e acessórios importados." },
  { id: "8", name: "Mega Eletrônicos", category: "Eletrônicos", categorySlug: "eletronicos", logo: "", whatsapp: "5511999990008", instagram: "megaeletronicos", address: "R. 25 de Março, 800 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Importadora de eletrônicos com amplo catálogo." },

  // Embalagens Personalizadas
  { id: "9", name: "PackImport", category: "Embalagens Personalizadas", categorySlug: "embalagens-personalizadas", logo: "", whatsapp: "5511999990009", instagram: "packimport", address: "R. 25 de Março, 900 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Embalagens personalizadas importadas." },

  // Games e Acessórios
  { id: "10", name: "GameWorld Import", category: "Games e Acessórios", categorySlug: "games-acessorios", logo: "", whatsapp: "5511999990010", instagram: "gameworldimport", address: "R. 25 de Março, 1000 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Games e acessórios gamer importados." },

  // Garrafas e Marmitas
  { id: "11", name: "BottleImport SP", category: "Garrafas e Marmitas", categorySlug: "garrafas-marmitas", logo: "", whatsapp: "5511999990011", instagram: "bottleimport", address: "R. 25 de Março, 1100 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Garrafas e marmitas importadas." },

  // Maquiagem
  { id: "12", name: "MakeUp Import", category: "Maquiagem", categorySlug: "maquiagem", logo: "", whatsapp: "5511999990012", instagram: "makeupimport", address: "R. 25 de Março, 1200 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Maquiagens e acessórios importados." },

  // Mochilas e Malas
  { id: "13", name: "BagImport", category: "Mochilas e Malas", categorySlug: "mochilas-malas", logo: "", whatsapp: "5511999990013", instagram: "bagimport", address: "R. 25 de Março, 1300 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Mochilas e malas importadas." },

  // Papelaria Fofa
  { id: "14", name: "PaperWorld", category: "Papelaria Fofa", categorySlug: "papelaria-fofa", logo: "", whatsapp: "5511999990014", instagram: "paperworld", address: "R. 25 de Março, 1400 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Papelaria fofa e criativa importada." },

  // Películas e Capinhas
  { id: "15", name: "CapaImport", category: "Películas e Capinhas", categorySlug: "peliculas-capinhas", logo: "", whatsapp: "5511999990015", instagram: "capaimport", address: "R. 25 de Março, 1500 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Películas e capinhas importadas." },

  // Perucas e Cabelos
  { id: "16", name: "HairImport SP", category: "Perucas e Cabelos", categorySlug: "perucas-cabelos", logo: "", whatsapp: "5511999990016", instagram: "hairimportsp", address: "R. 25 de Março, 1600 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Perucas e cabelos importados." },

  // Presentes e Pelúcias
  { id: "17", name: "Gift Center", category: "Presentes e Pelúcias", categorySlug: "presentes-pelucias", logo: "", whatsapp: "5511999990017", instagram: "giftcenter", address: "R. 25 de Março, 1700 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Presentes e pelúcias importados." },

  // Unhas e Cílios
  { id: "18", name: "NailImport SP", category: "Unhas e Cílios", categorySlug: "unhas-cilios", logo: "", whatsapp: "5511999990018", instagram: "nailimportsp", address: "R. 25 de Março, 1800 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Unhas e cílios importados." },

  // Utilidades Domésticas
  { id: "19", name: "Utillar Import", category: "Utilidades Domésticas", categorySlug: "utilidades-domesticas", logo: "", whatsapp: "5511999990019", instagram: "utillarimport", address: "R. 25 de Março, 1900 - São Paulo/SP", mapUrl: "https://maps.google.com", description: "Utilidades domésticas importadas." },
];
