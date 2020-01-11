import common from './common';

const { indexToRowCol, cellsWasMissed, getIndicesBetweenTwoPoints } = common;

export default function draw(prevIndex, currentIndex, sideCellCount) {
  const mouseFrom = indexToRowCol(prevIndex, sideCellCount);
  const mouseTo = indexToRowCol(currentIndex, sideCellCount);

  if (cellsWasMissed(mouseFrom, mouseTo)) {
    const missedIndices = getIndicesBetweenTwoPoints(mouseFrom, mouseTo, sideCellCount);

    return [currentIndex, ...missedIndices];
  }

  return [currentIndex];
}
