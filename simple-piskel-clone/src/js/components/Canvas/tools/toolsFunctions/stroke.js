import toolsSupport from '../toolsSupport';

export default function stroke(currentIndex, mouseFrom, sideCellCount) {
  const mouseTo = toolsSupport.indexToRowCol(currentIndex, sideCellCount);

  return toolsSupport.getIndicesBetweenTwoPoints(mouseFrom, mouseTo, sideCellCount);
}
