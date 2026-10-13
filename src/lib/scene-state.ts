import { KEYFRAMES, SECTION_ELEMENT_ID, SECTION_IDS, blendedPosition, copyIntent, createIntent, sectionPosition, writeSectionStates, type SceneIntent } from "./choreography";
import { PROJECT_IDS, createProjectFocus, writeProjectFocus } from "./project-focus";

/**
 * Mutable state shared with the render loop. Deliberately not React state: the loop reads it every frame, and
 * routing scroll or pointer through React would re-render for no visual benefit.
 */
export const sceneState = {
  /** Continuous position: integer part is the section index, fraction is progress through it. */
  position: 0,
  /** Position used to sample the intent: holds each section's keyframe and eases only near the boundaries. */
  intentPosition: 0,
  /** Which project article the reader is in (continuous), with approach/active/departure weights. */
  projects: createProjectFocus(),
  /** Page scroll progress, 0..1. */
  scroll: 0,
  /** Pointer in NDC, -1..1 (y up). */
  pointerX: 0,
  pointerY: 0,
  sections: SECTION_IDS.map((id) => ({ id, progress: 0, active: id === "hero" })),
};

/** Smoothed intent the scene components read. Written only by SceneDirector. */
export const liveIntent: SceneIntent = createIntent();

export function resetSceneState() {
  sceneState.position = 0;
  sceneState.intentPosition = 0;
  sceneState.projects.position = 0;
  sceneState.projects.weights.forEach((_, i, weights) => (weights[i] = i === 0 ? 1 : 0));
  sceneState.scroll = 0;
  sceneState.pointerX = 0;
  sceneState.pointerY = 0;
  writeSectionStates(0, sceneState.sections);
  copyIntent(liveIntent, KEYFRAMES.hero);
}

/** Share of the viewport height, from the top, where "the current section" is read. */
const READING_LINE = 0.35;
/** Length of a section-to-section transition, in viewport heights. */
const BLEND_VIEWPORTS = 0.9;

export interface SceneInputOptions {
  scroll: boolean;
  pointer: boolean;
}

/**
 * Attaches passive listeners and returns a cleanup. Layout is read only when the page is resized or its content
 * changes (ResizeObserver); the scroll handler itself does arithmetic on cached numbers.
 */
export function trackSceneState({ scroll, pointer }: SceneInputOptions): () => void {
  const cleanups: Array<() => void> = [];

  if (scroll) {
    const anchors: number[] = new Array(SECTION_IDS.length + 1).fill(0);
    const projectCenters: number[] = PROJECT_IDS.map(() => 0);
    let scrollable = 1;

    const measure = () => {
      const viewport = window.innerHeight;
      SECTION_IDS.forEach((id, i) => {
        const element = document.getElementById(SECTION_ELEMENT_ID[id]);
        anchors[i] = element ? element.getBoundingClientRect().top + window.scrollY : (anchors[i] ?? 0);
      });
      PROJECT_IDS.forEach((id, i) => {
        const element = document.querySelector(`[data-project="${id}"]`);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        projectCenters[i] = rect.top + window.scrollY + rect.height / 2;
      });
      const documentHeight = document.documentElement.scrollHeight;
      scrollable = Math.max(documentHeight - viewport, 1);
      // At the very bottom the reading line sits at documentHeight - (1 - READING_LINE) * viewport.
      anchors[SECTION_IDS.length] = Math.max(documentHeight - (1 - READING_LINE) * viewport, (anchors[SECTION_IDS.length - 1] ?? 0) + 1);
    };

    const update = () => {
      const y = window.scrollY;
      sceneState.scroll = Math.min(Math.max(y / scrollable, 0), 1);
      const line = y + READING_LINE * window.innerHeight;
      sceneState.position = sectionPosition(line, anchors);
      sceneState.intentPosition = blendedPosition(line, anchors, BLEND_VIEWPORTS * window.innerHeight);
      writeProjectFocus(line, projectCenters, sceneState.projects);
      writeSectionStates(sceneState.position, sceneState.sections);
    };

    const observer = new ResizeObserver(() => {
      measure();
      update();
    });
    observer.observe(document.body);
    measure();
    update();
    window.addEventListener("scroll", update, { passive: true });
    cleanups.push(() => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    });
  }

  if (pointer) {
    const onMove = (event: PointerEvent) => {
      sceneState.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointerY = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    cleanups.push(() => window.removeEventListener("pointermove", onMove));
  }

  return () => {
    cleanups.forEach((cleanup) => cleanup());
    resetSceneState();
  };
}
