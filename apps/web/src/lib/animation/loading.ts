/**
 * Tracks what the preloader waits for (fonts, the hero sequence). Each task reports a 0–1
 * fraction; the preloader shows the weighted total. Tasks registered after the preloader has
 * finished are simply ignored by it.
 */
type Task = { weight: number; done: number };
type Listener = (progress: number) => void;

const tasks = new Map<string, Task>();
const listeners = new Set<Listener>();

function total(): number {
  let weight = 0;
  let done = 0;
  for (const task of tasks.values()) {
    weight += task.weight;
    done += task.weight * task.done;
  }
  return weight === 0 ? 1 : done / weight;
}

function emit() {
  const progress = total();
  for (const listener of listeners) listener(progress);
}

/** Registers a task and returns a reporter; call it with 1 when the task finishes (or fails). */
export function trackLoading(name: string, weight = 1): (fraction: number) => void {
  tasks.set(name, { weight, done: 0 });
  emit();
  return (fraction) => {
    const task = tasks.get(name);
    if (!task) return;
    task.done = Math.min(1, Math.max(task.done, fraction));
    emit();
  };
}

export function onLoadingProgress(listener: Listener): () => void {
  listeners.add(listener);
  listener(total());
  return () => listeners.delete(listener);
}

/** Fired on window when the intro (preloader fade) is over, so the header can reveal itself. */
export const INTRO_DONE_EVENT = 'nota:intro-done';
