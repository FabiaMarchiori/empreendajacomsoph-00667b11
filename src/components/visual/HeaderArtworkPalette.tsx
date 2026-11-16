/** Shared presentation palette for decorative headers only; source PNGs stay intact. */
export function HeaderArtworkPalette() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter
          id="header-artwork-cool-palette"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            {/* Petrol, soft teal/cyan and cool off-white; keep original shading. */}
            <feFuncR
              type="table"
              tableValues="0.0157 0.0510 0.2039 0.5686 0.9294"
            />
            <feFuncG
              type="table"
              tableValues="0.0431 0.2078 0.4706 0.7294 0.9569"
            />
            <feFuncB
              type="table"
              tableValues="0.0824 0.2706 0.5255 0.7725 0.9647"
            />
            <feFuncA type="identity" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
