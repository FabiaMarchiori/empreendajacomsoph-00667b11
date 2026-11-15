import header from "@/assets/bolsas/header-bolsas-mochilas-malas.png";
import suppliers from "@/assets/bolsas/fornecedores-sacola-rosa.png";
import premium from "@/assets/bolsas/nicho-premium-coroa.png";
import all from "@/assets/bolsas/todos-fornecedores-sacolas.png";
import heart from "@/assets/importadoras/icons/favoritos-salvos-coracao.png";
import search from "@/assets/importadoras/icons/buscar-importadoras-lupa.png";
import favorites from "@/assets/importadoras/icons/meus-favoritos-coracao-estrela.png";
import back from "@/assets/importadoras/icons/voltar-central-seta.png";

const artwork = {
  header: { src: header, width: 1536, height: 1024 },
  suppliers: { src: suppliers, width: 1320, height: 1192 },
  premium: { src: premium, width: 1536, height: 1024 },
  all: { src: all, width: 1448, height: 1086 },
  heart: { src: heart, width: 1254, height: 1254 },
  search: { src: search, width: 1254, height: 1254 },
  favorites: { src: favorites, width: 1254, height: 1254 },
  back: { src: back, width: 1254, height: 1254 },
};

export function BolsasArtwork({ kind }: { kind: keyof typeof artwork }) {
  const image = artwork[kind];
  return (
    <span
      className={`bolsas-artwork bolsas-artwork--${kind}`}
      aria-hidden="true"
    >
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt=""
        draggable={false}
      />
    </span>
  );
}
