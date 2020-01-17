import toolsSupport from '../toolsSupport';

export default function getColorIndicesOfReducedImg(image, sideCellCount, cellLength) {
  const { width, height } = image;
  const aspectRatio = width > height ? width / height : height / width;
  const scaledWidth = Math.round(width > height ? sideCellCount : sideCellCount / aspectRatio);
  const scaledHeight = Math.round(height > width ? sideCellCount : sideCellCount / aspectRatio);

  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = sideCellCount;
  tempCanvas.height = sideCellCount;

  tempCtx.drawImage(
    image,
    Math.round((sideCellCount - scaledWidth) / 2),
    Math.round((sideCellCount - scaledHeight) / 2),
    scaledWidth,
    scaledHeight,
  );

  const imageData = tempCtx.getImageData(0, 0, sideCellCount, sideCellCount);

  return toolsSupport.imageDataToRgbaIndices(imageData.data, cellLength);
}
