export default class StaticTools {
  constructor(toolSupport) {
    this.toolSupport = toolSupport;
  }

  draw(idx) {
    this.toolSupport.indicesToDraw.push(idx);

    if (this.toolSupport.indicesAreMissed()) {
      const mouseFrom = this.toolSupport.indexToRowCol(this.toolSupport.prevIndex);
      const mouseTo = this.toolSupport.indexToRowCol(this.toolSupport.currentIndex);

      this.toolSupport.indicesToDraw = this.toolSupport.drawLine(mouseFrom, mouseTo);
    }
  }

  paintBucket(idx, state) {
    const cellsStack = [idx];
    const colouredCells = [];
    const { canvasData } = state.general;
    const { sideCellCount } = state.general;
    const startColor = canvasData[idx];

    function matchStartColor(cellIdx) {
      return canvasData[cellIdx] === startColor;
    }

    while (cellsStack.length) {
      let checkedIdx = cellsStack.pop();
      let reachLeft = false;
      let reachRight = false;

      while (checkedIdx >= 0 && matchStartColor(checkedIdx)) {
        checkedIdx -= sideCellCount;
      }
      checkedIdx += sideCellCount;

      while (matchStartColor(checkedIdx)) {
        const { row } = this.toolSupport.indexToRowCol(checkedIdx);

        this.toolSupport.indicesToDraw.push(checkedIdx);

        if (!reachLeft) {
          const { row: nextRow } = this.toolSupport.indexToRowCol(checkedIdx - 1);
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
          const { row: nextRow } = this.toolSupport.indexToRowCol(checkedIdx + 1);
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

        checkedIdx += sideCellCount;
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getColor(idx, state) {
    return state.general.canvasData[idx];
  }

  eraser(idx, state) {
    this.draw(idx);

    this.toolSupport.indicesToDraw.forEach(() => {
      this.toolSupport.indicesColors.push(state.general.DEFAULT_COLOR);
    });
  }

  paintAll(idx, state) {
    const { canvasData } = state.general;
    const targetColor = canvasData[idx];

    if (targetColor === state.general.activeColor) return;

    const sameColorIndices = canvasData.reduce((acc, color, index) => {
      if (color !== targetColor) return acc;

      acc.push(index);

      return acc;
    }, []);

    this.toolSupport.indicesToDraw = [...sameColorIndices];
  }

  mirrorDraw(idx, state) {
    this.draw(idx);
    this.toolSupport.indicesToDraw.forEach((index) => {
      const { row, col } = this.toolSupport.indexToRowCol(index);
      const mirrorIdx = this.toolSupport.rowColToIndex(row, state.general.sideCellCount - col - 1);

      this.toolSupport.indicesToDraw.push(mirrorIdx);
    });
  }

}
