import artwork from "@/assets/importadoras/hub-artwork-source.png";

// Expose only the approved illustrations. All text, controls and totals are React.
const regions = {
  header: [916, 60, 485, 224],
  categories: [155, 314, 95, 94],
  stores: [585, 307, 112, 103],
  heart: [1023, 314, 95, 95],
  explore: [139, 660, 146, 125],
  search: [788, 656, 137, 129],
  favorites: [138, 832, 146, 114],
  back: [792, 827, 137, 114],
} as const;

export function ImportadorasArtwork({ kind }: { kind: keyof typeof regions }) {
  const [x, y, width, height] = regions[kind];
  return (
    <span
      className={`importadoras-artwork importadoras-artwork--${kind}`}
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
