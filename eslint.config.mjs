import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Three.js objects (uniforms, materials, transforms) are mutable by design and are updated in
    // useFrame outside React's render phase. The compiler's immutability rule does not model that.
    files: ["src/components/three/**/*.{ts,tsx}"],
    rules: { "react-hooks/immutability": "off" },
  },
  globalIgnores([".next/**", "out/**", "next-env.d.ts", "node_modules/**"]),
]);
