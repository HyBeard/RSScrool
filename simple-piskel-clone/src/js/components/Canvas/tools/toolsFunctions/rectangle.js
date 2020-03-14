import toolsSupport from '../toolsSupport';

export default function rectangle(currentIndex, mouseFrom, sideCellCount) {
  const mouseTo = toolsSupport.indexToRowCol(currentIndex, sideCellCount);
  const coords = toolsSupport.getRectangleCoords(mouseFrom, mouseTo);
  const indicesToDraw = [];

  for (let row = coords.rowStart; row <= coords.rowEnd; row += 1) {
    for (let col = coords.colStart; col <= coords.colEnd; col += 1) {
      if (
        row === coords.rowStart
        || row === coords.rowEnd
        || col === coords.colStart
        || col === coords.colEnd
      ) {
        indicesToDraw.push(toolsSupport.rowColToIndex(row, col, sideCellCount));
      }
    }
  }

  return indicesToDraw;
}
