import { describe, expect, it } from 'vitest';
import { fadeFrame, releaseTarget, wrap } from './fade-carousel';

describe('wrap', () => {
  it('loops indices in both directions', () => {
    expect([-1, 0, 4, 5, 6].map((index) => wrap(index, 5))).toEqual([4, 0, 4, 0, 1]);
  });
});

describe('fadeFrame', () => {
  it('shows one slide at rest', () => {
    expect(fadeFrame(2, 5)).toEqual({ below: 2, above: 3, fade: 0 });
  });

  it('fades the next slide in over the current one', () => {
    expect(fadeFrame(2.25, 5)).toEqual({ below: 2, above: 3, fade: 0.25 });
  });

  it('wraps from the last slide to the first', () => {
    expect(fadeFrame(4.5, 5)).toEqual({ below: 4, above: 0, fade: 0.5 });
  });

  it('dragging back from the first slide fades it out over the last', () => {
    expect(fadeFrame(-0.3, 5)).toEqual({ below: 4, above: 0, fade: expect.closeTo(0.7, 6) as number });
  });
});

describe('releaseTarget', () => {
  it('completes a slow drag past half way', () => {
    expect(releaseTarget(1, 1.6, -240, 900)).toBe(2);
    expect(releaseTarget(1, 0.4, 240, 900)).toBe(0);
  });

  it('fades back after a slow drag short of half way', () => {
    expect(releaseTarget(1, 1.4, -160, 900)).toBe(1);
  });

  it('completes a quick flick, however short', () => {
    expect(releaseTarget(1, 1.1, -40, 150)).toBe(2);
  });

  it('ignores a tap', () => {
    expect(releaseTarget(3, 3, 0, 80)).toBe(3);
  });
});
