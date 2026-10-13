import { describe, expect, it } from "vitest";
import { projects } from "@/content/projects";
import { PROJECT_IDS, createProjectFocus, dominantProject, projectPosition, projectWeights, writeProjectFocus } from "./project-focus";

const centers = [3200, 4500, 5900, 7400];

describe("project ids", () => {
  it("match the semantic content, in the same order", () => {
    expect([...PROJECT_IDS]).toEqual(projects.map((project) => project.id));
  });
});

describe("projectPosition", () => {
  it("interpolates the reading line between article centres and clamps outside", () => {
    expect(projectPosition(0, centers)).toBe(0);
    expect(projectPosition(3200, centers)).toBe(0);
    expect(projectPosition(3850, centers)).toBeCloseTo(0.5, 6);
    expect(projectPosition(5900, centers)).toBeCloseTo(2, 6);
    expect(projectPosition(99999, centers)).toBe(3);
  });
});

describe("projectWeights", () => {
  const weights = [0, 0, 0, 0];

  it("sums to 1 everywhere and favours the nearest project", () => {
    for (let p = 0; p <= 3; p += 0.05) {
      projectWeights(p, weights);
      expect(weights.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
      expect(weights.indexOf(Math.max(...weights))).toBe(Math.min(Math.round(p), 3) === Math.round(p) ? Math.round(p) : weights.indexOf(Math.max(...weights)));
    }
  });

  it("has a wide plateau: a project stays dominant for most of the way toward its neighbour", () => {
    let dominantSteps = 0;
    const steps = 100;
    for (let i = 0; i < steps; i++) {
      projectWeights(1 + i / steps, weights);
      if (dominantProject(weights) !== -1) dominantSteps++;
    }
    // Some project clearly leads for at least ~60% of the span between two projects (the rest is the blend).
    expect(dominantSteps / steps).toBeGreaterThan(0.6);
  });

  it("never flips the dominant project on a few pixels of scroll", () => {
    const focus = createProjectFocus();
    let previous = -2;
    let flips = 0;
    for (let line = 3000; line <= 7700; line += 4) {
      writeProjectFocus(line, centers, focus);
      const dominant = dominantProject(focus.weights);
      if (dominant !== previous && dominant !== -1) {
        if (previous !== -2 && previous !== -1) flips++;
        previous = dominant;
      }
    }
    // Four projects: three hand-overs and nothing else, so no flicker back and forth.
    expect(flips).toBe(3);
  });

  it("changes smoothly: neighbouring scroll positions give nearly the same weights", () => {
    const a = createProjectFocus();
    const b = createProjectFocus();
    for (let line = 3000; line < 7700; line += 4) {
      writeProjectFocus(line, centers, a);
      writeProjectFocus(line + 4, centers, b);
      a.weights.forEach((w, i) => expect(Math.abs(w - b.weights[i]!)).toBeLessThan(0.02));
    }
  });
});
