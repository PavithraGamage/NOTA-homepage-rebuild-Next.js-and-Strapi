import { describe, expect, it } from 'vitest';
import { REVEAL, revealFrame, scrambleFrame } from './scramble';

const zero = () => 0; // always picks "a"

describe('scrambleFrame', () => {
  it('scrambles every letter at the start and keeps spaces and punctuation', () => {
    expect(scrambleFrame("Who it's for", 0, zero)).toBe("Aaa aa'a aaa");
  });

  it('resolves characters left to right', () => {
    expect(scrambleFrame('About', 0.4, zero)).toBe('Abaaa');
  });

  it('returns the exact label when done, even past 1', () => {
    expect(scrambleFrame('Inside the box', 1, zero)).toBe('Inside the box');
    expect(scrambleFrame('Inside the box', 3, zero)).toBe('Inside the box');
  });

  it('keeps the case of each letter', () => {
    expect(scrambleFrame('AbC', 0, zero)).toBe('AaA');
  });
});

describe('revealFrame', () => {
  const { flicker, fade, spread } = REVEAL;

  it('keeps a letter hidden until the wave reaches it', () => {
    expect(revealFrame(0, 0, 9)).toEqual({ base: 0, ghost: 1, scrambling: true });
    expect(revealFrame(spread / 9 - 1, 1, 9)).toEqual({ base: 0, ghost: 0, scrambling: false });
  });

  it('flickers a random stand-in, then cross-fades it into the letter', () => {
    expect(revealFrame(flicker - 1, 0, 9)).toEqual({ base: 0, ghost: 1, scrambling: true });
    const mid = revealFrame(flicker + fade / 2, 0, 9);
    expect(mid.scrambling).toBe(false);
    expect(mid.base).toBeCloseTo(0.75); // ease-out: past half way at the midpoint
    expect(mid.base + mid.ghost).toBeCloseTo(1);
  });

  it('shows every letter once the wave has passed', () => {
    const end = spread + flicker + fade;
    for (const index of [0, 8]) expect(revealFrame(end, index, 9)).toEqual({ base: 1, ghost: 0, scrambling: false });
  });

  it('crosses a line in the same time whatever its length', () => {
    const last = (count: number) => revealFrame(((count - 1) * spread) / count, count - 1, count);
    expect(last(9).scrambling).toBe(true);
    expect(last(17).scrambling).toBe(true);
  });
});
