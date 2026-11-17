/**
 * The hero "Lottie" is an image sequence: every layer is one full-frame embedded WebP with a
 * static transform (checked in the file: 75 images over 76 frames at 15fps, no animated
 * transforms). So instead of a Lottie runtime we read the frame list and draw the current
 * frame on a canvas. That is lighter and scrubs exactly with scroll.
 */
type LottieFile = {
  op: number;
  w: number;
  h: number;
  assets: { id: string; p?: string }[];
  layers: { refId?: string; ip: number; op: number }[];
};

export type ImageSequence = { width: number; height: number; frames: HTMLImageElement[] };

/** Frame-by-frame image ids for a Lottie made only of image layers (exported for tests). */
export function frameIds(lottie: Pick<LottieFile, 'op' | 'layers'>): string[] {
  const ids: string[] = [];
  for (let frame = 0; frame < lottie.op; frame++) {
    const layer = lottie.layers.find((l) => l.refId && l.ip <= frame && frame < l.op);
    const previous = ids[frame - 1];
    if (layer?.refId) ids.push(layer.refId);
    else if (previous) ids.push(previous);
  }
  return ids;
}

/** Downloads the file (reporting 0–0.8 for bytes), then decodes every frame (0.8–1). */
export async function loadSequence(
  url: string,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
): Promise<ImageSequence> {
  const response = await fetch(url, { signal });
  if (!response.ok || !response.body) throw new Error(`Sequence request failed: ${response.status}`);
  const size = Number(response.headers.get('content-length')) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (size) onProgress((received / size) * 0.8);
  }
  const lottie = JSON.parse(await new Blob(chunks as BlobPart[]).text()) as LottieFile;
  const sources = new Map(lottie.assets.map((asset) => [asset.id, asset.p]));
  const ids = frameIds(lottie);

  const images = new Map<string, HTMLImageElement>();
  let decoded = 0;
  await Promise.all(
    [...new Set(ids)].map(async (id) => {
      const image = new Image();
      image.src = sources.get(id) ?? '';
      images.set(id, image);
      // Decoding up front warms the browser's image cache, so the first scrub doesn't stutter.
      await image.decode().catch(() => undefined);
      decoded++;
      onProgress(0.8 + (decoded / ids.length) * 0.2);
    }),
  );
  onProgress(1);
  return {
    width: lottie.w,
    height: lottie.h,
    frames: ids.map((id) => images.get(id)).filter((i): i is HTMLImageElement => !!i),
  };
}

/** Draws `image` to fill the canvas like `object-fit: cover`. */
export function drawCover(
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
) {
  const { width, height } = context.canvas;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}
