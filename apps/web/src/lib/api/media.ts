import {
  ALLOWED_IMAGE_FORMATS,
  mediaSignResponseSchema,
  type ProductDetailDto,
  productDetailSchema,
} from '@ojara/shared';
import { clientEnv } from '@/env';
import { ApiRequestError, apiRequest } from './client';

/**
 * Browser-side product photo management. Uploads go straight from the browser to Cloudinary
 * (never through our servers): the API signs the upload into the store's folder after checking
 * plan limits, then re-reads the uploaded file from Cloudinary when we register it.
 */

const api = (path: `/${string}`) => ({
  baseUrl: clientEnv.NEXT_PUBLIC_API_URL,
  path,
  credentials: 'include' as const,
});

const images = (storeId: string, productId: string) =>
  `/stores/${encodeURIComponent(storeId)}/catalog/products/${encodeURIComponent(productId)}/images` as const;

export const ACCEPTED_IMAGE_TYPES = ALLOWED_IMAGE_FORMATS.map((f) =>
  f === 'jpg' ? 'image/jpeg' : `image/${f}`,
).filter((t, i, all) => all.indexOf(t) === i);

/** Readable message for any failure in the upload chain. */
export function uploadErrorMessage(err: unknown): string {
  if (err instanceof ApiRequestError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return 'The upload failed. Check your connection and try again.';
}

function uploadToCloudinary(
  url: string,
  fields: Record<string, string>,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<{ public_id: string }> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    for (const [k, v] of Object.entries(fields)) body.set(k, v);
    body.set('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText) as {
          public_id?: string;
          error?: { message?: string };
        };
        if (xhr.status >= 200 && xhr.status < 300 && json.public_id) {
          resolve({ public_id: json.public_id });
        } else {
          reject(new Error(json.error?.message ?? `Upload failed (${xhr.status})`));
        }
      } catch {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('The upload failed. Check your connection.'));
    xhr.send(body);
  });
}

/** Sign → upload to Cloudinary → register with the product. Returns the updated product. */
export async function uploadProductPhoto(
  storeId: string,
  productId: string,
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<ProductDetailDto> {
  const sig = await apiRequest({
    ...api(`/stores/${encodeURIComponent(storeId)}/media/sign`),
    method: 'POST',
    body: { kind: 'product', productId, fileSize: file.size },
    schema: mediaSignResponseSchema,
  });
  const uploaded = await uploadToCloudinary(
    sig.uploadUrl,
    {
      api_key: sig.apiKey,
      timestamp: String(sig.timestamp),
      signature: sig.signature,
      folder: sig.folder,
      allowed_formats: sig.allowedFormats,
    },
    file,
    onProgress,
  );
  return apiRequest({
    ...api(images(storeId, productId)),
    method: 'POST',
    body: { publicId: uploaded.public_id },
    schema: productDetailSchema,
  });
}

export function removeProductPhoto(storeId: string, productId: string, imageId: string) {
  return apiRequest({
    ...api(`${images(storeId, productId)}/${encodeURIComponent(imageId)}`),
    method: 'DELETE',
    schema: productDetailSchema,
  });
}

export function reorderProductPhotos(storeId: string, productId: string, ids: string[]) {
  return apiRequest({
    ...api(`${images(storeId, productId)}/order`),
    method: 'PUT',
    body: { ids },
    schema: productDetailSchema,
  });
}
