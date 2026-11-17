import { trackLoading } from '../loading';
import { HERO_SEQUENCE } from '../media';
import { drawCover, loadSequence, type ImageSequence } from '../sequence';
import { part, sceneTimeline } from '../timeline';

/**
 * Hero: the pen image sequence scrubbed by scroll on a canvas. The stage stays pinned while
 * the specs columns rise over it (see the specs scene). Until the frames are decoded, the
 * server-rendered first frame shows underneath, so a failed download just means a still hero.
 */
export function heroScene(section: HTMLElement) {
  const timeline = sceneTimeline(section);
  const canvas = part<HTMLCanvasElement>(section, 'sequence');
  const context = canvas?.getContext('2d');
  const source = canvas?.dataset.src;
  if (!canvas || !context || !source) return;

  const report = trackLoading('hero-sequence', 3);
  const controller = new AbortController();
  const state = { progress: 0 };
  let sequence: ImageSequence | null = null;
  let drawn = -1;

  // Only repaint when the frame changes: 75 frames over 1.7 screens of scroll, so most scroll
  // steps keep the same one.
  const draw = () => {
    if (!sequence) return;
    const index = Math.round(state.progress * (sequence.frames.length - 1));
    const image = sequence.frames[index];
    if (!image || index === drawn) return;
    drawCover(context, image, sequence.width, sequence.height);
    drawn = index;
  };
  // No more canvas pixels than the source frames have: a bigger canvas only costs fill rate.
  const resize = () => {
    if (!sequence || !canvas.clientWidth || !canvas.clientHeight) return;
    const sourceRatio = Math.min(sequence.width / canvas.clientWidth, sequence.height / canvas.clientHeight);
    const ratio = Math.min(window.devicePixelRatio, 2, sourceRatio);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    drawn = -1;
    draw();
  };

  timeline.to(state, { progress: 1, duration: HERO_SEQUENCE, onUpdate: draw }, 0);

  loadSequence(source, report, controller.signal)
    .then((loaded) => {
      sequence = loaded;
      resize();
      canvas.dataset.ready = 'true';
    })
    .catch(() => report(1)); // keep the still frame; never hold the preloader on a failed file

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  return () => {
    controller.abort();
    observer.disconnect();
  };
}
