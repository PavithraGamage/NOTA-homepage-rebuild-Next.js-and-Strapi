/**
 * Swipe-to-fade slider: the colorways on phones and tablets, as on the reference. The slides sit
 * on top of each other and a horizontal drag fades the next one in over the current one (or,
 * dragging back, the current one out), following the finger: one screen width is one slide.
 * Releasing past half way, or flicking, completes the change; otherwise it fades back. Either way
 * the rest takes 500 ms at an even pace, as measured on the reference. It loops both ways, and
 * the arrow keys step through it when it has focus.
 */
const DURATION = 500;
/** A release this soon after touching down, with at least FLICK_PX of travel, is a flick. */
const FLICK_MS = 300;
const FLICK_PX = 10;

export function wrap(index: number, count: number): number {
  return ((index % count) + count) % count;
}

/** At `position` (in slides), which slide is fully shown, which fades in above it, and by how much. */
export function fadeFrame(position: number, count: number): { below: number; above: number; fade: number } {
  const base = Math.floor(position);
  return { below: wrap(base, count), above: wrap(base + 1, count), fade: position - base };
}

/** The slide a drag that started on slide `start` settles on. */
export function releaseTarget(start: number, position: number, dx: number, ms: number): number {
  const moved = position - start;
  if (moved === 0) return start;
  const flick = ms < FLICK_MS && Math.abs(dx) > FLICK_PX;
  return flick || Math.abs(moved) > 0.5 ? start + Math.sign(moved) : start;
}

/** Turns `track`'s children into a fade slider; returns the function that undoes it. */
export function fadeCarousel(track: HTMLElement, onChange: (index: number) => void): () => void {
  const slides = Array.from(track.children) as HTMLElement[];
  const count = slides.length;
  let position = 0;
  let goal = 0;
  let frame = 0;
  let drag: { id: number; x: number; from: number; start: number; time: number } | null = null;

  const render = () => {
    const { below, above, fade } = fadeFrame(position, count);
    slides.forEach((slide, index) => {
      const opacity = index === below ? 1 : index === above ? fade : 0;
      slide.style.opacity = String(opacity);
      // Hidden slides leave the accessibility tree, so only the one on show is announced.
      slide.style.visibility = opacity > 0 ? 'visible' : 'hidden';
      slide.style.zIndex = index === above ? '2' : index === below ? '1' : '0';
    });
    onChange(wrap(Math.round(position), count));
  };

  const animateTo = (target: number) => {
    cancelAnimationFrame(frame);
    goal = target;
    const from = position;
    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / DURATION, 1);
      position = progress === 1 ? wrap(target, count) : from + (target - from) * progress;
      if (progress === 1) goal = position;
      render();
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  };

  const onDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button !== 0) return;
    cancelAnimationFrame(frame);
    drag = {
      id: event.pointerId,
      x: event.clientX,
      from: position,
      start: Math.round(position),
      time: performance.now(),
    };
    track.setPointerCapture(event.pointerId);
  };
  const onMove = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id || !track.clientWidth) return;
    const next = drag.from - (event.clientX - drag.x) / track.clientWidth;
    position = Math.min(Math.max(next, drag.start - 1), drag.start + 1);
    render();
  };
  const onUp = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    // A cancel means the browser took the gesture over (a vertical scroll): fade back.
    const target =
      event.type === 'pointercancel'
        ? drag.start
        : releaseTarget(drag.start, position, dx, performance.now() - drag.time);
    drag = null;
    animateTo(target);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    animateTo(goal + (event.key === 'ArrowRight' ? 1 : -1));
  };
  const onDragStart = (event: DragEvent) => event.preventDefault();

  track.tabIndex = 0;
  render();
  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);
  track.addEventListener('keydown', onKey);
  track.addEventListener('dragstart', onDragStart);
  return () => {
    cancelAnimationFrame(frame);
    track.removeEventListener('pointerdown', onDown);
    track.removeEventListener('pointermove', onMove);
    track.removeEventListener('pointerup', onUp);
    track.removeEventListener('pointercancel', onUp);
    track.removeEventListener('keydown', onKey);
    track.removeEventListener('dragstart', onDragStart);
    track.removeAttribute('tabindex');
    for (const slide of slides) {
      for (const property of ['opacity', 'visibility', 'z-index']) slide.style.removeProperty(property);
    }
  };
}
