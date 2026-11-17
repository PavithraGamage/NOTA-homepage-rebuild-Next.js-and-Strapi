/** One design pixel of the current layout range (mirrors `--u` in globals.css, desktop ranges). */
export function designUnit(): number {
  const width = window.innerWidth;
  const design = width >= 1920 ? 1920 : width >= 1440 ? 1440 : 992;
  return width / design;
}
