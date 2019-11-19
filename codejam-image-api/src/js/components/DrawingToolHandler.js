import 'babel-polyfill';
import APILoader from './APILoader';

const apiLoader = new APILoader();

export default class DrawingToolHandler {
  constructor(context, state, toolSupport) {
    this.ctx = context;
    this.state = state;
    this.toolSupport = toolSupport;
    this.dirtyIndices = [];
    this.changedIndices = [];
    this.reqAnimId = null;
  }

  setDirtyIndices(indicesArr, colorsArr) {
    let activeColor;

    indicesArr.forEach((idx, num) => {
      const cellColor = this.state.general.canvasData[idx];
      activeColor = colorsArr[num] || this.state.general.activeColor;

      if (cellColor === activeColor || idx === null) return;

      this.state.general.canvasData[idx] = activeColor;
      this.dirtyIndices.push(idx);
    });
  }

  paintCell(idx, color) {
    const { row, col } = this.toolSupport.indexToRowCol(idx);
    const { cellLength } = this.state.general;

    this.ctx.fillStyle = color;
    this.ctx.clearRect(col * cellLength, row * cellLength, cellLength, cellLength);
    this.ctx.fillRect(col * cellLength, row * cellLength, cellLength, cellLength);
  }

  handleDirtyIndices(mousedown) {
    if (mousedown) {
      this.reqAnimId = requestAnimationFrame(() => {
        this.handleDirtyIndices(mousedown);
      });
    }

    this.dirtyIndices.forEach((idx) => {
      const color = this.state.general.canvasData[idx];

      this.paintCell(idx, color);
    });

    this.changedIndices.push(...this.dirtyIndices);
    this.dirtyIndices.length = 0;
  }

  changeMainCanvas() {
    this.state.general.canvasData.forEach((color, idx) => {
      this.paintCell(idx, color);
    });
  }

  saveCanvasState() {
    this.state.general.savedState = [...this.state.generale.canvasData];
  }

  reloadCanvasState(indices) {
    const savedColors = indices.map((idx) => this.state.general.savedState[idx]);

    this.setDirtyIndices(indices, savedColors);
  }

  updateCoordsInfo(ev) {
    const coordsBox = document.getElementsByClassName('target-coords')[0];

    if (!ev) {
      this.toolSupport.currentIndex = null;
      coordsBox.innerText = '';

      return;
    }

    const { row, col } = this.toolSupport.coordsToRowCol(ev.offsetX, ev.offsetY);

    coordsBox.innerText = `${row}:${col}`;
  }

  changeCanvasSize(side) {
    const emptyCanvasData = new Array(side ** 2).fill(this.state.general.DEFAULT_COLOR);
    const rowCountDiff = this.state.general.sideCellCount - side;
    const canvasDataCopy = [...this.state.general.canvasData];

    const newCanvasData = emptyCanvasData.map((_, idx) => {
      const row = Math.floor(idx / side);
      const col = idx % side;

      return (
        canvasDataCopy[this.toolSupport.rowColToIndex(row + rowCountDiff, col + rowCountDiff)]
        || this.state.general.DEFAULT_COLOR
      );
    });

    this.state.general.canvasData = newCanvasData;

    this.state.general.sideCellCount = Number(side);
    this.changeMainCanvas();
  }

  async uploadImage() {
    const imgUrl = await apiLoader.getImgUrl();
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    const { sideCellCount, CANVAS_SIDE_LENGTH, cellLength } = this.state.general;

    image.onload = () => {
      const { width, height } = image;
      const aspectRatio = width > height ? width / height : height / width;
      const scaledWidth = Math.round(width > height ? sideCellCount : sideCellCount / aspectRatio);
      const scaledHeight = Math.round(height > width ? sideCellCount : sideCellCount / aspectRatio);
      const finalWidth = width > height ? CANVAS_SIDE_LENGTH : scaledWidth * cellLength;
      const finalHeight = height > width ? CANVAS_SIDE_LENGTH
        : scaledHeight * cellLength;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = scaledWidth;
      tempCanvas.height = scaledHeight;
      const tempCtx = tempCanvas.getContext('2d');

      tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(tempCanvas,
        Math.round((sideCellCount - scaledWidth) / 2) * cellLength,
        Math.round((sideCellCount - scaledHeight) / 2) * cellLength,
        finalWidth,
        finalHeight);

      this.updateCanvasColors();
    };

    image.src = imgUrl;
  }

  updateCanvasColors() {
    const { sideCellCount, CANVAS_SIDE_LENGTH, cellLength } = this.state.general;

    const dataImage = this.ctx.getImageData(0, 0, CANVAS_SIDE_LENGTH, CANVAS_SIDE_LENGTH).data;

    const newCanvasData = this.state.general.canvasData.map((color, idx) => {
      const colorIndices = DrawingToolHandler.getColorIndicesForCoords(idx,
        cellLength, sideCellCount);
      return DrawingToolHandler.imageDataToRgba(dataImage, colorIndices);
    });

    this.state.general.canvasData = newCanvasData;
  }


  static getColorIndicesForCoords(idx, pixelSize, cellCount) {
    const red = (Math.floor(idx / cellCount) * cellCount * pixelSize
      + (idx % cellCount)) * pixelSize * 4;

    return [red, red + 1, red + 2, red + 3];
  }


  static imageDataToRgba(data, indices) {
    return `rgba(${data[indices[0]]},${data[indices[1]]},${data[indices[2]]},${data[indices[3]] / 255})`;
  }

  grayscale() {
    const { CANVAS_SIDE_LENGTH } = this.state.general;
    const imageData = this.ctx.getImageData(0, 0, CANVAS_SIDE_LENGTH, CANVAS_SIDE_LENGTH);
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }

    this.ctx.putImageData(imageData, 0, 0);
    this.updateCanvasColors();
  }
}
