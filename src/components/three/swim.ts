import { MathUtils } from "three";

export const positiveMod = (value: number, modulus: number) => ((value % modulus) + modulus) % modulus;

/** Smallest signed difference between two angles, in (-PI, PI]. */
export function angleDelta(from: number, to: number) {
  return positiveMod(to - from + Math.PI, Math.PI * 2) - Math.PI;
}

/**
 * Roll for a given turn rate. A fish banks into the turn: when yaw increases (a left turn seen from above)
 * the left side dips, which is a negative rotation about the forward (+X) axis in fish space.
 */
export function bankFromYawRate(yawRate: number, strength = 0.9, limit = 0.35) {
  return MathUtils.clamp(-yawRate * strength, -limit, limit);
}

/**
 * Small deterministic variation: a sum of incommensurate sines. Never random, so visual tests are repeatable,
 * but it does not repeat on a visible period. Returns roughly 1 ± amount.
 */
export function wobble(time: number, amount: number, seed = 0) {
  return 1 + amount * (0.6 * Math.sin(time * 0.13 + seed) + 0.4 * Math.sin(time * 0.31 + seed * 2.3 + 1));
}
