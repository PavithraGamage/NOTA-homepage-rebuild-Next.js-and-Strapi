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
 * Heading reveal timings, measured frame by frame on the reference at 1440×900: a wave crosses
 * each line in about 0.6s; at its letter, a random lowercase letter flickers for ~70ms, then fades
 * out over 250ms (ease-out) while the real letter fades in. Each line starts 50ms after the last.
 */
export const REVEAL = { spread: 600, flicker: 70, fade: 250, lineGap: 50 } as const;

const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

export type RevealState = { base: number; ghost: number; scrambling: boolean };

/** Opacity of letter `index` of `count` (and of its random stand-in), `elapsed` ms into its line. */
export function revealFrame(elapsed: number, index: number, count: number): RevealState {
  const on = (index * REVEAL.spread) / count;
  const crossfade = on + REVEAL.flicker;
  if (elapsed < on) return { base: 0, ghost: 0, scrambling: false };
  if (elapsed < crossfade) return { base: 0, ghost: 1, scrambling: true };
  const progress = easeOut(Math.min(1, (elapsed - crossfade) / REVEAL.fade));
  return { base: progress, ghost: 1 - progress, scrambling: false };
}

/**
 * Reveals block-level `lines` inside `heading` letter by letter after `delay` ms (see REVEAL).
 * The real text is never split, so kerning and the accessible name stay intact: it is made
 * transparent while an aria-hidden overlay draws each letter, and a random stand-in, at the
 * position the browser measured for it. At the end the overlay goes and the text shows, in
 * exactly the same place. Returns a function that ends it at once.
 */
export function scrambleIn(heading: HTMLElement, lines: HTMLElement[], delay = 0): () => void {
  const layer = document.createElement('span');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;user-select:none';
  const positioned = getComputedStyle(heading).position !== 'static';
  if (!positioned) heading.style.position = 'relative';
  heading.append(layer);
  const origin = layer.getBoundingClientRect();

  const place = (char: string, left: number, top: number) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.cssText = `position:absolute;left:${left}px;top:${top}px;white-space:pre;opacity:0`;
    layer.append(span);
    return span;
  };

  const range = document.createRange();
  const letters = lines.flatMap((line, lineIndex) => {
    const text = line.firstChild;
    if (!(text instanceof Text)) return [];
    const top = line.getBoundingClientRect().top - origin.top;
    const chars = Array.from(text.data);
    let offset = 0;
    return chars.map((char, index) => {
      range.setStart(text, offset);
      range.setEnd(text, (offset += char.length));
      const left = range.getBoundingClientRect().left - origin.left;
      return {
        base: place(char, left, top),
        ghost: place(char, left, top),
        index,
        count: chars.length,
        lag: lineIndex * REVEAL.lineGap,
      };
    });
  });

  for (const line of lines) line.style.opacity = '0';

  const start = performance.now() + delay;
  let frame = requestAnimationFrame(function tick(now) {
    let done = true;
    for (const letter of letters) {
      const state = revealFrame(now - start - letter.lag, letter.index, letter.count);
      letter.base.style.opacity = String(state.base);
      letter.ghost.style.opacity = String(state.ghost);
      if (state.scrambling) letter.ghost.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? 'a';
      if (state.base < 1) done = false;
    }
    if (done) finish();
    else frame = requestAnimationFrame(tick);
  });

  function finish() {
    cancelAnimationFrame(frame);
    layer.remove();
    for (const line of lines) line.style.removeProperty('opacity');
    if (!positioned) heading.style.removeProperty('position');
  }
  return finish;
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
