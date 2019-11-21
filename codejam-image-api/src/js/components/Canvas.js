export default class Canvas {
  constructor(savedCanvas = {}) {
    this.SIDE_LENGTH = 512;
    this.DEFAULT_COLOR = savedCanvas.DEFAULT_COLOR || 'rgba(0,0,0,0)';
    this.sideCellCount = savedCanvas.sideCellCount || 16;
    this.canvasData = savedCanvas.canvasData
      || new Array(this.sideCellCount ** 2).fill('rgba(0,0,0,0)');
    this.savedState = savedCanvas.savedState || null;
    this.activeColor = savedCanvas.activeColor || null;

    this.mouseFrom = { row: null, col: null };
    this.currentIndex = null;
    this.prevIndex = null;

    this.indicesToDraw = [];
    this.indicesColors = [];
    this.dirtyIndices = [];
    this.reqAnimId = null;
  }

  get cellLength() {
    return this.SIDE_LENGTH / this.sideCellCount;
  }

  // get currentCanvasData() {
  //   const { currentFrame } = this.this.framesListData;
  //   const { currentLayerNumb } = this.this.layersListData;

  //   return currentFrame.canvasData[currentLayerNumb];
  // }

  indexToRowCol(idx) {
    const row = Math.floor(idx / this.sideCellCount);
    const col = idx % this.sideCellCount;

    return { row, col };
  }

  coordsToIndex(x, y) {
    if (x < 0 || y < 0) return null;

    const col = Math.floor(x / this.cellLength);
    const row = Math.floor(y / this.cellLength);

    return row * this.sideCellCount + col;
  }

  coordsToRowCol(x, y) {
    const col = Math.floor(x / this.cellLength);
    const row = Math.floor(y / this.cellLength);

    return { row, col };
  }

  rowColToIndex(row, col) {
    if (
      row < 0
      || row >= this.sideCellCount
      || col < 0
      || col >= this.sideCellCount
    ) {
      return null;
    }

    return row * this.sideCellCount + col;
  }

  keepCoords(x, y) {
    Object.assign(this.mouseFrom, this.coordsToRowCol(x, y));
    this.currentIndex = this.coordsToIndex(x, y);
  }

  coordsIsChanged(x, y) {
    const idx = this.coordsToIndex(x, y);
    if (this.currentIndex !== idx) {
      this.prevIndex = this.currentIndex;
      this.currentIndex = idx;

      return true;
    }

    return false;
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

  setDirtyIndices() {
    let activeColor;

    this.indicesToDraw.forEach((idx, num) => {
      const cellColor = this.canvasData[idx];
      activeColor = this.indicesColors[num] || this.activeColor;

      if (cellColor === activeColor || idx === null) return;

      this.canvasData[idx] = activeColor;
      this.dirtyIndices.push(idx);
    });
  }

  paintCell(idx, color) {
    const { row, col } = this.indexToRowCol(idx);

    this.ctx.fillStyle = color;
    this.ctx.clearRect(
      col * this.cellLength,
      row * this.cellLength,
      this.cellLength,
      this.cellLength,
    );
    this.ctx.fillRect(
      col * this.cellLength,
      row * this.cellLength,
      this.cellLength,
      this.cellLength,
    );
  }

  handleDirtyIndices(mousedown) {
    if (mousedown) {
      this.reqAnimId = requestAnimationFrame(() => {
        this.handleDirtyIndices(mousedown);
      });
    }

    this.dirtyIndices.forEach((idx) => {
      const color = this.canvasData[idx];

      this.paintCell(idx, color);
    });

    this.dirtyIndices.length = 0;
  }

  changeMainCanvas() {
    this.canvasData.forEach((color, idx) => {
      this.paintCell(idx, color);
    });
  }

  saveCanvasState() {
    this.savedState = [...this.canvasData];
  }

  reloadCanvasState(indices) {
    const savedColors = indices.map((idx) => this.savedState[idx]);

    this.setDirtyIndices(indices, savedColors);
  }

  updateCoordsInfo(ev) {
    const coordsBox = document.getElementsByClassName('target-coords')[0];

    if (!ev) {
      this.currentIndex = null;
      coordsBox.innerText = '';

      return;
    }

    const { row, col } = this.coordsToRowCol(ev.offsetX, ev.offsetY);

    coordsBox.innerText = `${row}:${col}`;
  }

  changeCanvasSize(side) {
    const emptyCanvasData = new Array(side ** 2).fill(this.DEFAULT_COLOR);
    const rowCountDiff = this.sideCellCount - side;
    const canvasDataCopy = [...this.canvasData];

    const newCanvasData = emptyCanvasData.map((_, idx) => {
      const row = Math.floor(idx / side);
      const col = idx % side;

      return (
        canvasDataCopy[this.rowColToIndex(row + rowCountDiff, col + rowCountDiff)]
        || this.DEFAULT_COLOR
      );
    });

    this.canvasData = newCanvasData;

    this.sideCellCount = Number(side);
    this.changeMainCanvas();


    // const imageData = this.ctx.getImageData(
    //   0,
    //   0,
    //   this.SIDE_LENGTH,
    //   this.SIDE_LENGTH,
    // );

    // this.sideCellCount = Number(side);
    // const tempCanvas = document.createElement('canvas');
    // tempCanvas.width = side;
    // tempCanvas.height = side;
    // const tempCtx = tempCanvas.getContext('2d');

    // this.ctx.imageSmoothingEnabled = false;
    // tempCtx.putImageData(
    //   imageData,
    //   0,
    //   0,
    //   side,
    //   side,
    //   this.SIDE_LENGTH,
    //   this.SIDE_LENGTH,
    // );
    // this.ctx.drawImage(tempCanvas, 0, 0, this.SIDE_LENGTH, this.SIDE_LENGTH);
    // document.body.appendChild(tempCanvas);

    // this.updateCanvasColors();
  }

  drawImage(image) {
    const { width, height } = image;
    const aspectRatio = width > height ? width / height : height / width;
    const scaledWidth = Math.round(
      width > height ? this.sideCellCount : this.sideCellCount / aspectRatio,
    );
    const scaledHeight = Math.round(
      height > width ? this.sideCellCount : this.sideCellCount / aspectRatio,
    );
    const finalWidth = width > height ? this.SIDE_LENGTH : scaledWidth * this.cellLength;
    const finalHeight = height > width ? this.SIDE_LENGTH : scaledHeight * this.cellLength;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = scaledWidth;
    tempCanvas.height = scaledHeight;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(
      tempCanvas,
      Math.round((this.sideCellCount - scaledWidth) / 2) * this.cellLength,
      Math.round((this.sideCellCount - scaledHeight) / 2) * this.cellLength,
      finalWidth,
      finalHeight,
    );

    this.updateCanvasColors();
  }

  updateCanvasColors() {
    const dataImage = this.ctx.getImageData(
      0,
      0,
      this.SIDE_LENGTH,
      this.SIDE_LENGTH,
    ).data;

    const newCanvasData = this.canvasData.map((color, idx) => {
      const colorIndices = this.getColorIndicesForCoords(idx);
      return Canvas.imageDataToRgba(dataImage, colorIndices);
    });

    this.canvasData = newCanvasData;
  }

  getColorIndicesForCoords(idx) {
    const red = (Math.floor(idx / this.sideCellCount)
        * this.sideCellCount
        * this.cellLength
        + (idx % this.sideCellCount))
      * this.cellLength
      * 4;

    return [red, red + 1, red + 2, red + 3];
  }

  static imageDataToRgba(data, indices) {
    return `rgba(${data[indices[0]]},${data[indices[1]]},${
      data[indices[2]]
    },${data[indices[3]] / 255})`;
  }

  grayscale() {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.SIDE_LENGTH,
      this.SIDE_LENGTH,
    );
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

  initCanvas() {
    this.ctx = document.querySelector('.main-canvas').getContext('2d');
    this.changeMainCanvas();
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

  static getRectangleCoords(from, to) {
    const coords = {
      colStart: Math.min(from.col, to.col),
      rowStart: Math.min(from.row, to.row),
      colEnd: Math.max(from.col, to.col),
      rowEnd: Math.max(from.row, to.row),
    };

    return coords;
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
    const startColor = this.canvasData[this.currentIndex];

    const matchStartColor = (cellIdx) => this.canvasData[cellIdx] === startColor;

    while (cellsStack.length) {
      let checkedIdx = cellsStack.pop();
      let reachLeft = false;
      let reachRight = false;

      while (checkedIdx >= 0 && matchStartColor(checkedIdx)) {
        checkedIdx -= this.sideCellCount;
      }
      checkedIdx += this.sideCellCount;

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

        checkedIdx += this.sideCellCount;
      }
    }
  }

  getColor() {
    return this.canvasData[this.currentIndex];
  }

  eraser() {
    this.draw();

    this.indicesToDraw.forEach(() => {
      this.indicesColors.push(this.DEFAULT_COLOR);
    });
  }

  paintAll() {
    const targetColor = this.canvasData[this.currentIndex];

    if (targetColor === this.activeColor) return;

    const sameColorIndices = this.canvasData.reduce((acc, color, index) => {
      if (color !== targetColor) return acc;

      acc.push(index);

      return acc;
    }, []);

    this.indicesToDraw = [...sameColorIndices];
  }

  mirrorDraw() {
    this.draw();
    this.indicesToDraw.forEach((index) => {
      const { row, col } = this.indexToRowCol(index);
      const mirrorIdx = this.rowColToIndex(row, this.sideCellCount - col - 1);

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
}
