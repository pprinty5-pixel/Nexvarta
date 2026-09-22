// Reduce photo size before sending it over the network.
export async function compressImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let blob;
    for (const quality of [0.8, 0.7, 0.6]) {
      blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
      if (!blob || blob.size <= 200 * 1024) break;
    }
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;
    return new File([blob], `${(file.name || 'image').replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
  } catch {
    // Server-side compression handles browsers without canvas/bitmap support.
    return file;
  } finally {
    bitmap?.close();
  }
}
