import { describe, expect, it } from 'vitest';
import { ease, TIME_CONSTANT, wheelPixels } from './smooth-scroll';

describe('ease', () => {
  it('closes the same share of the gap per unit of time, whatever the frame rate', () => {
    // Two 60 Hz frames and one 30 Hz frame end in the same place.
    const sixty = ease(ease(0, 300, 1000 / 60), 300, 1000 / 60);
    const thirty = ease(0, 300, 2000 / 60);
    expect(sixty).toBeCloseTo(thirty, 6);
  });

  it('covers about 63% of the way in one time constant, like the reference', () => {
    expect(ease(0, 300, TIME_CONSTANT)).toBeCloseTo(300 * (1 - Math.exp(-1)), 6);
  });

  it('settles exactly on the target once it is within half a pixel', () => {
    expect(ease(299.6, 300, 1)).toBe(300);
    expect(ease(299, 300, 1)).toBeLessThan(300);
    expect(ease(100, 100, 16)).toBe(100);
  });

  it('works scrolling up as well as down', () => {
    const next = ease(500, 200, 16);
    expect(next).toBeLessThan(500);
    expect(next).toBeGreaterThan(200);
  });
});

describe('wheelPixels', () => {
  it('passes pixel deltas through', () => {
    expect(wheelPixels({ deltaY: 120, deltaMode: 0 }, 900)).toBe(120);
  });

  it('converts line and page deltas to pixels', () => {
    expect(wheelPixels({ deltaY: 3, deltaMode: 1 }, 900)).toBeCloseTo(50, 6);
    expect(wheelPixels({ deltaY: -1, deltaMode: 2 }, 900)).toBe(-900);
  });
});
