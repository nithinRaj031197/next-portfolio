import { describe, expect, it } from "vitest";
import { FRAME_BUDGET, evaluateWindow } from "./frame-budget";

describe("frame budget", () => {
  it("lowers the DPR factor and reports a decline when frames are slow", () => {
    const slow = evaluateWindow(30, 1);
    expect(slow.declined).toBe(true);
    expect(slow.factor).toBeCloseTo(1 - FRAME_BUDGET.declineStep, 6);
  });

  it("never goes below zero, and keeps declining so the tier can step down", () => {
    let factor = 1;
    for (let i = 0; i < 6; i++) {
      const decision = evaluateWindow(10, factor);
      expect(decision.declined).toBe(true);
      factor = decision.factor;
    }
    expect(factor).toBe(0);
  });

  it("gives DPR back gradually when there is headroom, and stops at 1", () => {
    let factor = 0.3;
    for (let i = 0; i < 10; i++) factor = evaluateWindow(60, factor).factor;
    expect(factor).toBe(1);
    expect(evaluateWindow(60, 1)).toEqual({ factor: 1, declined: false });
  });

  it("leaves a healthy-but-not-perfect frame rate alone", () => {
    expect(evaluateWindow(50, 0.66)).toEqual({ factor: 0.66, declined: false });
  });
});
