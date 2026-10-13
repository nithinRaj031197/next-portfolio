import type { Ref } from "react";
import type { BufferGeometry, Mesh, ShaderMaterial } from "three";

interface ProjectPanelProps {
  geometry: BufferGeometry;
  material: ShaderMaterial;
  ref?: Ref<Mesh>;
}

/**
 * The four panel bodies (graphite glass, hairline border) as one mesh. Per-panel transform and state come from the
 * shared uniform block, so there is one draw call for the whole row instead of one per panel.
 */
export function ProjectPanel({ geometry, material, ref }: ProjectPanelProps) {
  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={1} />;
}
