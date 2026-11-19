import { describe, expect, it } from 'vitest';
import { loopedIndex, loopJump } from './carousel';

describe('loopedIndex', () => {
  it('maps the real slides to 0…n-1', () => {
    expect([1, 2, 3, 4].map((index) => loopedIndex(index, 4))).toEqual([0, 1, 2, 3]);
  });

  it('maps the copies to the slides they show', () => {
    expect(loopedIndex(0, 4)).toBe(3);
    expect(loopedIndex(5, 4)).toBe(0);
  });
});

describe('loopJump', () => {
  it('jumps from the copy of the last slide to the last slide', () => {
    expect(loopJump(0, 4)).toBe(4);
  });

  it('jumps from the copy of the first slide to the first slide', () => {
    expect(loopJump(5, 4)).toBe(1);
  });

  it('stays put on real slides', () => {
    expect([1, 2, 3, 4].map((position) => loopJump(position, 4))).toEqual([null, null, null, null]);
  });

  it('waits while the strip is still between slides', () => {
    expect(loopJump(0.3, 4)).toBeNull();
    expect(loopJump(4.8, 4)).toBeNull();
  });

  it('tolerates sub-pixel resting positions', () => {
    expect(loopJump(5.004, 4)).toBe(1);
  });
});
