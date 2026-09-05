/** Matches the home carousel source photos (`width={1600}` `height={1008}`). */
export const BANNER_IMAGE = {
  ratio: 1600 / 1008,
  width: 1600,
  height: 1008,
  maxBytes: 2.5 * 1024 * 1024,
} as const;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_EXT = /\.(jpe?g|png|webp)$/i;

function isAllowedImage(file: File) {
  if (ALLOWED_TYPES.has(file.type)) return true;
  return !file.type && ALLOWED_EXT.test(file.name);
}

export function assertBannerFile(file: File) {
  return new Promise<File>((resolve, reject) => {
    if (!isAllowedImage(file)) {
      reject(new Error("Use a JPG, PNG or WebP image."));
      return;
    }
    if (file.size > BANNER_IMAGE.maxBytes) {
      reject(new Error("Keep the image under 2.5 MB."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const ratio = image.naturalWidth / image.naturalHeight;
      if (Math.abs(ratio - BANNER_IMAGE.ratio) > 0.08) {
        reject(
          new Error(
            `Use the same shape as the home carousel photos (${BANNER_IMAGE.width}×${BANNER_IMAGE.height}). This file is ${image.naturalWidth}×${image.naturalHeight}.`,
          ),
        );
        return;
      }
      if (image.naturalWidth < BANNER_IMAGE.width || image.naturalHeight < BANNER_IMAGE.height) {
        reject(
          new Error(
            `Image must be at least ${BANNER_IMAGE.width}×${BANNER_IMAGE.height} px. This file is ${image.naturalWidth}×${image.naturalHeight}.`,
          ),
        );
        return;
      }
      resolve(file);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("This image cannot be used."));
    };
    image.src = objectUrl;
  });
}
