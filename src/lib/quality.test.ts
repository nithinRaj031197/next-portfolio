import { describe, expect, it } from "vitest";
import { degradeTier, detectQualityTier, type QualitySignals } from "./quality";

const desktop: QualitySignals = { webgl: true, reducedMotion: false, saveData: false, width: 1440, cores: 10, memory: 8 };

describe("detectQualityTier", () => {
  it("returns none without WebGL", () => {
    expect(detectQualityTier({ ...desktop, webgl: false })).toBe("none");
  });

  it("picks high on a capable desktop", () => {
    expect(detectQualityTier(desktop)).toBe("high");
  });

  it("does not penalize browsers that hide hardware hints", () => {
    expect(detectQualityTier({ ...desktop, cores: undefined, memory: undefined })).toBe("high");
  });

  it("steps down for weaker hardware, tablets and phones", () => {
    expect(detectQualityTier({ ...desktop, cores: 4, memory: 4 })).toBe("medium");
    expect(detectQualityTier({ ...desktop, cores: 2 })).toBe("low");
    expect(detectQualityTier({ ...desktop, width: 900 })).toBe("medium");
    expect(detectQualityTier({ ...desktop, width: 390 })).toBe("low");
  });

  it("uses low when the user asks to save data", () => {
    expect(detectQualityTier({ ...desktop, saveData: true })).toBe("low");
  });

  it("caps reduced-motion users below the top tier", () => {
    expect(detectQualityTier({ ...desktop, reducedMotion: true })).toBe("medium");
    expect(detectQualityTier({ ...desktop, reducedMotion: true, width: 390 })).toBe("low");
  });

  it("honours an explicit override, even over missing WebGL", () => {
    expect(detectQualityTier({ ...desktop, webgl: false, override: "low" })).toBe("low");
  });
});

describe("degradeTier", () => {
  it("steps down one tier at a time and stops at none", () => {
    expect(degradeTier("high")).toBe("medium");
    expect(degradeTier("medium")).toBe("low");
    expect(degradeTier("low")).toBe("none");
    expect(degradeTier("none")).toBe("none");
  });
});
