export default class CanvasComponent {
  constructor(savedCanvasState = {}) {
    this.state = {
      SIDE_LENGTH: 512,
      sideCellCount: savedCanvasState.sideCellCount || 16,

      get cellLength() {
        return this.SIDE_LENGTH / this.sideCellCount;
      },
    };

    this.TRANSPARENT_COLOR = 'rgba(0,0,0,0)';
    this.activeColor = null;
    this.mouseFrom = { row: null, col: null };
    this.currentIndex = null;
    this.prevIndex = null;
    this.indicesToDraw = [];
    this.indicesColors = [];
    this.reqAnimId = null;
    this.ctx = document.querySelector('.main-canvas').getContext('2d');
  }

  get canvasData() {
    return this.state.canvasData;
  }

  set canvasData(newData) {
    this.state.canvasData = [...newData];
  }

  indexToRowCol(idx) {
    const row = Math.floor(idx / this.state.sideCellCount);
    const col = idx % this.state.sideCellCount;

    return { row, col };
  }

  coordsToIndex(x, y) {
    const { row, col } = this.coordsToRowCol(x, y);

    return row * this.state.sideCellCount + col;
  }

  coordsToRowCol(x, y) {
    const col = Math.floor(x / this.state.cellLength);
    const row = Math.floor(y / this.state.cellLength);

    return { row, col };
  }

  rowColToIndex(row, col) {
    if (row < 0 || row >= this.state.sideCellCount || col < 0 || col >= this.state.sideCellCount) {
      return null;
    }

    return row * this.state.sideCellCount + col;
  }

  currentIndexIsChanged(idx) {
    return this.currentIndex !== idx;
  }

  setNewCurrentIndex(idx) {
    this.prevIndex = this.currentIndex;
    this.currentIndex = idx;
  }

  indicesAreMissed() {
    if (this.currentIndex === null || this.prevIndex === null) {
      return false;
    }

    const { row: prevRow, col: prevCol } = this.indexToRowCol(this.prevIndex);
    const { row, col } = this.indexToRowCol(this.currentIndex);

    if (Math.abs(row - prevRow) > 1 || Math.abs(col - prevCol) > 1) {
      return true;
    }

    return false;
  }

  paintCell(idx, color) {
    const { row, col } = this.indexToRowCol(idx);
    const argsToCanvasDrawing = [
      col * this.state.cellLength,
      row * this.state.cellLength,
      this.state.cellLength,
      this.state.cellLength,
    ];

    this.ctx.fillStyle = color;
    this.ctx.clearRect(...argsToCanvasDrawing);
    this.ctx.fillRect(...argsToCanvasDrawing);
  }

  setUniqueColorIndicesInCanvasData(idx, newColor) {
    const cellColor = this.state.canvasData[idx];

    if (cellColor === newColor || idx === null) return;

    this.state.canvasData[idx] = newColor;
  }

  handleIndicesToDraw() {
    this.indicesToDraw.forEach((idx, num) => {
      const activeColor = this.indicesColors[num] || this.activeColor;

      this.setUniqueColorIndicesInCanvasData(idx, activeColor);
      this.paintCell(idx, activeColor);
    });
  }

  fullCanvasRedraw() {
    this.state.canvasData.forEach((color, idx) => {
      this.paintCell(idx, color);
    });
  }

  changeCanvasSize(side) {
    const emptyCanvasData = new Array(side ** 2).fill(this.TRANSPARENT_COLOR);
    const rowCountDiff = this.state.sideCellCount - side;
    const canvasDataCopy = [...this.state.canvasData];

    const newCanvasData = emptyCanvasData.map((_, idx) => {
      const row = Math.floor(idx / side);
      const col = idx % side;

      return (
        canvasDataCopy[this.rowColToIndex(row + rowCountDiff, col + rowCountDiff)]
        || this.TRANSPARENT_COLOR
      );
    });

    this.state.canvasData = newCanvasData;

    this.state.sideCellCount = Number(side);
    this.fullCanvasRedraw();
  }

  drawLine(mouseFrom, mouseTo) {
    const points = [];
    let from = mouseFrom;
    let to = mouseTo;

    if (Math.abs(from.col - to.col) > Math.abs(from.row - to.row)) {
      if (from.col > to.col) [from, to] = [to, from];
      const slope = (to.row - from.row) / (to.col - from.col);
      for (let { col, row } = from; col <= to.col; col += 1) {
        points.push(this.rowColToIndex(Math.round(row), col));
        row += slope;
      }
    } else {
      if (from.row > to.row) [from, to] = [to, from];
      const slope = (to.col - from.col) / (to.row - from.row);
      for (let { col, row } = from; row <= to.row; row += 1) {
        points.push(this.rowColToIndex(row, Math.round(col)));
        col += slope;
      }
    }

    return points;
  }

  clearPointsToDraw() {
    this.indicesToDraw.length = 0;
    this.indicesColors.length = 0;
  }

  draw() {
    this.indicesToDraw.push(this.currentIndex);

    if (this.indicesAreMissed()) {
      const mouseFrom = this.indexToRowCol(this.prevIndex);
      const mouseTo = this.indexToRowCol(this.currentIndex);

      this.indicesToDraw = this.drawLine(mouseFrom, mouseTo);
    }
  }

  paintBucket() {
    const cellsStack = [this.currentIndex];
    const colouredCells = [];
    const startColor = this.state.canvasData[this.currentIndex];

    const matchStartColor = (cellIdx) => this.state.canvasData[cellIdx] === startColor;

    while (cellsStack.length) {
      let checkedIdx = cellsStack.pop();
      let reachLeft = false;
      let reachRight = false;

      while (checkedIdx >= 0 && matchStartColor(checkedIdx)) {
        checkedIdx -= this.state.sideCellCount;
      }
      checkedIdx += this.state.sideCellCount;

      while (matchStartColor(checkedIdx)) {
        const { row } = this.indexToRowCol(checkedIdx);

        this.indicesToDraw.push(checkedIdx);

        if (!reachLeft) {
          const { row: nextRow } = this.indexToRowCol(checkedIdx - 1);
          if (
            nextRow === row
            && matchStartColor(checkedIdx - 1)
            && !colouredCells.includes(checkedIdx - 1)
          ) {
            cellsStack.push(checkedIdx - 1);
            colouredCells.push(checkedIdx - 1);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }

        if (!reachRight) {
          const { row: nextRow } = this.indexToRowCol(checkedIdx + 1);
          if (
            nextRow === row
            && matchStartColor(checkedIdx + 1)
            && !colouredCells.includes(checkedIdx + 1)
          ) {
            cellsStack.push(checkedIdx + 1);
            colouredCells.push(checkedIdx + 1);
            reachRight = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }

        checkedIdx += this.state.sideCellCount;
      }
    }
  }

  getColor() {
    return this.state.canvasData[this.currentIndex];
  }

  eraser() {
    this.draw();

    this.indicesToDraw.forEach(() => {
      this.indicesColors.push(this.TRANSPARENT_COLOR);
    });
  }

  paintAll() {
    const targetColor = this.state.canvasData[this.currentIndex];

    this.state.canvasData.forEach((color, index) => {
      if (color !== targetColor) return;

      this.indicesToDraw.push(index);
    });
  }

  mirrorDraw() {
    this.draw();
    this.indicesToDraw.forEach((index) => {
      const { row, col } = this.indexToRowCol(index);
      const mirrorIdx = this.rowColToIndex(row, this.state.sideCellCount - col - 1);

      this.indicesToDraw.push(mirrorIdx);
    });
  }

  dithering() {
    let secColor;

    if (this.activeColor === this.primColor) {
      ({ secColor } = this);
    } else secColor = this.primColor;

    this.draw();

    this.indicesToDraw.forEach((index) => {
      const { row, col } = this.indexToRowCol(index);

      if ((row + col) % 2 === 0) {
        this.indicesColors.push(this.activeColor);
      } else {
        this.indicesColors.push(secColor);
      }
    });
  }

  init(currentFrameCanvasData) {
    this.canvasData = currentFrameCanvasData;
    this.fullCanvasRedraw();
  }

  insertImage(image) {
    const { width, height } = image;
    const {
      ctx,
      state: { sideCellCount, SIDE_LENGTH, cellLength },
    } = this;
    const aspectRatio = width > height ? width / height : height / width;
    const scaledWidth = Math.round(width > height ? sideCellCount : sideCellCount / aspectRatio);
    const scaledHeight = Math.round(height > width ? sideCellCount : sideCellCount / aspectRatio);
    const finalWidth = width > height ? SIDE_LENGTH : scaledWidth * cellLength;
    const finalHeight = height > width ? SIDE_LENGTH : scaledHeight * cellLength;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      tempCanvas,
      Math.round((sideCellCount - scaledWidth) / 2) * cellLength,
      Math.round((sideCellCount - scaledHeight) / 2) * cellLength,
      finalWidth,
      finalHeight,
    );

    this.updateCanvasColors();
  }

  updateCanvasColors() {
    const dataImage = this.ctx.getImageData(0, 0, this.state.SIDE_LENGTH, this.state.SIDE_LENGTH)
      .data;

    const newCanvasData = this.state.canvasData.map((color, idx) => {
      const colorIndices = this.getColorIndicesForCoords(idx);
      return CanvasComponent.imageDataToRgba(dataImage, colorIndices);
    });

    this.state.canvasData = newCanvasData;
  }

  getColorIndicesForCoords(idx) {
    const red = (Math.floor(idx / this.state.sideCellCount)
        * this.state.sideCellCount
        * this.state.cellLength
        + (idx % this.state.sideCellCount))
      * this.state.cellLength
      * 4;

    return [red, red + 1, red + 2, red + 3];
  }

  static imageDataToRgba(data, indices) {
    return `rgba(${data[indices[0]]},${data[indices[1]]},${data[indices[2]]},${data[indices[3]]
      / 255})`;
  }

  grayscale() {
    const imageData = this.ctx.getImageData(0, 0, this.state.SIDE_LENGTH, this.state.SIDE_LENGTH);
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
