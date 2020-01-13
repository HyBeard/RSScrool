import toolsSupport from '../toolsSupport';
import draw from './draw';

export default function mirrorDraw(prevIndex, currentIndex, sideCellCount) {
  const targetIndices = draw(prevIndex, currentIndex, sideCellCount);
  const mirrorIndices = targetIndices.reduce((res, index) => {
    const { row, col } = toolsSupport.indexToRowCol(index, sideCellCount);
    const mirrorIdx = toolsSupport.rowColToIndex(row, sideCellCount - col - 1, sideCellCount);

    res.push(mirrorIdx);

    return res;
  }, []);

  return [...targetIndices, ...mirrorIndices];
}
