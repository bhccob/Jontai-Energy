import { FILES, type Pictured } from '@/lib/islands';

/**
 * A product's picture on its own, with no frame (round 54: the wheel and the All products page). `whole` uses the
 * product's whole picture where it has one (the pole lamp standing on its pole) instead of the one cropped for frames.
 */
export function RangePicture({ p, sizes, eager = false, whole = false }: { p: Pictured; sizes: string; eager?: boolean; whole?: boolean }) {
  const pic = whole && p.whole ? p.whole : { image: p.image, size: p.size, files: p.files ?? FILES };
  const [small, large] = pic.files;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/sky/range-${pic.image}-${large}.webp`}
      srcSet={`/sky/range-${pic.image}-${small}.webp ${small}w, /sky/range-${pic.image}-${large}.webp ${pic.size[0]}w`}
      sizes={sizes}
      alt=""
      width={pic.size[0]}
      height={pic.size[1]}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  );
}
