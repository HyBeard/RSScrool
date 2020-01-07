import EventEmitter from '../helpers/EventEmitter';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.FRAME_PREVIEW_SIDE_LENGTH = 128;
    this.canvas = document.querySelector('.main-canvas');
    this.toolsContainer = document.querySelector('.tools-container');
    this.palette = document.querySelector('.palette');
    this.primColorElem = document.querySelector('.primary-color');
    this.secColorElem = document.querySelector('.secondary-color');
    this.sizeInfoContainer = document.querySelector('.canvas-size-info');
    this.coordsContainer = document.querySelector('.target-coords');

    this.currentTool = null;
    this.mousePressed = false;
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

    this.primColorElem.style.background = primBackground;
    this.secColorElem.style.background = secBackground;
  }

  updateCanvasSizeInfo(side) {
    this.sizeInfoContainer.innerText = `[${side}x${side}]`;
  }

  static updateDisplayedValues(sideLength) { // FIXME: [...opt.map...]
    const [canvasSizeSelector] = document.getElementsByClassName('canvas-size-selector');

    Array.prototype.forEach.call(canvasSizeSelector.options, (option, index) => {
      if (Number(option.value) === sideLength) {
        canvasSizeSelector.selectedIndex = index;
      }
    });
  }

  init(AppState) {
    const {
      activeTool, primColor, secColor, sideCellCount,
    } = AppState;

    View.updateDisplayedValues(sideCellCount);
    this.updateCanvasSizeInfo(sideCellCount);
    this.selectTool(activeTool);
    this.updateLastColors(primColor, secColor);
    this.addListeners();
  }

  clearCoordsContainer() {
    this.coordsContainer.innerText = '';
  }

  updateCoordsContainer(row, col) {
    this.coordsContainer.innerText = `${row}:${col}`;
  }

  addToolsListeners() {
    this.toolsContainer.addEventListener('click', ({ target: { classList, dataset } }) => {
      if (!classList.contains('canvas-tool') || classList.contains('disabled')) return;

      const toolName = dataset.name;

      this.emit('toolChanged', toolName);
      this.selectTool(toolName);
    });
  }

  addCanvasListeners() {
    this.canvas.addEventListener('mousedown', (ev) => {
      const mouseBtnCode = ev.button;

      ev.preventDefault();
      this.mousePressed = true;

      this.emit('drawingStarted', mouseBtnCode);
    });

    this.canvas.addEventListener('mousemove', (ev) => {
      const { offsetX: x, offsetY: y } = ev;

      this.emit('cursorPositionChanged', x, y);

      if (!this.mousePressed) return;

      this.emit('continueDrawing');
    });

    this.canvas.addEventListener('mouseleave', this.clearCoordsContainer.bind(this));

    window.addEventListener('mouseup', () => {
      if (!this.mousePressed) return;

      this.mousePressed = false;
      this.emit('drawingEnded');
    });

    this.canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }


  addListeners() {
    this.addCanvasListeners();
    this.addToolsListeners();
  }
}
