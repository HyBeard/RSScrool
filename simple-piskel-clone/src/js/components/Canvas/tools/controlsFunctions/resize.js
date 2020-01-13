import toolsSupport from '../toolsSupport';

const resize = {
  getResizedCanvasData(currentSide, newSide, currentCanvasData) {
    const TRANSPARENT_COLOR = 'rgba(0,0,0,0)';
    const emptyCanvasData = new Array(newSide ** 2).fill(TRANSPARENT_COLOR);
    const rowCountDiff = currentSide - newSide;
    const canvasDataCopy = [...currentCanvasData];

    const newCanvasData = emptyCanvasData.map((_, idx) => {
      const { row, col } = toolsSupport.indexToRowCol(idx, newSide);
      const relevantIndex = toolsSupport.rowColToIndex(
        row + rowCountDiff,
        col + rowCountDiff,
        currentSide,
      );
      const colorOfRelevantIndex = canvasDataCopy[relevantIndex] || TRANSPARENT_COLOR;

      return colorOfRelevantIndex;
    });

    return newCanvasData;
  },

  getResizedImageUrl(currentSide, newSide, currentImg) {
    const tempCanvas = document.createElement('canvas');
    const context = tempCanvas.getContext('2d');

    tempCanvas.width = newSide;
    tempCanvas.height = newSide;

    if (newSide > currentSide) {
      const putFrom = newSide - currentSide;
      context.drawImage(currentImg, putFrom, putFrom, currentSide, currentSide);
    } else {
      const cutFrom = currentSide - newSide;
      const cutSize = currentSide - cutFrom;
      context.drawImage(currentImg, cutFrom, cutFrom, cutSize, cutSize, 0, 0, newSide, newSide);
    }

    return tempCanvas.toDataURL();
  },
};

export default resize;
