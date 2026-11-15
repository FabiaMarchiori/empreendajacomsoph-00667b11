import artwork from "@/assets/importadoras/hub-artwork-source.png";
import categories from "@/assets/importadoras/icons/categorias-camadas.png";
import stores from "@/assets/importadoras/icons/importadoras-loja.png";
import heart from "@/assets/importadoras/icons/favoritos-salvos-coracao.png";
import explore from "@/assets/importadoras/icons/explorar-categorias-cesta.png";
import search from "@/assets/importadoras/icons/buscar-importadoras-lupa.png";
import favorites from "@/assets/importadoras/icons/meus-favoritos-coracao-estrela.png";
import back from "@/assets/importadoras/icons/voltar-central-seta.png";

// Retain the approved layout frames. Only the image inside each frame changes.
const icons = {
  categories: { src: categories, width: 95, height: 94, scale: 1.25 },
  stores: { src: stores, width: 112, height: 103, scale: 1.2 },
  heart: { src: heart, width: 95, height: 95, scale: 1.2 },
  explore: { src: explore, width: 146, height: 125, scale: 1.15 },
  search: { src: search, width: 137, height: 129, scale: 1.17 },
  favorites: { src: favorites, width: 146, height: 114, scale: 1.09 },
  back: { src: back, width: 137, height: 114, scale: 1.125 },
} as const;

export function ImportadorasArtwork({
  kind,
}: {
  kind: keyof typeof icons | "header";
}) {
  if (kind !== "header") {
    const icon = icons[kind];
    return (
      <span
        className="importadoras-icon-frame"
        aria-hidden="true"
        style={{ aspectRatio: `${icon.width} / ${icon.height}` }}
      >
        <img
          className="importadoras-icon"
          src={icon.src}
          alt=""
          draggable={false}
          width={1254}
          height={1254}
          style={{ width: `${icon.scale * 100}%` }}
        />
      </span>
    );
  }

  // The approved header illustration is intentionally unchanged.
  const [x, y, width, height] = [916, 60, 485, 224];
  return (
    <span
      className="importadoras-artwork importadoras-artwork--header"
      aria-hidden="true"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <img
        src={artwork}
        alt=""
        draggable={false}
        style={{
          width: `${(1422 / width) * 100}%`,
          height: `${(1106 / height) * 100}%`,
          left: `${(-x / width) * 100}%`,
          top: `${(-y / height) * 100}%`,
        }}
      />
    </span>
  );
}
