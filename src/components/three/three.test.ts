import { Box3, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { FISH_LENGTH, createFishGeometry } from "./fish-geometry";
import { angleDelta, bankFromYawRate, positiveMod, wobble } from "./swim";

describe("fish geometry", () => {
  const geometry = createFishGeometry(24, 10);

  it("is one merged mesh with the attributes the shader needs", () => {
    for (const name of ["position", "normal", "color", "aFlap"]) expect(geometry.getAttribute(name)).toBeDefined();
    expect(geometry.index).toBeNull();
  });

  it("is elongated: nose at +X, tail fin behind the body, thin in Z", () => {
    const box = new Box3().setFromBufferAttribute(geometry.getAttribute("position") as never);
    const size = box.getSize(new Vector3());
    expect(box.max.x).toBeCloseTo(FISH_LENGTH / 2, 1);
    expect(box.min.x).toBeLessThan(-FISH_LENGTH / 2);
    // The box includes the dorsal and tail fins, so this is the whole animal, not just the body.
    expect(size.x).toBeGreaterThan(size.y * 2.5);
    expect(size.z).toBeLessThan(size.y);
  });

  it("only flaps on fins, never on the body", () => {
    const flaps = geometry.getAttribute("aFlap");
    let max = 0;
    for (let i = 0; i < flaps.count; i++) max = Math.max(max, flaps.getX(i));
    expect(max).toBeGreaterThan(0.5);
    expect(max).toBeLessThanOrEqual(1);
  });

  it("scales cheaply: fewer segments means fewer vertices", () => {
    expect(createFishGeometry(12, 8).getAttribute("position").count).toBeLessThan(geometry.getAttribute("position").count);
  });
});

describe("swim helpers", () => {
  it("wraps angles across the +-PI seam", () => {
    expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(0.2, 6);
    expect(angleDelta(-Math.PI + 0.1, Math.PI - 0.1)).toBeCloseTo(-0.2, 6);
  });

  it("positiveMod handles negatives", () => {
    expect(positiveMod(-0.25, 1)).toBeCloseTo(0.75, 6);
  });

  it("banks into turns and clamps", () => {
    expect(bankFromYawRate(0.2)).toBeLessThan(0);
    expect(bankFromYawRate(-0.2)).toBeGreaterThan(0);
    expect(bankFromYawRate(10)).toBe(-0.35);
  });

  it("wobble is deterministic, bounded and never constant", () => {
    expect(wobble(12.3, 0.2, 1)).toBe(wobble(12.3, 0.2, 1));
    const samples = Array.from({ length: 200 }, (_, i) => wobble(i * 0.7, 0.2, 1));
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0.8 - 1e-9);
    expect(Math.max(...samples)).toBeLessThanOrEqual(1.2 + 1e-9);
    expect(new Set(samples.map((v) => v.toFixed(3))).size).toBeGreaterThan(50);
  });
});
