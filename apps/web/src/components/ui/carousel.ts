/**
 * Looping for a scroll-snap strip with a copy of the last slide at the start and a copy of the
 * first at the end: [last′, 1, 2, …, n, 1′]. Positions are in slide widths from the left.
 */

/** The real slide shown at strip index `index` (the copies map to the slides they show). */
export function loopedIndex(index: number, count: number): number {
  return (((index - 1) % count) + count) % count;
}

/**
 * Where to jump once the strip rests on a copy: to the real slide it shows, which looks the
 * same, so the jump is invisible. Null while between slides or on a real slide.
 */
export function loopJump(position: number, count: number): number | null {
  const index = Math.round(position);
  if (Math.abs(position - index) > 0.01) return null;
  if (index === 0) return count;
  if (index === count + 1) return 1;
  return null;
}
