import type { Ref } from "react";
import type { BufferGeometry, LineSegments, Mesh, ShaderMaterial } from "three";

interface ArchitectureDiagramProps {
  linesGeometry: BufferGeometry;
  linesMaterial: ShaderMaterial;
  linesRef?: Ref<LineSegments>;
  nodesGeometry: BufferGeometry;
  nodesMaterial: ShaderMaterial;
  nodesRef?: Ref<Mesh>;
}

/**
 * All four architecture diagrams: routed edges and panel furniture as one line mesh, nodes as one quad mesh
 * (see diagram-geometry.ts). Diagram content is data (diagrams.ts); nothing here is specific to a project.
 */
export function ArchitectureDiagram({ linesGeometry, linesMaterial, linesRef, nodesGeometry, nodesMaterial, nodesRef }: ArchitectureDiagramProps) {
  return (
    <>
      <lineSegments ref={linesRef} geometry={linesGeometry} material={linesMaterial} frustumCulled={false} renderOrder={2} />
      <mesh ref={nodesRef} geometry={nodesGeometry} material={nodesMaterial} frustumCulled={false} renderOrder={3} />
    </>
  );
}
