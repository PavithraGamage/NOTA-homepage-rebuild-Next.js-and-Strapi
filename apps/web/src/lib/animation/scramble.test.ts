import { describe, expect, it } from 'vitest';
import { scrambleFrame } from './scramble';

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
