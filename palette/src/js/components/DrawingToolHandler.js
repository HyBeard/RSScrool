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
}
