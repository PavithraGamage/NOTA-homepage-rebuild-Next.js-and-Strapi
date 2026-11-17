const GLYPHS = 'abcdefghijklmnopqrstuvwxyz';

/**
 * One frame of the nav-label scramble: characters resolve left to right as `progress` goes
 * 0 → 1; unresolved ones show a random letter. Spaces and punctuation never scramble, so the
 * label keeps its shape. Pure, so it can be tested with a fixed random source.
 */
export function scrambleFrame(text: string, progress: number, random: () => number = Math.random): string {
  const resolved = Math.floor(Math.min(1, Math.max(0, progress)) * text.length);
  return [...text]
    .map((char, index) => {
      if (index < resolved || !/[a-z]/i.test(char)) return char;
      const glyph = GLYPHS[Math.floor(random() * GLYPHS.length)] ?? 'a';
      return char === char.toUpperCase() ? glyph.toUpperCase() : glyph;
    })
    .join('');
}

/**
 * Runs the scramble on an element for `duration` ms, then restores the exact text. The
 * accessible name stays the real label throughout.
 */
export function scramble(element: HTMLElement, duration = 700): () => void {
  const text = element.textContent ?? '';
  const hadLabel = element.hasAttribute('aria-label');
  if (!hadLabel) element.setAttribute('aria-label', text);
  const start = performance.now();
  let frame = requestAnimationFrame(function tick(now) {
    const progress = (now - start) / duration;
    element.textContent = scrambleFrame(text, progress);
    if (progress < 1) frame = requestAnimationFrame(tick);
    else finish();
  });
  function finish() {
    cancelAnimationFrame(frame);
    element.textContent = text;
    if (!hadLabel) element.removeAttribute('aria-label');
  }
  return finish;
}
