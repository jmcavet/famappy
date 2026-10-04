import { cropRecipeImage } from './recipe-image-crop';

describe('cropRecipeImage', () => {
  it('exports only the selected lower half of the source image', async () => {
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = 20;
    sourceCanvas.height = 20;
    const sourceContext = sourceCanvas.getContext('2d');
    if (!sourceContext) throw new Error('Canvas is unavailable');

    sourceContext.fillStyle = '#ff0000';
    sourceContext.fillRect(0, 0, 20, 10);
    sourceContext.fillStyle = '#0000ff';
    sourceContext.fillRect(0, 10, 20, 10);

    const sourceImage = new Image();
    sourceImage.src = sourceCanvas.toDataURL();
    await sourceImage.decode();

    const croppedBlob = await cropRecipeImage(sourceImage, {
      x: 0,
      y: 0.5,
      width: 1,
      height: 0.5,
    });
    const croppedBitmap = await createImageBitmap(croppedBlob);
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = croppedBitmap.width;
    resultCanvas.height = croppedBitmap.height;
    const resultContext = resultCanvas.getContext('2d');
    if (!resultContext) throw new Error('Canvas is unavailable');
    resultContext.drawImage(croppedBitmap, 0, 0);

    expect(croppedBitmap.width).toBe(20);
    expect(croppedBitmap.height).toBe(10);
    const [red, green, blue, alpha] = resultContext.getImageData(
      10,
      5,
      1,
      1,
    ).data;
    expect(red).toBeLessThan(15);
    expect(green).toBeLessThan(15);
    expect(blue).toBeGreaterThan(240);
    expect(alpha).toBe(255);
    croppedBitmap.close();
  });
});
