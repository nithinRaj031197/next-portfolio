/**
 * Static CSS atmosphere: the whole visual for the `none` tier, and the backdrop the WebGL canvas
 * (which is transparent) composites over for every other tier. Server-rendered, so it paints with the HTML.
 */
export function AtmosphereBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20"
      style={{
        background: [
          "radial-gradient(ellipse 70% 55% at 75% -5%, rgba(94,234,212,0.07), transparent 65%)",
          "radial-gradient(ellipse 60% 50% at 5% 105%, rgba(38,72,112,0.2), transparent 65%)",
          "linear-gradient(180deg, #0c1117 0%, #07090c 70%)",
        ].join(", "),
      }}
    />
  );
}
