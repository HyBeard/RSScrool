export default class ToolSupport {
  constructor(state) {
    this.canvasState = state.general;
    this.state = state;
    this.mouseFrom = { row: null, col: null };
    this.currentIndex = null;
    this.prevIndex = null;
    this.indicesToDraw = [];
    this.indicesColors = [];
  }

  get currentCanvasData() {
    const { currentFrame } = this.state.framesListData;
    const { currentLayerNumb } = this.state.layersListData;

    return currentFrame.canvasData[currentLayerNumb];
  }

  indexToRowCol(idx) {
    const { sideCellCount } = this.canvasState;
    const row = Math.floor(idx / sideCellCount);
    const col = idx % sideCellCount;

    return { row, col };
  }

  coordsToIndex(x, y) {
    if (x < 0 || y < 0) return null;

    const { sideCellCount } = this.canvasState;
    const { cellLength } = this.canvasState;

    const col = Math.floor(x / cellLength);
    const row = Math.floor(y / cellLength);

    return row * sideCellCount + col;
  }

  coordsToRowCol(x, y) {
    const { cellLength } = this.canvasState;

    const col = Math.floor(x / cellLength);
    const row = Math.floor(y / cellLength);

    return { row, col };
  }

  rowColToIndex(row, col) {
    const { sideCellCount } = this.canvasState;

    if (row < 0 || row >= sideCellCount || col < 0 || col >= sideCellCount) return null;

    return row * sideCellCount + col;
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
    if (this.currentIndex === null || this.prevIndex === null) return false;

    const { row: prevRow, col: prevCol } = this.indexToRowCol(this.prevIndex);
    const { row, col } = this.indexToRowCol(this.currentIndex);

    if (Math.abs(row - prevRow) > 1 || Math.abs(col - prevCol) > 1) {
      return true;
    }

    return false;
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

  getRectangleCoords(from, to) { //eslint-disable-line
    const coords = {
      colStart: Math.min(from.col, to.col),
      rowStart: Math.min(from.row, to.row),
      colEnd: Math.max(from.col, to.col),
      rowEnd: Math.max(from.row, to.row),
    };

    return coords;
  }

  updateStateColors(prim, sec) {
    if (prim) {
      this.state.general.primColor = prim;
    }
    if (sec) {
      this.state.general.secColor = sec;
    }
  }

  clearPointsToDraw() {
    this.indicesToDraw.length = 0;
    this.indicesColors.length = 0;
  }
}
