import EventEmitter from '../helpers/EventEmitter';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.FRAME_PREVIEW_SIDE_LENGTH = 128;
    this.currentTool = null;
    this.sizeInfoContainer = document.querySelector('.canvas-size-info');
    this.layersCollection = document.querySelector('.layer');
    this.palette = document.querySelector('.palette');
    this.primColor = document.querySelector('.primary-color');
    this.secColor = document.querySelector('.secondary-color');

    this.coordsContainer = document.querySelector('.target-coords');
    this.activeColor = null;
    this.mousePressed = false;
    this.toolsContainer = document.querySelector('.tools-container');
    this.canvas = document.querySelector('.main-canvas');
  }

  static createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  }

  selectTool(tool) {
    const currentToolBtn = document.querySelector(`li[data-name=${this.currentTool}]`);
    const selectedToolBtn = document.querySelector(`li[data-name=${tool}]`);

    if (this.currentTool) currentToolBtn.classList.remove('active');

    selectedToolBtn.classList.add('active');
    this.currentTool = tool;
  }

  updateLastColors(primColor, secColor) {
    function getCorrectBackground(color) {
      if (color === 'rgba(0,0,0,0)') {
        return `url(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABlBMVEXV1dXb29tFGkCIAAAAHklEQVR4AWNghAIGCMDgjwgFCDDSw2M0PSCD0fQAACRcAgF4ciGUAAAAAElFTkSuQmCC'
      ) repeat`;
      }
      return color;
    }

    const primBackground = getCorrectBackground(primColor);
    const secBackground = getCorrectBackground(secColor);

    this.primColor.style.background = primBackground;
    this.secColor.style.background = secBackground;
  }

  updateCanvasSizeInfo(side) {
    this.sizeInfoContainer.innerText = `[${side}x${side}]`;
  }

  static updateDisplayedValues(sideLength) {
    const [canvasSizeSelector] = document.getElementsByClassName('canvas-size-selector');

    Array.prototype.forEach.call(canvasSizeSelector.options, (option, index) => {
      if (Number(option.value) === sideLength) {
        canvasSizeSelector.selectedIndex = index;
      }
    });
  }

  init(state) {
    const {
      activeTool,
      primColor,
      secColor,
      canvasComponent: { sideCellCount },
    } = state;

    View.updateDisplayedValues(sideCellCount);
    this.updateCanvasSizeInfo(sideCellCount);
    this.selectTool(activeTool);
    this.updateLastColors(primColor, secColor);
  }
}
