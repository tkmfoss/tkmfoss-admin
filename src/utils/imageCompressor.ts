/**
 * High-performance client-side image compression utility.
 * Optimizes images (posters, covers, avatars) before uploading to Cloudinary,
 * Firebase Storage, or storing as Base64 fallback to drastically save storage and bandwidth.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png' | 'auto';
  maxSizeBytes?: number;
  preserveFormat?: boolean;
}

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savedBytes: number;
  savedPercent: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Format bytes into human readable string (e.g. 2.4 MB, 185 KB)
 */
export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Loads an image from a File or Blob into an HTMLImageElement safely.
 */
const loadImage = (file: Blob | File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression: ' + err));
    };
    img.src = url;
  });
};

/**
 * Test whether the browser supports canvas exporting to image/webp
 */
const supportsWebP = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
};

/**
 * Compresses an image file client-side.
 * Resizes large dimensions proportionally, converts to WebP/JPEG, and applies quality compression.
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> => {
  const originalSize = file.size;

  // Don't compress SVGs or animated GIFs by default (rasterization ruins them)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      savedPercent: 0,
      width: 0,
      height: 0,
      format: file.type
    };
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    format = 'auto',
    preserveFormat = false
  } = options;

  const img = await loadImage(file);
  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  // Calculate proportional resize
  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available for compression');
  }

  // Determine export format
  let exportMime: string;
  if (preserveFormat) {
    exportMime = file.type || 'image/jpeg';
  } else if (format === 'auto') {
    exportMime = supportsWebP() ? 'image/webp' : 'image/jpeg';
  } else {
    exportMime = format;
  }

  // Handle transparency if exporting to JPEG
  if (exportMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const compressedBlob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create compressed image blob'));
      },
      exportMime,
      quality
    );
  });

  // If the compressed output is somehow larger than the original (can happen with tiny pre-compressed PNGs),
  // retain original file to avoid degradation.
  if (compressedBlob.size >= originalSize && originalSize > 0) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      savedPercent: 0,
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: file.type
    };
  }

  // Determine extension
  const ext = exportMime === 'image/webp' ? '.webp' : exportMime === 'image/jpeg' ? '.jpg' : '.png';
  const originalBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
  const newFileName = `${originalBaseName}_opt${ext}`;

  const compressedFile = new File([compressedBlob], newFileName, {
    type: exportMime,
    lastModified: Date.now()
  });

  const compressedSize = compressedFile.size;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercent = Math.round((savedBytes / originalSize) * 100);

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    savedBytes,
    savedPercent,
    width: targetWidth,
    height: targetHeight,
    format: exportMime
  };
};
