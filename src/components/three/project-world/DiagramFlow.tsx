import type { Ref } from "react";
import type { BufferGeometry, Points, ShaderMaterial } from "three";

interface DiagramFlowProps {
  geometry: BufferGeometry;
  material: ShaderMaterial;
  ref?: Ref<Points>;
}

/** The travelling pulses. Timing lives in the vertex shader, so animating them costs one uniform per frame. */
export function DiagramFlow({ geometry, material, ref }: DiagramFlowProps) {
  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={4} />;
}
