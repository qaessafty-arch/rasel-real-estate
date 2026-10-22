/**
 * High-Performance Client-Side Image Compressor
 * Resizes large smartphone camera photos to max 1600px dimension and converts to WebP/JPEG
 * Prevents localStorage QuotaExceededError and optimizes bandwidth.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/webp' | 'image/jpeg';
}

export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    format = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // If it's not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('پەڕگەی هەڵبژێردراو وێنە نییە!'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('هەڵە لە خوێندنەوەی وێنە!'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('هەڵە لە بارکردنی وێنە!'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight;
            height = Math.round((img.height * maxHeight) / img.width);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(reader.result as string); // fallback to original
        }

        // Draw and compress
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL(format, quality);
          resolve(compressedDataUrl);
        } catch {
          // Fallback to jpeg if webp conversion fails
          try {
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch {
            resolve(reader.result as string);
          }
        }
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
