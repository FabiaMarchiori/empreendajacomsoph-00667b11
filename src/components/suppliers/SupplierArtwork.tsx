import artwork from "@/assets/suppliers/central-artwork-source.png";

// Only decorative illustrations are exposed from the approved reference.
// Labels, cards, controls and navigation remain real application elements.
const regions = {
  heading: [125, 10, 92, 92],
  banner: [1005, 0, 485, 174],
  importadoras: [140, 303, 171, 141],
  bolsas: [842, 293, 184, 156],
  feminina: [139, 520, 93, 98],
  masculina: [603, 520, 108, 98],
  infantil: [1072, 525, 111, 92],
  intima: [140, 644, 93, 89],
  fitness: [606, 644, 108, 90],
  localizacao: [145, 756, 94, 91],
  sul: [1075, 756, 99, 90],
  semijoias: [136, 878, 107, 88],
  fabricantes: [615, 875, 93, 91],
} as const;

type ArtworkKind = keyof typeof regions;

export function SupplierArtwork({ kind }: { kind: ArtworkKind }) {
  const [x, y, width, height] = regions[kind];
  return (
    <span
      className={`supplier-artwork supplier-artwork--${kind}`}
      aria-hidden="true"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <img
        src={artwork}
        alt=""
        draggable={false}
        style={{
          width: `${(1536 / width) * 100}%`,
          height: `${(1024 / height) * 100}%`,
          left: `${(-x / width) * 100}%`,
          top: `${(-y / height) * 100}%`,
        }}
      />
    </span>
  );
}
