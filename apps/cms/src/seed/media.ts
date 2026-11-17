import fs from 'node:fs';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

/**
 * Every media file the homepage needs. Reference images are downloaded one by one from the
 * original site (the brief allows reusing its images); nothing is mirrored or cloned. The
 * header wordmark has no file URL on the reference, so it ships in seed/assets.
 * Keys become the file names in the Media Library, which is how re-runs find existing files.
 */
const REF = 'https://nota.uprock.pro';
const lib = (file: string) => `${REF}/d/${file}`;

type MediaSource = { url: string } | { file: string } | { lottieFrame: { from: string; frame: number } };
type MediaEntry = { source: MediaSource; alt?: string };

export const MEDIA = {
  // Global
  'nota-wordmark': { source: { file: 'seed/assets/nota-wordmark.svg' }, alt: 'Nōta' },
  'nota-brand-mark': { source: { url: lib('library_image-14633-symbol-i0odde8nz-logo.svg') }, alt: 'NŌTA brand mark' },
  'nota-favicon': { source: { url: `${REF}/favicon.svg` }, alt: 'NŌTA' },
  'nota-share-image': { source: { url: lib('opengraph.jpg') }, alt: 'NŌTA smart pen' },
  'menu-pen': { source: { url: lib('library_image-14639-symbol-ibp1e2m59-popup_order-img.png') } },
  'menu-pen-767': { source: { url: lib('library_image-14639-symbol-ibp1e2m59-popup_order-img480.png') } },
  'menu-pen-479': { source: { url: lib('library_image-14639-symbol-ibp1e2m59-popup_order-img320.png') } },

  // Hero
  'hero-sequence': { source: { url: `${REF}/f/0_refinedcover_03_09.json` } },
  'hero-first-frame': { source: { lottieFrame: { from: 'hero-sequence', frame: 0 } } },
  'hero-pen-991': { source: { url: lib('library_image-14634-symbol-is6ru9kkd-nota_hero_image_adaptive_866220.png') } },

  // Specifications
  'specs-pen': { source: { url: lib('library_image-14700-symbol-iw3g92519-nota_scene_2_img.png') } },
  'specs-pen-991': { source: { url: lib('library_image-14699-symbol-icoj9ef2j-scene2-adaptive768-ezgifcom-png-to-webp-converter.webp') } },
  'specs-pen-767': { source: { url: lib('library_image-14699-symbol-icoj9ef2j-scene2-adaptive480-ezgifcom-png-to-webp-converter.webp') } },

  // Who it's for
  'audience-video': { source: { url: `${REF}/f/25824d842058045cd73c3feba327dd09_1920.mp4` } },

  // Smart paper (desktop images, then tablet, large-phone and phone crops)
  'paper-1': { source: { url: lib('nota_scene_4_img_01.jpg') } },
  'paper-2': { source: { url: lib('nota_scene_4_img_02.jpg') } },
  'paper-3': { source: { url: lib('nota_scene_4_img_03.jpg') } },
  'paper-4': { source: { url: lib('nota_scene_4_img_04.jpg') } },
  'paper-1-991': { source: { url: lib('41_block.jpg') } },
  'paper-2-991': { source: { url: lib('42_block.jpg') } },
  'paper-3-991': { source: { url: lib('43_block.jpg') } },
  'paper-4-991': { source: { url: lib('41_block1212.png') } },
  'paper-1-767': { source: { url: lib('41_block_480.jpg') } },
  'paper-2-767': { source: { url: lib('42_block_480.jpg') } },
  'paper-3-767': { source: { url: lib('43_block_480.jpg') } },
  'paper-1-479': { source: { url: lib('41_block_mobile_1.jpg') } },
  'paper-2-479': { source: { url: lib('41_block_mobile_2.jpg') } },
  'paper-3-479': { source: { url: lib('41_block_mobile_4.jpg') } },
  'paper-4-479': { source: { url: lib('41_block_mobile_3.jpg') } },

  // Inside the box
  'kit': { source: { url: lib('library_image-14643-symbol-ispnvazts-nota_scene_5_img1.jpg') } },
  'kit-1439': { source: { url: lib('library_image-14643-symbol-ispnvazts-nota_scene_5_img_01_adaptive.jpg') } },
  'kit-479': { source: { url: lib('library_image-14642-symbol-it4oyiz32-scene_5_320_smartpaper.jpg') } },
  'box-pen': { source: { url: lib('library_image-14643-symbol-ispnvazts-nota_scene_5_img_02.jpg') } },
  'box-pen-991': { source: { url: lib('library_image-14642-symbol-it4oyiz32-scene_5_768_devise-1.png') } },
  'box-pen-767': { source: { url: lib('library_image-14642-symbol-it4oyiz32-scene_5_pen_static_480.png') } },
  'box-pen-479': { source: { url: lib('library_image-14642-symbol-it4oyiz32-scene_5_pen_static_320.png') } },
  'box-adapter': { source: { url: lib('library_image-14643-symbol-ispnvazts-nota_scene_5_img_03.jpg') } },
  'box-adapter-991': { source: { url: lib('library_image-14642-symbol-it4oyiz32-nota_scene_5_img3_768.jpg') } },
  'box-adapter-767': { source: { url: lib('library_image-14642-symbol-it4oyiz32-nota_scene_5_img3_480.jpg') } },
  'box-adapter-479': { source: { url: lib('library_image-14642-symbol-it4oyiz32-scene_5_adapter_static_320.png') } },

  // Details grid (six tiles; tile 4 is the looping video)
  'detail-1': { source: { url: lib('library_image-14686-symbol-i71z9t68q-nota_scene_6_img_01.jpg') } },
  'detail-1-1439': { source: { url: lib('library_image-14686-symbol-i71z9t68q-scene_6_992_card-1.jpg') } },
  'detail-1-991': { source: { url: lib('library_image-14685-symbol-iag8qchrn-nota_scene_6_img_01.jpg') } },
  'detail-1-767': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_480_card-1.png') } },
  'detail-1-479': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_320_card-1.png') } },
  'detail-2': { source: { url: lib('library_image-14686-symbol-i71z9t68q-nota_scene_6_img_02.jpg') } },
  'detail-2-767': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_480_card-2.png') } },
  'detail-2-479': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_320_card-2.png') } },
  'detail-3': { source: { url: lib('library_image-14686-symbol-i71z9t68q-nota_scene_6_img_03.jpg') } },
  'detail-3-991': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_768_card-3.png') } },
  'detail-video': { source: { url: `${REF}/f/7b66fa812d04f9c7075f91ef42d4dd53_1920.mp4` } },
  'detail-5': { source: { url: lib('library_image-14686-symbol-i71z9t68q-scene_6_1440_card_5.png') } },
  'detail-5-1439': { source: { url: lib('library_image-14686-symbol-i71z9t68q-scene_6_992_card-5.jpg') } },
  'detail-5-991': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_768_card-5.png') } },
  'detail-5-767': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_480_card-5.png') } },
  'detail-5-479': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_320_card-5.png') } },
  'detail-6': { source: { url: lib('library_image-14686-symbol-i71z9t68q-nota_scene_6_img_06.jpg') } },
  'detail-6-991': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_768_card-6.png') } },
  'detail-6-479': { source: { url: lib('library_image-14685-symbol-iag8qchrn-scene_6_320_card-6.png') } },

  // Colorways
  'colorway-intro': { source: { url: lib('library_image-14781-symbol-i64njjjjo-nota_scene_7_img_01.jpg') } },
  'colorway-graphite': { source: { url: lib('library_image-14781-symbol-i64njjjjo-nota_scene_7_img_02.jpg') } },
  'colorway-mist': { source: { url: lib('library_image-14781-symbol-i64njjjjo-nota_scene_7_img_03.jpg') } },
  'colorway-red': { source: { url: lib('library_image-14781-symbol-i64njjjjo-nota_scene_7_img_04.jpg') } },
  'colorway-orange': { source: { url: lib('library_image-14781-symbol-i64njjjjo-nota_scene_7_img_05.jpg') } },
} satisfies Record<string, MediaEntry>;

export type MediaKey = keyof typeof MEDIA;

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'application/json': '.json',
};
const EXT_MIME = Object.fromEntries(Object.entries(MIME_EXT).map(([mime, ext]) => [ext, mime]));

type LocalFile = { filepath: string; mime: string };

/** Downloads a file once into the cache, asking for the original JPEG/PNG rather than a WebP re-encode. */
async function download(url: string, cacheDir: string, key: string): Promise<LocalFile> {
  const cached = fs.readdirSync(cacheDir).find((name) => path.parse(name).name === key);
  if (cached) return { filepath: path.join(cacheDir, cached), mime: EXT_MIME[path.extname(cached)] };

  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url, { headers: { Accept: 'image/jpeg,image/png,image/svg+xml,video/mp4,application/json;q=0.9,*/*;q=0.5' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const mime = (response.headers.get('content-type') ?? '').split(';')[0].trim();
      const ext = MIME_EXT[mime] ?? path.extname(new URL(url).pathname);
      const filepath = path.join(cacheDir, `${key}${ext}`);
      fs.writeFileSync(filepath, Buffer.from(await response.arrayBuffer()));
      return { filepath, mime: EXT_MIME[ext] ?? mime };
    } catch (error) {
      if (attempt >= 3) throw new Error(`Could not download ${key} from ${url}: ${String(error)}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/** The hero's Lottie file is an image sequence; its first frame is a natural static fallback. */
function extractLottieFrame(lottiePath: string, frame: number, cacheDir: string, key: string): LocalFile {
  const lottie = JSON.parse(fs.readFileSync(lottiePath, 'utf8')) as { assets: { id: string; p?: string }[] };
  const asset = lottie.assets.find((a) => a.id === `image_${frame}`);
  const match = asset?.p?.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) throw new Error(`Lottie frame ${frame} is not an embedded image`);
  const [, mime, data] = match;
  const filepath = path.join(cacheDir, `${key}${MIME_EXT[mime]}`);
  fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
  return { filepath, mime };
}

async function resolveLocalFile(strapi: Core.Strapi, key: MediaKey, cacheDir: string, resolved: Map<MediaKey, LocalFile>) {
  const { source } = MEDIA[key] as MediaEntry;
  if ('file' in source) {
    const filepath = path.join(strapi.dirs.app.root, source.file);
    return { filepath, mime: EXT_MIME[path.extname(filepath)] };
  }
  if ('url' in source) return download(source.url, cacheDir, key);
  const from = resolved.get(source.lottieFrame.from as MediaKey);
  if (!from) throw new Error(`${key} needs ${source.lottieFrame.from} to be resolved first`);
  return extractLottieFrame(from.filepath, source.lottieFrame.frame, cacheDir, key);
}

/**
 * Makes sure every media file exists in the Media Library and returns key → file id.
 * Files already uploaded (matched by name) are reused, so re-running never duplicates media.
 */
export async function ensureMedia(strapi: Core.Strapi, cacheDir: string): Promise<Record<MediaKey, number>> {
  fs.mkdirSync(cacheDir, { recursive: true });
  const ids = {} as Record<MediaKey, number>;
  const resolved = new Map<MediaKey, LocalFile>();
  let uploaded = 0;

  for (const key of Object.keys(MEDIA) as MediaKey[]) {
    const entry = MEDIA[key] as MediaEntry;
    const existing = await strapi.db.query('plugin::upload.file').findOne({ where: { name: { $startsWith: `${key}.` } } });
    const needsLocal = !existing || Object.values(MEDIA).some((m) => 'lottieFrame' in m.source && m.source.lottieFrame.from === key);
    const local = needsLocal ? await resolveLocalFile(strapi, key, cacheDir, resolved) : undefined;
    if (local) resolved.set(key, local);

    if (existing) {
      ids[key] = existing.id;
      continue;
    }
    if (!local) throw new Error(`No file resolved for ${key}`);
    const name = `${key}${path.extname(local.filepath)}`;
    const [file] = await strapi
      .plugin('upload')
      .service('upload')
      .upload({
        data: { fileInfo: { name, alternativeText: entry.alt ?? null, caption: null } },
        files: { filepath: local.filepath, originalFilename: name, mimetype: local.mime, size: fs.statSync(local.filepath).size },
      });
    ids[key] = file.id;
    uploaded++;
  }
  strapi.log.info(`[seed] media ready: ${uploaded} uploaded, ${Object.keys(MEDIA).length - uploaded} reused`);
  return ids;
}
