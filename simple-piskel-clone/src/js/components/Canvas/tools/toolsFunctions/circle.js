import toolsSupport from '../toolsSupport';

export default function circle(currentIndex, mouseFrom, sideCellCount) {
  const mouseTo = toolsSupport.indexToRowCol(currentIndex, sideCellCount);
  const coords = toolsSupport.getRectangleCoords(mouseFrom, mouseTo);
  const indicesToDraw = [];

  const midCol = Math.round((coords.colStart + coords.colEnd) / 2);
  const midRow = Math.round((coords.rowStart + coords.rowEnd) / 2);
  const evenCol = (coords.colStart + coords.colEnd) % 2;
  const evenRow = (coords.rowStart + coords.rowEnd) % 2;
  const colRadius = coords.colEnd - midCol;
  const rowRadius = coords.rowEnd - midRow;

  let col;
  let row;
  let angle;

  for (col = coords.colStart; col <= midCol; col += 1) {
    angle = Math.acos((col - midCol) / colRadius);
    row = Math.round(rowRadius * Math.sin(angle) + midRow);
    indicesToDraw.push(toolsSupport.rowColToIndex(row, col - evenCol, sideCellCount));
    indicesToDraw.push(
      toolsSupport.rowColToIndex(2 * midRow - row - evenRow, col - evenCol, sideCellCount),
    );
    indicesToDraw.push(toolsSupport.rowColToIndex(row, 2 * midCol - col, sideCellCount));
    indicesToDraw.push(
      toolsSupport.rowColToIndex(2 * midRow - row - evenRow, 2 * midCol - col, sideCellCount),
    );
  }
  for (row = coords.rowStart; row <= midRow; row += 1) {
    angle = Math.asin((row - midRow) / rowRadius);
    col = Math.round(colRadius * Math.cos(angle) + midCol);
    indicesToDraw.push(toolsSupport.rowColToIndex(row - evenRow, col, sideCellCount));
    indicesToDraw.push(
      toolsSupport.rowColToIndex(row - evenRow, 2 * midCol - col - evenCol, sideCellCount),
    );
    indicesToDraw.push(toolsSupport.rowColToIndex(2 * midRow - row, col, sideCellCount));
    indicesToDraw.push(
      toolsSupport.rowColToIndex(2 * midRow - row, 2 * midCol - col - evenCol, sideCellCount),
    );
  }

  return indicesToDraw;
}
