import { getImageProps } from 'next/image';
import type { ImageAsset, ResponsiveImage } from '@/lib/content/types';

/** Crop slots from smallest to largest; each falls back to the next larger one. */
const SLOTS = [
  ['max479', '(max-width: 479px)'],
  ['max767', '(max-width: 767px)'],
  ['max991', '(max-width: 991px)'],
  ['max1439', '(max-width: 1439px)'],
] as const;

type Slot = (typeof SLOTS)[number][0];

/** The asset shown in a slot: the slot's own crop, else the next larger crop, else the main image. */
export function resolveSlot(image: ResponsiveImage, slotIndex: number): ImageAsset {
  for (let i = slotIndex; i < SLOTS.length; i++) {
    const crop = image[SLOTS[i][0] as Slot];
    if (crop) return crop;
  }
  return image.image;
}

/** Media queries that need their own <source>, skipping slots identical to the next larger one. */
export function pictureSources(image: ResponsiveImage): { media: string; asset: ImageAsset }[] {
  return SLOTS.flatMap(([, media], index) => {
    const asset = resolveSlot(image, index);
    const larger = index + 1 < SLOTS.length ? resolveSlot(image, index + 1) : image.image;
    return asset.url === larger.url ? [] : [{ media, asset }];
  });
}

type PictureProps = {
  image: ResponsiveImage;
  /** Rendered width per breakpoint, so the browser downloads the right size. */
  sizes: string;
  className?: string;
  /** Above-the-fold images: load eagerly with high priority. */
  priority?: boolean;
};

/**
 * Art-directed responsive image: one <source> per distinct crop, each optimised by Next.js
 * (AVIF/WebP at the widths `sizes` asks for), with the main image as the <img> fallback.
 */
export function Picture({ image, sizes, className, priority = false }: PictureProps) {
  const common = { alt: image.alt, sizes, quality: 80, priority };
  const { props: img } = getImageProps({
    ...common,
    src: image.image.url,
    width: image.image.width,
    height: image.image.height,
  });

  return (
    <picture className={className}>
      {pictureSources(image).map(({ media, asset }) => {
        const { props } = getImageProps({ ...common, src: asset.url, width: asset.width, height: asset.height });
        return (
          <source
            key={media}
            media={media}
            srcSet={props.srcSet}
            sizes={props.sizes}
            width={asset.width}
            height={asset.height}
          />
        );
      })}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps (required in the CMS) */}
      <img {...img} />
    </picture>
  );
}
