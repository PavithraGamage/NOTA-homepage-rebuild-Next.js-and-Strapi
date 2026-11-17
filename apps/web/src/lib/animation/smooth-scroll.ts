/**
 * Eased wheel scrolling for cinematic mode, like the reference (which uses Lenis). Each wheel
 * step moves a target and the page glides towards it. Measured on the reference, one 300px
 * wheel step is an exponential approach with a ~167 ms time constant: about 90% of the way
 * in 0.4 s, settled in about one second. Without it, a mouse wheel moves the page in 100px
 * jumps, and the scrubbed scenes jump with it.
 *
 * Only the wheel is eased. Keyboard, scrollbar, touch, anchor jumps and nested scrollers stay
 * native, and the glide restarts from wherever they leave the page.
 */
export const TIME_CONSTANT = 1000 / 6;
const LINE_HEIGHT = 100 / 6; // Firefox can report wheel steps in lines (same factor as Lenis)
const SETTLED = 0.5;

const listeners = new Set<() => void>();

/** Runs after every eased step, so scroll-driven animation can update in the same frame. */
export function onSmoothScroll(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** One step of the glide: how far `current` gets towards `target` in `elapsed` ms. */
export function ease(current: number, target: number, elapsed: number): number {
  const next = current + (target - current) * (1 - Math.exp(-elapsed / TIME_CONSTANT));
  return Math.abs(target - next) < SETTLED ? target : next;
}

/** Wheel delta in pixels, whatever unit the browser reports it in. */
export function wheelPixels(event: Pick<WheelEvent, 'deltaY' | 'deltaMode'>, pageHeight: number): number {
  if (event.deltaMode === 1) return event.deltaY * LINE_HEIGHT;
  if (event.deltaMode === 2) return event.deltaY * pageHeight;
  return event.deltaY;
}

/** Starts easing wheel scrolling; returns the function that stops it. */
export function smoothWheel(): () => void {
  const root = document.documentElement;
  let target = window.scrollY;
  let current = target;
  let frame = 0;
  let last = 0;

  const step = (time: number) => {
    frame = 0;
    // Something else moved the page (keyboard, scrollbar, an anchor jump): follow it.
    if (Math.abs(window.scrollY - current) > 2) return;
    current = ease(current, target, last ? Math.min(time - last, 100) : 1000 / 60);
    last = time;
    window.scrollTo({ top: current, behavior: 'instant' });
    listeners.forEach((listener) => listener());
    if (current !== target) frame = requestAnimationFrame(step);
  };

  const onWheel = (event: WheelEvent) => {
    if (event.defaultPrevented || event.ctrlKey || root.classList.contains('scroll-locked')) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || scrollsItself(event)) return;
    event.preventDefault();
    if (!frame) {
      target = current = window.scrollY;
      last = 0;
    }
    const max = root.scrollHeight - window.innerHeight;
    target = Math.min(Math.max(target + wheelPixels(event, window.innerHeight), 0), max);
    if (!frame) frame = requestAnimationFrame(step);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  return () => {
    window.removeEventListener('wheel', onWheel);
    cancelAnimationFrame(frame);
  };
}

/** True when the wheel is over an element that can still scroll that way itself. */
function scrollsItself(event: WheelEvent): boolean {
  for (let node = event.target as Element | null; node && node !== document.body; node = node.parentElement) {
    if (node.scrollHeight <= node.clientHeight) continue;
    const { overflowY } = getComputedStyle(node);
    if (overflowY !== 'auto' && overflowY !== 'scroll') continue;
    const atEnd = event.deltaY > 0 ? node.scrollTop + node.clientHeight >= node.scrollHeight - 1 : node.scrollTop <= 0;
    if (!atEnd) return true;
  }
  return false;
}
