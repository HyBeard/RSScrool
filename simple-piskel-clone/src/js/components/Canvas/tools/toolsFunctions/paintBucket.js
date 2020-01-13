import toolsSupport from '../toolsSupport';

const { indexToRowCol } = toolsSupport;

export default function paintBucket(currentIndex, sideCellCount, canvasData) {
  // TODO:
  const cellsStack = [currentIndex];
  const startColor = canvasData[currentIndex];
  const indicesToDraw = [];

  const equalToStartColor = (cellIdx) => canvasData[cellIdx] === startColor;

  while (cellsStack.length) {
    let checkedIdx = cellsStack.pop();
    let reachLeft = false;
    let reachRight = false;

    while (checkedIdx >= 0 && equalToStartColor(checkedIdx)) {
      checkedIdx -= sideCellCount;
    }

    checkedIdx += sideCellCount;

    while (equalToStartColor(checkedIdx)) {
      const { row } = indexToRowCol(checkedIdx, sideCellCount);
      const lIndex = checkedIdx - 1;
      const rIndex = checkedIdx + 1;
      const { row: lIndexRow } = indexToRowCol(lIndex, sideCellCount);
      const { row: rIndexRow } = indexToRowCol(rIndex, sideCellCount);

      indicesToDraw.push(checkedIdx);

      if (lIndexRow === row) {
        if (!reachLeft) {
          if (equalToStartColor(lIndex) && !indicesToDraw.includes(lIndex)) {
            cellsStack.push(lIndex);
            indicesToDraw.push(lIndex);
            reachLeft = true;
          }
        } else if (!equalToStartColor(lIndex)) {
          reachLeft = false;
        }
      }

      if (rIndexRow === row) {
        if (!reachRight) {
          if (equalToStartColor(rIndex) && !indicesToDraw.includes(rIndex)) {
            cellsStack.push(rIndex);
            indicesToDraw.push(rIndex);
            reachRight = true;
          }
        } else if (!equalToStartColor(rIndex)) {
          reachRight = false;
        }
      }

      checkedIdx += sideCellCount;
    }
  }

  return indicesToDraw;
}
