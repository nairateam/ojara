import { cn } from '@/lib/utils';

/**
 * Product / category thumbnail from the sample photography in /public/mock. A plain <img>: the
 * app's next/image loader expects Cloudinary public_ids, which mock data doesn't have.
 */
export function Thumb({
  src,
  alt = '',
  size = 40,
  className,
}: {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      style={{ width: size, height: size }}
      className={cn('shrink-0 rounded-md bg-surface-muted object-cover', className)}
    />
  );
}
