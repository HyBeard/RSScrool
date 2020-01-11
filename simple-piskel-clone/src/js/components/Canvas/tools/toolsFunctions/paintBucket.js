import common from './common';

const { indexToRowCol } = common;

export default function paintBucket(currentIndex, sideCellCount, canvasData) {
  // FIXME:
  const cellsStack = [currentIndex];
  const colouredCells = [];
  const startColor = canvasData[currentIndex];
  const indicesToDraw = [];

  const matchStartColor = (cellIdx) => canvasData[cellIdx] === startColor;

  while (cellsStack.length) {
    let checkedIdx = cellsStack.pop();
    let reachLeft = false;
    let reachRight = false;

    while (checkedIdx >= 0 && matchStartColor(checkedIdx)) {
      checkedIdx -= sideCellCount;
    }
    checkedIdx += sideCellCount;

    while (matchStartColor(checkedIdx)) {
      const { row } = indexToRowCol(checkedIdx);

      indicesToDraw.push(checkedIdx);

      if (!reachLeft) {
        const { row: nextRow } = indexToRowCol(checkedIdx - 1);
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
        const { row: nextRow } = indexToRowCol(checkedIdx + 1);
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

  return indicesToDraw;
}
