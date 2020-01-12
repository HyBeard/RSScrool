import common from './tools/toolsFunctions/common';
import toolsList from './tools/toolsList';

export default class CanvasModel {
  constructor(savedState) {
    const {
      canvasData, activeTool, primColor, secColor, sideCellCount,
    } = savedState;

    this.TRANSPARENT_COLOR = 'rgba(0,0,0,0)';
    this.SIDE_LENGTH = 512;
    this.sideCellCount = sideCellCount || 64;
    this.activeColor = null;
    this.mouseFrom = { row: null, col: null };
    this.currentIndex = null;
    this.prevIndex = null;
    this.memorizedCanvasData = null;
    this.activeTool = activeTool || 'draw';
    this.primColor = primColor || 'rgb(0,0,0)';
    this.secColor = secColor || 'rgb(0,0,0,0)';
    this.canvasElem = document.querySelector('.main-canvas');
    this.ctx = this.canvasElem.getContext('2d');
    this.canvasData = canvasData || this.createEmptyCanvasData();
  }

  get cellLength() {
    return this.SIDE_LENGTH / this.sideCellCount;
  }

  get cachedDataUrl() {
    return this.canvasElem.toDataURL();
  }

  get state() {
    return {
      canvasData: this.canvasData,
      SIDE_LENGTH: this.SIDE_LENGTH,
      sideCellCount: this.sideCellCount,
      cellLength: this.cellLength,
      activeTool: this.activeTool,
      primColor: this.primColor,
      secColor: this.secColor,
    };
  }

  getColorOfCurrentIndex() {
    return this.canvasData[this.currentIndex];
  }

  getCurrentCoords() {
    return common.indexToRowCol(this.currentIndex, this.sideCellCount);
  }

  getIndicesChangedByTool(toolName = this.activeTool) {
    const {
      currentIndex, prevIndex, sideCellCount, canvasData, TRANSPARENT_COLOR,
    } = this;

    switch (toolName) {
      case 'draw':
        return toolsList.draw(prevIndex, currentIndex, sideCellCount);

      case 'eraser':
        this.activeColor = TRANSPARENT_COLOR;
        return toolsList.draw(prevIndex, currentIndex, sideCellCount);

      case 'paintBucket':
        return toolsList.paintBucket(currentIndex, sideCellCount, canvasData);

      case 'paintAll':
        return toolsList.paintAll(currentIndex, canvasData);

      case 'mirrorDraw':
        return toolsList.mirrorDraw(prevIndex, currentIndex, sideCellCount);

      default:
        return [];
    }
  }

  createEmptyCanvasData() {
    const { sideCellCount: side, TRANSPARENT_COLOR } = this;

    return new Array(side * side).fill(TRANSPARENT_COLOR);
  }

  updateFields(...fields) {
    Object.assign(this, ...fields);
  }

  updateCurrentIndexIfChanged(x, y) {
    const idx = common.coordsToIndex(x, y, this.sideCellCount, this.cellLength);

    if (this.currentIndexIsChanged(idx)) {
      this.setNewCurrentIndex(idx);

      return true;
    }

    return false;
  }

  setNewCanvasData(newData) {
    this.canvasData = newData;
  }

  loadCanvasFromCache() {
    // TODO: change on redraw
    const img = new Image();
    const { cachedDataUrl, ctx, SIDE_LENGTH: side } = this;

    img.onload = () => {
      ctx.clearRect(0, 0, side, side);
      ctx.drawImage(img, 0, 0, side, side);
    };
    img.src = cachedDataUrl || '';
  }

  memorizeCanvasData() {
    this.memorizedCanvasData = [...this.canvasData];
  }

  currentIndexIsChanged(idx) {
    return this.currentIndex !== idx;
  }

  setNewCurrentIndex(idx) {
    this.prevIndex = this.currentIndex;
    this.currentIndex = idx;
  }

  fullCanvasRedraw() {
    this.canvasData.forEach((color, idx) => {
      this.paintCell(idx, color);
    });
  }

  paintCell(idx, color) {
    const { cellLength, ctx, sideCellCount } = this;
    const { row, col } = common.indexToRowCol(idx, sideCellCount);

    ctx.fillStyle = color;
    ctx.clearRect(col * cellLength, row * cellLength, cellLength, cellLength);
    ctx.fillRect(col * cellLength, row * cellLength, cellLength, cellLength);
  }

  paintIndexIfColorIsDifferent(idx, newColor) {
    const cellColor = this.canvasData[idx];

    if (cellColor === newColor || idx === null) return;

    this.canvasData[idx] = newColor;
    this.paintCell(idx, newColor);
  }

  handleIndicesToDraw(indicesArr, colorsArr = []) {
    indicesArr.forEach((idx, num) => {
      const activeColor = colorsArr[num] || this.activeColor;

      this.paintIndexIfColorIsDifferent(idx, activeColor);
    });
  }

  changeCanvasSize(side) {
    const { TRANSPARENT_COLOR, sideCellCount, canvasData } = this;
    const emptyCanvasData = new Array(side ** 2).fill(TRANSPARENT_COLOR);
    const rowCountDiff = sideCellCount - side;
    const canvasDataCopy = [...canvasData];

    const newCanvasData = emptyCanvasData.map((_, idx) => {
      const row = Math.floor(idx / side);
      const col = idx % side;
      const relevantIndex = common.rowColToIndex(
        row + rowCountDiff,
        col + rowCountDiff,
        sideCellCount,
      );
      const colorOfRelevantIndex = canvasDataCopy[relevantIndex] || TRANSPARENT_COLOR;

      return colorOfRelevantIndex;
    });

    this.canvasData = newCanvasData;
  }

  init() {
    this.fullCanvasRedraw();
  }

  // insertImage(image) {
  //   const { width, height } = image;
  //   const {
  //     ctx, sideCellCount, SIDE_LENGTH, cellLength,
  //   } = this;
  //   const aspectRatio = width > height ? width / height : height / width;
  //   const scaledWidth = Math.round(width > height ? sideCellCount : sideCellCount / aspectRatio);
  //   const scaledHeight = Math.round(height > width ? sideCellCount : sideCellCount / aspectRatio);
  //   const finalWidth = width > height ? SIDE_LENGTH : scaledWidth * cellLength;
  //   const finalHeight = height > width ? SIDE_LENGTH : scaledHeight * cellLength;

  //   const tempCanvas = document.createElement('canvas');
  //   tempCanvas.width = scaledWidth;
  //   tempCanvas.height = scaledHeight;
  //   const tempCtx = tempCanvas.getContext('2d');

  //   tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

  //   ctx.imageSmoothingEnabled = false;
  //   ctx.drawImage(
  //     tempCanvas,
  //     Math.round((sideCellCount - scaledWidth) / 2) * cellLength,
  //     Math.round((sideCellCount - scaledHeight) / 2) * cellLength,
  //     finalWidth,
  //     finalHeight,
  //   );

  //   this.updateCanvasColors();
  // }

  // updateCanvasColors() {
  //   const { ctx, SIDE_LENGTH, canvasData } = this;
  //   const dataImage = ctx.getImageData(0, 0, SIDE_LENGTH, SIDE_LENGTH).data;

  //   const newCanvasData = canvasData.map((color, idx) => {
  //     const colorIndices = this.getColorIndicesForCoords(idx);
  //     return CanvasComponent.imageDataToRgba(dataImage, colorIndices);
  //   });

  //   this.updateCanvasData(newCanvasData);
  // }

  // getColorIndicesForCoords(idx) {
  //   const red = (Math.floor(idx / this.sideCellCount) * this.sideCellCount * this.cellLength
  //       + (idx % this.sideCellCount))
  //     * this.cellLength
  //     * 4;

  //   return [red, red + 1, red + 2, red + 3];
  // }

  // static imageDataToRgba(data, indices) {
  //   return `rgba(${data[indices[0]]},${data[indices[1]]},${data[indices[2]]},${data[indices[3]]
  //     / 255})`;
  // }

  // grayscale() {
  //   const imageData = this.ctx.getImageData(0, 0, this.SIDE_LENGTH, this.SIDE_LENGTH);
  //   const { data } = imageData;

  //   for (let i = 0; i < data.length; i += 4) {
  //     const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
  //     data[i] = avg;
  //     data[i + 1] = avg;
  //     data[i + 2] = avg;
  //   }

  //   this.ctx.putImageData(imageData, 0, 0);
  //   this.updateCanvasColors();
  // }
}
