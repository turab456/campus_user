/** Resize and compress an image file for avatar upload (target ≤ maxSizeKb). */
export async function compressAvatar(file: File, maxSizeKb = 400): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const maxDim = 512;

  let { width, height } = bitmap;
  if (width > maxDim || height > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare image for upload');

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.85;
  let blob: Blob | null = null;

  while (quality >= 0.4) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
    if (blob && blob.size <= maxSizeKb * 1024) break;
    quality -= 0.1;
  }

  if (!blob) {
    throw new Error('Could not compress image');
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'avatar';
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' });
}
