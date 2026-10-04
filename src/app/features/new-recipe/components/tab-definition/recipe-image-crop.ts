export interface NormalizedImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function cropRecipeImage(
  image: HTMLImageElement,
  selection: NormalizedImageCrop,
): Promise<Blob> {
  const sourceX = Math.round(selection.x * image.naturalWidth);
  const sourceY = Math.round(selection.y * image.naturalHeight);
  const sourceWidth = Math.round(selection.width * image.naturalWidth);
  const sourceHeight = Math.round(selection.height * image.naturalHeight);
  if (sourceWidth < 1 || sourceHeight < 1) {
    throw new Error('Image crop selection is empty');
  }

  const canvas = document.createElement('canvas');
  canvas.width = sourceWidth;
  canvas.height = sourceHeight;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create image crop canvas');

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    sourceWidth,
    sourceHeight,
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image crop failed'))),
      'image/jpeg',
      0.95,
    );
  });
}
