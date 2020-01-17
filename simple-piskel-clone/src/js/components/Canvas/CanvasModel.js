import toolsSupport from './tools/toolsSupport';
import toolsList from './tools/toolsList';
import supportFunctions from '../../helpers/supportFunctions';

export default class CanvasModel {
  constructor(savedState) {
    const {
      canvasData, activeTool, primColor, secColor, sideCellCount, penSize,
    } = savedState;

    this.TRANSPARENT_COLOR = 'rgba(0,0,0,0)';
    this.SIDE_LENGTH = 512;
    this.sideCellCount = sideCellCount || 32;
    this.penSize = penSize || 1;
    this.activeColor = null;
    this.initialCoords = { row: null, col: null };
    this.currentIndex = null;
    this.prevIndex = null;
    this.memorizedCanvasData = null;
    this.activeTool = activeTool || 'draw';
    this.primColor = primColor || 'rgb(0,0,0)';
    this.secColor = secColor || null;
    this.canvasElem = document.querySelector('.canvas_box--canvas');
    this.ctx = this.canvasElem.getContext('2d');
    this.canvasData = canvasData || this.createEmptyCanvasData();
    this.changedBeforeIndices = [];
    this.ghostCanvas = supportFunctions.createDomElement('canvas', '', {
      width: this.sideCellCount,
      height: this.sideCellCount,
    });
    this.ghostContext = this.ghostCanvas.getContext('2d');
  }

  get cellLength() {
    return this.SIDE_LENGTH / this.sideCellCount;
  }

  get currentCoords() {
    return toolsSupport.indexToRowCol(this.currentIndex, this.sideCellCount);
  }

  get state() {
    return {
      canvasData: this.canvasData,
      SIDE_LENGTH: this.SIDE_LENGTH,
      sideCellCount: this.sideCellCount,
      cellLength: this.cellLength,
      penSize: this.penSize,
      activeTool: this.activeTool,
      primColor: this.primColor,
      secColor: this.secColor,
    };
  }

  minCanvasToDataUrl() {
    const {
      ghostCanvas, ghostContext, canvasElem, sideCellCount,
    } = this;

    ghostContext.clearRect(0, 0, sideCellCount, sideCellCount);
    ghostContext.drawImage(canvasElem, 0, 0, sideCellCount, sideCellCount);

    return ghostCanvas.toDataURL();
  }

  getToolAnswer(toolName = this.activeTool) {
    const {
      currentIndex,
      prevIndex,
      sideCellCount,
      canvasData,
      initialCoords,
      memorizedCanvasData,
    } = this;

    switch (toolName) {
      case 'draw': {
        const indices = toolsList.draw(prevIndex, currentIndex, sideCellCount);
        return this.upgradeIndicesBasedOnPenSize(indices);
      }

      case 'eraser': {
        this.activeColor = null;
        const indices = toolsList.draw(prevIndex, currentIndex, sideCellCount);
        return this.upgradeIndicesBasedOnPenSize(indices);
      }

      case 'paintBucket':
        return toolsList.paintBucket(currentIndex, sideCellCount, [...canvasData]);

      case 'paintAll':
        return toolsList.paintAll(currentIndex, canvasData);

      case 'mirrorDraw': {
        const indices = toolsList.mirrorDraw(prevIndex, currentIndex, sideCellCount);
        return this.upgradeIndicesBasedOnPenSize(indices);
      }

      case 'stroke': {
        const indices = toolsList.stroke(currentIndex, initialCoords, sideCellCount);
        return this.upgradeIndicesBasedOnPenSize(indices);
      }

      case 'rectangle': {
        const indices = toolsList.rectangle(currentIndex, initialCoords, sideCellCount);
        return this.upgradeIndicesBasedOnPenSize(indices);
      }

      case 'circle': {
        const indices = toolsList.circle(currentIndex, initialCoords, sideCellCount);
        return this.upgradeIndicesBasedOnPenSize(indices);
      }

      case 'move':
        return toolsList.move(
          currentIndex,
          initialCoords,
          sideCellCount,
          canvasData,
          memorizedCanvasData,
        );

      default:
        return [];
    }
  }

  createEmptyCanvasData() {
    return new Array(this.sideCellCount ** 2).fill(null);
  }

  updateCurrentIndexIfChanged(x, y) {
    const idx = toolsSupport.coordsToIndex(x, y, this.sideCellCount, this.cellLength);

    if (this.currentIndex !== idx) {
      this.setNewCurrentIndex(idx);

      return true;
    }

    return false;
  }

  memorizeCanvasBeforeDrawing() {
    const { sideCellCount: side, canvasElem, currentIndex } = this;

    this.memorizedCanvasData = [...this.canvasData];
    this.initialCoords = toolsSupport.indexToRowCol(currentIndex, side);
    this.ghostContext.clearRect(0, 0, side, side);
    this.ghostContext.drawImage(canvasElem, 0, 0, side, side);
  }

  setNewCurrentIndex(idx) {
    this.prevIndex = this.currentIndex;
    this.currentIndex = idx;
  }

  fullCanvasRedraw() {
    this.canvasData.forEach((color, idx) => {
      this.paintCell(idx, color);
    });
  }

  paintCell(idx, color) {
    const { cellLength, ctx, sideCellCount } = this;
    const { row, col } = toolsSupport.indexToRowCol(idx, sideCellCount);

    ctx.fillStyle = color || this.TRANSPARENT_COLOR;
    ctx.clearRect(col * cellLength, row * cellLength, cellLength, cellLength);
    ctx.fillRect(col * cellLength, row * cellLength, cellLength, cellLength);
  }

  paintIndexIfColorIsDifferent(idx, newColor) {
    const cellColor = this.canvasData[idx];

    if (cellColor === newColor || idx === null) return;

    this.canvasData[idx] = newColor;
    this.paintCell(idx, newColor);
  }

  upgradeIndicesBasedOnPenSize(indicesArr) {
    if (this.penSize === 1) return indicesArr;

    const nearestIndices = indicesArr.reduce((arr, idx) => {
      const indicesBunch = toolsSupport.getBoxOfIndicesAroundTarget(
        idx,
        this.penSize,
        this.sideCellCount,
      );

      return [...arr, ...indicesBunch];
    }, []);

    return Array.from(new Set(nearestIndices));
  }

  handleIndicesToDraw(indicesArr, colorsArr) {
    indicesArr.forEach((idx, num) => {
      const activeColor = colorsArr.length === 0 ? this.activeColor : colorsArr[num];

      this.paintIndexIfColorIsDifferent(idx, activeColor);
    });
  }

  revertBackToPreviousData(indicesArr) {
    const memorizedColors = this.changedBeforeIndices.map((idx) => this.memorizedCanvasData[idx]);

    this.handleIndicesToDraw(this.changedBeforeIndices, memorizedColors);
    this.changedBeforeIndices = indicesArr;
  }

  getResizedDataAndImageUrl(side, currentData, currentImg) {
    const { getResizedImageUrl, getResizedCanvasData } = toolsList.resize;
    const { sideCellCount } = this;
    const resizedData = getResizedCanvasData(sideCellCount, side, currentData);
    const resizedImgUrl = currentImg ? getResizedImageUrl(sideCellCount, side, currentImg) : '';

    return { resizedData, resizedImgUrl };
  }

  async drawCanvasFromSavedImageUrl(url) {
    const { ctx, SIDE_LENGTH: side } = this;

    ctx.clearRect(0, 0, side, side);

    if (url) {
      const savedImage = await supportFunctions.convertDataUrlToImg(url);
      ctx.drawImage(savedImage, 0, 0, side, side);
    }
  }

  pasteImgAfterReduceIt(img) {
    const imgColorIndices = toolsList.getColorIndicesOfReducedImg(img, this.sideCellCount);

    Object.assign(this.canvasData, imgColorIndices);
    this.fullCanvasRedraw();
  }

  init() {
    const { ghostCanvas, sideCellCount, ctx } = this;

    ctx.imageSmoothingEnabled = false;
    ghostCanvas.width = sideCellCount;
    ghostCanvas.height = sideCellCount;

    this.fullCanvasRedraw();
  }
}
