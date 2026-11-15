import acessorios from "@/assets/importadoras/category-headers/01-acessorios-lacos.png";
import bijuterias from "@/assets/importadoras/category-headers/02-bijuterias-semijoias.png";
import bolsas from "@/assets/importadoras/category-headers/03-bolsas-mochilas-malas.png";
import cosmeticos from "@/assets/importadoras/category-headers/04-cosmeticos-perfumes.png";
import embalagens from "@/assets/importadoras/category-headers/05-embalagens-personalizadas.png";
import games from "@/assets/importadoras/category-headers/06-games-eletronicos.png";
import garrafas from "@/assets/importadoras/category-headers/07-garrafas-marmitas.png";
import maquiagem from "@/assets/importadoras/category-headers/08-maquiagem.png";
import papelaria from "@/assets/importadoras/category-headers/09-papelaria-fofa.png";
import peliculas from "@/assets/importadoras/category-headers/10-peliculas-capinhas.png";
import perucas from "@/assets/importadoras/category-headers/11-perucas-cabelos.png";
import presentes from "@/assets/importadoras/category-headers/12-presentes-pelucias.png";
import unhas from "@/assets/importadoras/category-headers/13-unhas-cilios.png";
import utilidades from "@/assets/importadoras/category-headers/14-utilidades-domesticas.png";

// Visual metadata only. Slugs, records and counts remain owned by the existing hooks.
const headers = [
  {
    slugs: ["acessorios-e-lacos"],
    title: "Acessórios e Laços",
    image: acessorios,
    width: 2172,
    height: 724,
  },
  {
    slugs: ["bijouterias-e-semijoias", "bijuterias-e-semijoias"],
    title: "Bijouterias e Semijoias",
    image: bijuterias,
    width: 1448,
    height: 1086,
  },
  {
    slugs: [
      "mochilas-e-malas",
      "bolsas-mochilas-e-malas",
      "bolsas-mochilas-malas",
    ],
    title: "Bolsas, Mochilas e Malas",
    image: bolsas,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["cosmeticos-e-perfumes"],
    title: "Cosméticos e Perfumes",
    image: cosmeticos,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["embalagens-personalizadas"],
    title: "Embalagens Personalizadas",
    image: embalagens,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["games-e-eletronicos", "games-e-acessorios", "eletronicos"],
    title: "Games e Eletrônicos",
    image: games,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["garrafas-e-marmitas"],
    title: "Garrafas e Marmitas",
    image: garrafas,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["maquiagem"],
    title: "Maquiagem",
    image: maquiagem,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["papelaria-fofa"],
    title: "Papelaria Fofa",
    image: papelaria,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["peliculas-e-capinhas"],
    title: "Películas e Capinhas",
    image: peliculas,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["perucas-e-cabelos"],
    title: "Perucas e Cabelos",
    image: perucas,
    width: 1448,
    height: 1086,
  },
  {
    slugs: ["presentes-e-pelucias"],
    title: "Presentes e Pelúcias",
    image: presentes,
    width: 1983,
    height: 793,
  },
  {
    slugs: ["unhas-e-cilios"],
    title: "Unhas e Cílios",
    image: unhas,
    width: 1890,
    height: 832,
  },
  {
    slugs: ["utilidades-domesticas"],
    title: "Utilidades Domésticas",
    image: utilidades,
    width: 1983,
    height: 793,
  },
];

export function getCategoryHeader(slug: string | undefined) {
  return headers.find((header) => header.slugs.includes(slug ?? ""));
}
