import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Quaternion, Vector3, type LineSegments, type Mesh, type Points } from "three";
import { COMPACT_MAX_WIDTH, TABLET_MAX_WIDTH, smoothstep } from "@/lib/choreography";
import { PROJECT_IDS, STATIC_PROJECT_FOCUS, dominantProject } from "@/lib/project-focus";
import type { QualitySettings } from "@/lib/quality";
import { liveIntent, sceneState } from "@/lib/scene-state";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { DiagramFlow } from "./DiagramFlow";
import { ProjectPanel } from "./ProjectPanel";
import { buildWorldGeometry } from "./diagram-geometry";
import { PANEL_COUNT, createWorldMaterials, createWorldUniforms } from "./shaders";
import { computePanelPose, createPanelPose, type LayoutInput } from "./layout";

/** One trip of the pulse around its loop: slow on purpose. */
const FLOW_PERIOD_SECONDS = 12;
const Y_AXIS = new Vector3(0, 1, 0);

interface ProjectWorldProps {
  settings: QualitySettings;
  animate: boolean;
}

/**
 * The spatial project gallery. It is a visual echo of the HTML case studies, not a second source of content: it
 * knows only each project's id, panel pose and a data-driven diagram, and follows the reader through the existing
 * `[data-project]` articles via `sceneState.projects`. The canvas is aria-hidden and takes no pointer input.
 *
 * Outside Projects (`liveIntent.gallery` = 0) the same four objects are Phase 4's faint planes; entering Projects
 * blends them into the gallery, so planes gain structure instead of being replaced.
 */
export function ProjectWorld({ settings, animate }: ProjectWorldProps) {
  const { projectWorld } = settings;
  const aspect = useThree((state) => state.size.width / state.size.height);
  const compact = useThree((state) => state.size.width < COMPACT_MAX_WIDTH);
  const tablet = useThree((state) => state.size.width >= COMPACT_MAX_WIDTH && state.size.width < TABLET_MAX_WIDTH);
  const dpr = useThree((state) => state.viewport.dpr);
  const canvas = useThree((state) => state.gl.domElement);

  const uniforms = useMemo(() => createWorldUniforms(), []);
  const geometry = useMemo(
    () => buildWorldGeometry({ essentialOnly: projectWorld.essentialOnly, pulses: projectWorld.pulses }),
    [projectWorld.essentialOnly, projectWorld.pulses],
  );
  const materials = useMemo(() => createWorldMaterials(uniforms), [uniforms]);

  useEffect(
    () => () => {
      geometry.bodies.dispose();
      geometry.lines.dispose();
      geometry.nodes.dispose();
      geometry.pulses?.dispose();
    },
    [geometry],
  );
  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);
  useEffect(() => {
    uniforms.uPixelRatio.value = dpr;
  }, [uniforms, dpr]);

  const bodies = useRef<Mesh>(null);
  const lines = useRef<LineSegments>(null);
  const nodes = useRef<Mesh>(null);
  const pulses = useRef<Points>(null);

  // Allocated once: nothing in the frame loop creates objects.
  const scratch = useMemo(
    () => ({
      pose: createPanelPose(),
      position: new Vector3(),
      scale: new Vector3(),
      rotation: new Quaternion(),
      time: 0,
      shownProject: -2,
      shownGallery: -1,
      scene: null as HTMLElement | null,
      input: {
        position: 0, weights: STATIC_PROJECT_FOCUS.weights, gallery: 0, alignment: 0, structure: 0, textDensity: 0, detail: 0, aspect: 1, compact: false, looseVisibility: 1,
      } satisfies LayoutInput as LayoutInput,
    }),
    [],
  );

  // The scene wrapper carries test/debug state (`data-active-project`, `data-gallery`); looked up once.
  useEffect(() => {
    scratch.scene = canvas.closest<HTMLElement>("[data-scene]");
  }, [canvas, scratch]);

  useFrame((_, delta) => {
    const focus = animate ? sceneState.projects : STATIC_PROJECT_FOCUS;
    const input = scratch.input;
    input.position = focus.position;
    input.weights = focus.weights;
    input.gallery = liveIntent.gallery;
    input.alignment = liveIntent.alignment;
    input.structure = liveIntent.structure;
    input.textDensity = liveIntent.textDensity;
    input.detail = liveIntent.detail;
    input.aspect = aspect;
    input.compact = compact;
    input.tablet = tablet;
    input.isStatic = !animate;
    input.opacityScale = !animate && compact ? 0.5 : compact || tablet ? 0.7 : 1;
    // The low tier shows nothing until the gallery forms: no ambient planes to pay for.
    input.looseVisibility = projectWorld.fill ? 1 : 0;

    let visibleOpacity = 0;
    const matrices = uniforms.uPanelMatrix.value;
    const states = uniforms.uPanelState.value;
    for (let i = 0; i < PANEL_COUNT; i++) {
      const pose = scratch.pose;
      computePanelPose(i, input, pose);
      matrices[i]!.compose(scratch.position.set(pose.x, pose.y, pose.z), scratch.rotation.setFromAxisAngle(Y_AXIS, pose.yaw), scratch.scale.set(pose.width, pose.height, 1));
      states[i]!.set(pose.opacity, pose.active, pose.detail, 0);
      visibleOpacity = Math.max(visibleOpacity, pose.opacity);
    }

    const gallery = smoothstep(0, 1, liveIntent.gallery);
    uniforms.uGallery.value = gallery;
    uniforms.uFill.value = projectWorld.fill ? 1 : 0;
    uniforms.uFadeLeft.value = tablet ? 1 : 0;
    uniforms.uStatic.value = animate ? 0 : 1;
    if (animate && projectWorld.pulses) {
      scratch.time += Math.min(delta, 0.05);
      uniforms.uPhase.value = (scratch.time / FLOW_PERIOD_SECONDS) % 1;
    }

    // Skip the draw calls entirely when there is nothing to see.
    const diagramsVisible = gallery * liveIntent.detail > 0.01;
    if (bodies.current) bodies.current.visible = visibleOpacity > 0.003;
    if (lines.current) lines.current.visible = diagramsVisible;
    if (nodes.current) nodes.current.visible = diagramsVisible;
    if (pulses.current) pulses.current.visible = diagramsVisible && animate;

    // Writes only (never reads layout): expose which project is in focus, for tests and debugging.
    const active = animate && gallery > 0.3 ? dominantProject(focus.weights) : -1;
    if (scratch.scene && active !== scratch.shownProject) {
      scratch.shownProject = active;
      scratch.scene.dataset.activeProject = active >= 0 ? PROJECT_IDS[active]! : "";
    }
    // Compared as an integer tenth so no string is built unless the label actually changes.
    const galleryTenths = Math.round(gallery * 10);
    if (scratch.scene && galleryTenths !== scratch.shownGallery) {
      scratch.shownGallery = galleryTenths;
      scratch.scene.dataset.gallery = (galleryTenths / 10).toFixed(1);
    }
  });

  return (
    <>
      <ProjectPanel ref={bodies} geometry={geometry.bodies} material={materials.body} />
      <ArchitectureDiagram
        linesGeometry={geometry.lines}
        linesMaterial={materials.lines}
        linesRef={lines}
        nodesGeometry={geometry.nodes}
        nodesMaterial={materials.nodes}
        nodesRef={nodes}
      />
      {geometry.pulses && <DiagramFlow ref={pulses} geometry={geometry.pulses} material={materials.pulses} />}
    </>
  );
}
