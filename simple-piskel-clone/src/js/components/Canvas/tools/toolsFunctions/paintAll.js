export default function paintAll(currentIndex, canvasData) {
  const targetColor = canvasData[currentIndex];
  const sameColorIndices = canvasData.reduce((indicesToDraw, color, index) => {
    if (color === targetColor) {
      indicesToDraw.push(index);
    }

    return indicesToDraw;
  }, []);

  return sameColorIndices;
}
