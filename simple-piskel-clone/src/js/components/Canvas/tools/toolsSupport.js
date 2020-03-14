const toolsSupport = {
  indexToRowCol: (idx, sideCellCount) => {
    const row = Math.floor(idx / sideCellCount);
    const col = idx % sideCellCount;

    return { row, col };
  },

  coordsToIndex: (x, y, sideCellCount, cellLength) => {
    const { row, col } = toolsSupport.coordsToRowCol(x, y, cellLength);

    return row * sideCellCount + col;
  },

  coordsToRowCol: (x, y, cellLength) => {
    const col = Math.floor(x / cellLength);
    const row = Math.floor(y / cellLength);

    return { row, col };
  },

  rowColToIndex: (row, col, sideCellCount) => {
    if (row < 0 || row >= sideCellCount || col < 0 || col >= sideCellCount) {
      return null;
    }

    return row * sideCellCount + col;
  },

  getIndicesBetweenTwoPoints: (mouseFrom, mouseTo, sideCellCount) => {
    const points = [];
    let from = mouseFrom;
    let to = mouseTo;

    if (Math.abs(from.col - to.col) > Math.abs(from.row - to.row)) {
      if (from.col > to.col) [from, to] = [to, from];
      const slope = (to.row - from.row) / (to.col - from.col);
      for (let { col, row } = from; col <= to.col; col += 1) {
        points.push(toolsSupport.rowColToIndex(Math.round(row), col, sideCellCount));
        row += slope;
      }
    } else {
      if (from.row > to.row) [from, to] = [to, from];
      const slope = (to.col - from.col) / (to.row - from.row);
      for (let { col, row } = from; row <= to.row; row += 1) {
        points.push(toolsSupport.rowColToIndex(row, Math.round(col), sideCellCount));
        col += slope;
      }
    }

    return points;
  },

  getRectangleCoords(from, to) {
    const coords = {
      colStart: Math.min(from.col, to.col),
      rowStart: Math.min(from.row, to.row),
      colEnd: Math.max(from.col, to.col),
      rowEnd: Math.max(from.row, to.row),
    };

    return coords;
  },

  getBoxOfIndicesAroundTarget(targetIdx, boxSize, sideCellCount) {
    const botRightSize = Math.floor(boxSize / 2);
    const topLeftSize = boxSize - botRightSize - 1;
    const { row: targetRow, col: targetCol } = toolsSupport.indexToRowCol(targetIdx, sideCellCount);
    const startRow = targetRow - topLeftSize;
    const startCol = targetCol - topLeftSize;
    const endRow = targetRow + botRightSize;
    const endCol = targetCol + botRightSize;
    const boxOfIndices = [];

    for (let r = startRow; r <= endRow; r += 1) {
      for (let c = startCol; c <= endCol; c += 1) {
        const nearIndex = toolsSupport.rowColToIndex(r, c, sideCellCount);

        if (nearIndex !== null) boxOfIndices.push(nearIndex);
      }
    }

    return boxOfIndices;
  },

  cellsWasMissed(mouseFrom, mouseTo) {
    const { row: prevRow, col: prevCol } = mouseFrom;
    const { row, col } = mouseTo;

    if (Math.abs(row - prevRow) > 1 || Math.abs(col - prevCol) > 1) {
      return true;
    }

    return false;
  },

  imageDataToRgbaIndices(dataImage, cellLength = 1) {
    const ELEMENTS_ON_ONE_RGBA = 4;
    const rgbaIndicesArr = [];

    dataImage.forEach((idx, num) => {
      if ((num * cellLength) % ELEMENTS_ON_ONE_RGBA === 0) {
        const rgbaColorArr = [
          idx,
          dataImage[num + 1],
          dataImage[num + 2],
          dataImage[num + 3],
        ];
        rgbaIndicesArr.push(this.colorArrToRgbaString(rgbaColorArr));
      }
    });

    return rgbaIndicesArr;
  },

  colorArrToRgbaString(colorArr) {
    return `rgba(${colorArr[0]},${colorArr[1]},${colorArr[2]},${colorArr[3] / 255})`;
  },
};

export default toolsSupport;
