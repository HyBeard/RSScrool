import toolsSupport from '../toolsSupport';

export default function move(currentIndex, mouseFrom, sideCellCount, canvasData, memorizedData) {
  const { col: colStart, row: rowStart } = mouseFrom;
  const { col: colEnd, row: rowEnd } = toolsSupport.indexToRowCol(currentIndex, sideCellCount);
  const colWalk = colEnd - colStart;
  const rowWalk = rowEnd - rowStart;

  const dataToDraw = canvasData.reduce(
    (res, _, idx) => {
      const { row, col } = toolsSupport.indexToRowCol(idx, sideCellCount);
      const newIdx = toolsSupport.rowColToIndex(row - rowWalk, col - colWalk, sideCellCount);
      const colorFromSaved = memorizedData[newIdx] || null;

      res.indicesToDraw.push(idx);
      res.indicesColors.push(colorFromSaved);

      return res;
    },
    { indicesToDraw: [], indicesColors: [] },
  );

  return dataToDraw;
}
