import { describe, expect, it } from "vitest";
import {
  COMPACT_PROFILE,
  INTENT_KEYS,
  KEYFRAMES,
  SECTION_IDS,
  applyCompactProfile,
  applyTabletProfile,
  blendedPosition,
  createIntent,
  createReducedMotionIntent,
  dampIntent,
  readabilityFactor,
  sampleIntent,
  sectionPosition,
  STATIC_FISH_POSE,
  STATIC_FISH_POSE_COMPACT,
  writeSectionStates,
} from "./choreography";

const anchors = [0, 900, 1800, 2700, 5500, 6500, 7300, 8100];

describe("sectionPosition", () => {
  it("maps the reading line to a continuous section position", () => {
    expect(sectionPosition(-50, anchors)).toBe(0);
    expect(sectionPosition(450, anchors)).toBeCloseTo(0.5, 6);
    expect(sectionPosition(900, anchors)).toBeCloseTo(1, 6);
    expect(sectionPosition(4100, anchors)).toBeCloseTo(3.5, 6);
    expect(sectionPosition(99999, anchors)).toBe(SECTION_IDS.length);
  });

  it("is monotonic", () => {
    let previous = -1;
    for (let line = 0; line <= 8100; line += 25) {
      const position = sectionPosition(line, anchors);
      expect(position).toBeGreaterThanOrEqual(previous);
      previous = position;
    }
  });
});

describe("sampleIntent", () => {
  const out = createIntent();

  it("returns a section's keyframe exactly at its own integer position", () => {
    for (let i = 0; i < SECTION_IDS.length; i++) {
      sampleIntent(i, out);
      for (const key of INTENT_KEYS) expect(out[key]).toBeCloseTo(KEYFRAMES[SECTION_IDS[i]!][key], 9);
    }
  });

  it("arrives exactly at the next keyframe at the boundary and holds the last one", () => {
    sampleIntent(3, out);
    for (const key of INTENT_KEYS) expect(out[key]).toBeCloseTo(KEYFRAMES.projects[key], 9);
    sampleIntent(SECTION_IDS.length + 2, out);
    for (const key of INTENT_KEYS) expect(out[key]).toBeCloseTo(KEYFRAMES.contact[key], 9);
  });

  it("never snaps: no field jumps by more than a sliver between neighbouring positions", () => {
    const a = createIntent();
    const b = createIntent();
    const step = 0.01;
    for (let p = 0; p < SECTION_IDS.length - 1; p += step) {
      sampleIntent(p, a);
      sampleIntent(p + step, b);
      for (const key of INTENT_KEYS) {
        const range = Math.max(...SECTION_IDS.map((id) => KEYFRAMES[id][key])) - Math.min(...SECTION_IDS.map((id) => KEYFRAMES[id][key]));
        // Smoothstep's steepest slope is 1.5x linear.
        expect(Math.abs(b[key] - a[key])).toBeLessThanOrEqual(range * step * 1.6 + 1e-9);
      }
    }
  });
});

describe("keyframes", () => {
  it("keeps the camera to centimetre-scale offsets", () => {
    for (const id of SECTION_IDS) {
      const k = KEYFRAMES[id];
      expect(Math.abs(k.cameraX)).toBeLessThanOrEqual(0.15);
      expect(Math.abs(k.cameraY)).toBeLessThanOrEqual(0.15);
      expect(Math.abs(k.cameraZ)).toBeLessThanOrEqual(0.25);
    }
  });

  it("keeps the fish out of the hero text column and deeper in About than in the hero", () => {
    const hero = KEYFRAMES.hero;
    expect(hero.laneX - hero.orbitX).toBeGreaterThan(hero.columnEnd);
    expect(KEYFRAMES.about.depth).toBeGreaterThan(hero.depth);
    expect(KEYFRAMES.skills.fishIntensity).toBeLessThan(KEYFRAMES.about.fishIntensity);
    expect(KEYFRAMES.skills.parallax).toBeLessThan(KEYFRAMES.hero.parallax);
  });

  it("brings structure in toward projects and squares it up in architecture", () => {
    expect(KEYFRAMES.projects.structure).toBeGreaterThan(KEYFRAMES.about.structure);
    expect(KEYFRAMES.architecture.alignment).toBe(1);
    expect(KEYFRAMES.architecture.particleDensity).toBeLessThan(KEYFRAMES.projects.particleDensity);
  });
});

describe("blendedPosition", () => {
  const blend = 800;

  it("holds a section's intent through its body and eases across each boundary, centred on it", () => {
    expect(blendedPosition(10, anchors, blend)).toBe(0);
    expect(blendedPosition(900 - 401, anchors, blend)).toBe(0); // hero is held until half a blend before the seam
    expect(blendedPosition(900, anchors, blend)).toBeCloseTo(0.5, 6);
    expect(blendedPosition(900 + 401, anchors, blend)).toBe(1);
    expect(blendedPosition(1800, anchors, blend)).toBeCloseTo(1.5, 6);
  });

  it("keeps Projects fully active through its whole body, however long it is", () => {
    // Projects spans 2700..5500: untouched from 405px after its top to 405px before its end.
    expect(blendedPosition(2700 + 401, anchors, blend)).toBe(3);
    expect(blendedPosition(5500 - 401, anchors, blend)).toBe(3);
    expect(blendedPosition(5500, anchors, blend)).toBeCloseTo(3.5, 6);
  });

  it("never lets a transition overlap its neighbours in short sections", () => {
    const short = [0, 200, 400, 600];
    expect(blendedPosition(200, short, 800)).toBeCloseTo(0.5, 6);
    expect(blendedPosition(300, short, 800)).toBeCloseTo(1, 6);
  });

  it("is continuous and monotonic across the whole page", () => {
    let previous = 0;
    for (let line = 0; line <= 8100; line += 10) {
      const value = blendedPosition(line, anchors, blend);
      expect(value).toBeGreaterThanOrEqual(previous - 1e-9);
      expect(value - previous).toBeLessThan(0.05);
      previous = value;
    }
    expect(previous).toBe(SECTION_IDS.length - 1);
  });
});

describe("gallery intent", () => {
  it("forms the project gallery only in Projects", () => {
    for (const id of SECTION_IDS) expect(KEYFRAMES[id].gallery).toBe(id === "projects" ? 1 : 0);
    expect(KEYFRAMES.projects.detail).toBe(1);
  });

  it("sends the fish behind the panels during Projects, with a small orbit", () => {
    const projects = KEYFRAMES.projects;
    // Panels sit at depths ~12-16; the fish's nearest point must be behind them.
    expect(projects.depth - projects.orbitDepth).toBeGreaterThan(16.5);
    expect(projects.orbitX).toBeLessThan(KEYFRAMES.hero.orbitX);
    expect(projects.fishIntensity).toBeLessThan(KEYFRAMES.hero.fishIntensity);
  });

  it("eases the gallery in across the Experience / Projects seam, so planes become panels without a pop", () => {
    const a = createIntent();
    sampleIntent(2.0, a);
    expect(a.gallery).toBe(0);
    sampleIntent(2.5, a); // halfway across the Experience / Projects seam
    expect(a.gallery).toBeCloseTo(0.5, 6);
    sampleIntent(2.999, a);
    expect(a.gallery).toBeGreaterThan(0.99);
  });
});

describe("reduced motion composition", () => {
  it("is the hero lane plus a calm, understated gallery", () => {
    const intent = createReducedMotionIntent();
    expect(intent.laneX).toBe(KEYFRAMES.hero.laneX);
    expect(intent.gallery).toBeGreaterThan(0.5);
    expect(intent.detail).toBeLessThan(0.5);
  });

  it("places the static fish upper right, clear of the text column and well above the at-a-glance card", () => {
    expect(STATIC_FISH_POSE.ndcX).toBeGreaterThan(KEYFRAMES.hero.columnEnd + 0.3);
    expect(STATIC_FISH_POSE.ndcY).toBeGreaterThan(0.5);
  });

  it("rests the phone-sized fish in the band above the heading, below the header bar", () => {
    expect(STATIC_FISH_POSE_COMPACT.ndcY).toBeGreaterThan(0.7);
    expect(STATIC_FISH_POSE_COMPACT.ndcY).toBeLessThan(0.86);
  });
});

describe("section states", () => {
  it("reports one active section and per-section progress", () => {
    const states = SECTION_IDS.map(() => ({ progress: 0, active: false }));
    writeSectionStates(2.4, states);
    expect(states.map((s) => s.active)).toEqual([false, false, true, false, false, false, false]);
    expect(states[0]!.progress).toBe(1);
    expect(states[2]!.progress).toBeCloseTo(0.4, 6);
    expect(states[3]!.progress).toBe(0);
  });
});

describe("tablet profile", () => {
  it("keeps the composition but reduces WebGL dominance", () => {
    const intent = createIntent(KEYFRAMES.projects);
    applyTabletProfile(intent);
    expect(intent.fishIntensity).toBeLessThan(KEYFRAMES.projects.fishIntensity);
    expect(intent.detail).toBeLessThan(KEYFRAMES.projects.detail);
    expect(intent.depth).toBe(KEYFRAMES.projects.depth);
    expect(intent.gallery).toBe(KEYFRAMES.projects.gallery);
  });
});

describe("compact profile and readability", () => {
  it("pushes the fish back, dims it and calms the camera on small screens", () => {
    const intent = createIntent(KEYFRAMES.hero);
    applyCompactProfile(intent);
    expect(intent.depth).toBeCloseTo(KEYFRAMES.hero.depth * COMPACT_PROFILE.depth, 6);
    expect(intent.fishIntensity).toBeLessThan(KEYFRAMES.hero.fishIntensity);
    expect(intent.parallax).toBeLessThan(KEYFRAMES.hero.parallax);
    expect(intent.orbitX).toBeLessThan(KEYFRAMES.hero.orbitX);
    // Phones: the fish rides in the empty band under the header.
    expect(intent.laneY).toBeGreaterThanOrEqual(0.7);
    // Full-width column: the fish is dimmed wherever it is on a phone.
    expect(readabilityFactor(0.7, intent)).toBeLessThan(0.5);
    expect(readabilityFactor(-0.7, intent)).toBeLessThan(0.5);
  });

  it("dims the fish inside a dense text column and not outside it", () => {
    const experience = KEYFRAMES.experience;
    expect(readabilityFactor(0, experience)).toBeLessThan(0.5);
    expect(readabilityFactor(0.95, experience)).toBeGreaterThan(0.9);
    expect(readabilityFactor(0.8, KEYFRAMES.hero)).toBeCloseTo(1, 6);
    expect(readabilityFactor(-0.4, KEYFRAMES.hero)).toBeLessThan(0.6);
  });

  it("damps toward a target without overshooting", () => {
    const current = createIntent(KEYFRAMES.hero);
    const target = createIntent(KEYFRAMES.skills);
    for (let i = 0; i < 600; i++) dampIntent(current, target, 1.4, 1 / 60);
    for (const key of INTENT_KEYS) expect(current[key]).toBeCloseTo(target[key], 3);
  });
});
