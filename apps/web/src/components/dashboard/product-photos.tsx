'use client';

import type { ProductImageDto } from '@ojara/shared';
import { ArrowLeft, ArrowRight, CircleAlert, ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { type ChangeEvent, useState } from 'react';
import {
  ACCEPTED_IMAGE_TYPES,
  removeProductPhoto,
  reorderProductPhotos,
  uploadErrorMessage,
  uploadProductPhoto,
} from '@/lib/api/media';
import { cn } from '@/lib/utils';

interface Uploading {
  key: string;
  name: string;
  progress: number;
}

/**
 * Product photos (03.05 "Images"): upload straight to Cloudinary, remove, and reorder with
 * left / right buttons (the first photo is the cover). Changes apply immediately; they don't wait
 * for "Save changes".
 */
export function ProductPhotos({
  storeId,
  productId,
  initialImages,
  productName,
  maxImages,
  maxBytes,
  onImagesChange,
}: {
  storeId: string;
  productId: string;
  initialImages: ProductImageDto[];
  productName: string;
  maxImages: number;
  maxBytes: number;
  /** Called with the new photo list after every change (e.g. to update a preview's cover). */
  onImagesChange?: (images: ProductImageDto[]) => void;
}) {
  const [images, setImagesState] = useState(initialImages);
  const setImages = (next: ProductImageDto[]) => {
    setImagesState(next);
    onImagesChange?.(next);
  };
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const slotsLeft = maxImages - images.length - uploading.length;
  const maxMb = Math.floor(maxBytes / (1024 * 1024));

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    setError(undefined);
    const accepted = files.slice(0, Math.max(0, slotsLeft));
    if (files.length > accepted.length) {
      setError(`Your plan allows ${maxImages} photos per product.`);
    }
    for (const file of accepted) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`${file.name}: use a JPG, PNG, WebP or AVIF photo.`);
        continue;
      }
      if (file.size > maxBytes) {
        setError(`${file.name} is larger than ${maxMb} MB.`);
        continue;
      }
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      setUploading((u) => [...u, { key, name: file.name, progress: 0 }]);
      try {
        const product = await uploadProductPhoto(storeId, productId, file, (progress) =>
          setUploading((u) => u.map((x) => (x.key === key ? { ...x, progress } : x))),
        );
        setImages(product.images);
      } catch (err) {
        setError(`${file.name}: ${uploadErrorMessage(err)}`);
      } finally {
        setUploading((u) => u.filter((x) => x.key !== key));
      }
    }
  }

  async function run(action: () => Promise<{ images: ProductImageDto[] }>) {
    setBusy(true);
    setError(undefined);
    try {
      setImages((await action()).images);
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function move(index: number, by: -1 | 1) {
    const ids = images.map((i) => i.id);
    const [moved] = ids.splice(index, 1);
    if (!moved) return;
    ids.splice(index + by, 0, moved);
    void run(() => reorderProductPhotos(storeId, productId, ids));
  }

  const iconButton =
    'inline-flex size-7 items-center justify-center rounded-full bg-paper/90 text-fg shadow-sm hover:bg-paper disabled:opacity-40';

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {images.map((img, i) => (
          <div
            key={img.id}
            className="group relative aspect-square overflow-hidden rounded-md bg-surface-muted"
          >
            <Image
              src={img.publicId}
              alt={img.alt ?? `${productName} photo ${i + 1}`}
              fill
              sizes="(min-width: 640px) 160px, 45vw"
              className="object-cover"
            />
            {i === 0 ? (
              <span className="absolute top-2 left-2 rounded-xs bg-forest/85 px-1.5 py-0.5 text-[11px]/[14px] font-semibold text-paper">
                Cover
              </span>
            ) : null}
            <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
              <span className="flex gap-1">
                <button
                  type="button"
                  aria-label={`Move photo ${i + 1} earlier`}
                  disabled={busy || i === 0}
                  onClick={() => move(i, -1)}
                  className={iconButton}
                >
                  <ArrowLeft className="size-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Move photo ${i + 1} later`}
                  disabled={busy || i === images.length - 1}
                  onClick={() => move(i, 1)}
                  className={iconButton}
                >
                  <ArrowRight className="size-3.5" aria-hidden />
                </button>
              </span>
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                disabled={busy}
                onClick={() => void run(() => removeProductPhoto(storeId, productId, img.id))}
                className={cn(iconButton, 'hover:text-danger')}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </div>
          </div>
        ))}
        {uploading.map((u) => (
          <div
            key={u.key}
            className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border border-line bg-surface-muted/60 p-3 text-center"
            aria-live="polite"
          >
            <LoaderCircle className="size-5 animate-spin text-fg-muted" aria-hidden />
            <span className="w-full truncate text-[11px]/[14px] text-fg-muted">{u.name}</span>
            <span className="h-1 w-full overflow-hidden rounded-full bg-line">
              <span
                className="block h-full bg-forest transition-[width]"
                style={{ width: `${Math.round(u.progress * 100)}%` }}
              />
            </span>
          </div>
        ))}
        {slotsLeft > 0 ? (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-line-strong bg-surface-muted/60 p-3 text-center hover:bg-selected has-focus-visible:shadow-focus">
            <ImagePlus className="size-5 text-fg" aria-hidden />
            <span className="text-[13px]/[19px] font-semibold">Add photos</span>
            <span className="text-[11px]/[14px] text-fg-subtle">
              JPG, PNG or WebP, up to {maxMb} MB
            </span>
            <input
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              multiple
              onChange={(e) => void onFiles(e)}
              className="sr-only"
            />
          </label>
        ) : null}
      </div>
      <p className="text-xs text-fg-muted">
        {images.length} of {maxImages} photos on your plan. Changes save straight away.
      </p>
      {error ? (
        <p role="alert" className="flex items-center gap-1.5 text-xs font-medium text-danger">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
