const toolsTypes = {
  singleEffect: {
    selection: ['shapeSelection'],
    drawing: ['paintBucket', 'paintAll'],
    colorPick: ['eyedropper'],
  },
  continuousEffect: {
    selection: ['rectangleSelection', 'lassoSelection'],
    drawing: {
      simple: ['draw', 'mirrorDraw', 'dithering', 'lighten', 'eraser'],
      requiringCanvasReload: ['stroke', 'rectangle', 'circle'],
    },
    moving: ['move'],
  },
};

export default toolsTypes;

export function toolIsInCategory(category, tool) {
  let toolIn = false;

  const traverse = (cat) => {
    Object.entries(cat).forEach(([, toolsList]) => {
      if (typeof toolsList === 'object') {
        traverse(toolsList);
      }

      if (toolsList.includes(tool)) toolIn = true;
    }, false);
  };

  traverse(category);

  return toolIn;
}
