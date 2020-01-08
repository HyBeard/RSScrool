import EventEmitter from '../helpers/EventEmitter';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.FRAME_PREVIEW_SIDE_LENGTH = 128;
    this.header = document.querySelector('.header');
    this.sizeSelector = document.querySelector('.canvas-size-selector');
    this.ImageQueryInput = document.querySelector('.image-query');
    this.canvas = document.querySelector('.main-canvas');
    this.toolsContainer = document.querySelector('.tools-container');
    this.palette = document.querySelector('.palette-container');
    this.primColorElem = document.querySelector('.primary-color');
    this.secColorElem = document.querySelector('.secondary-color');
    this.sizeInfoContainer = document.querySelector('.canvas-size-info');
    this.coordsContainer = document.querySelector('.target-coords');
    this.currentToolElem = null;

    this.mousePressed = false;
  }

  static createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  }

  selectTool(tool) {
    const selectedToolBtn = document.querySelector(`li[data-name=${tool}]`);

    if (this.currentToolElem) this.currentToolElem.classList.remove('active');

    selectedToolBtn.classList.add('active');
    this.currentToolElem = selectedToolBtn;
  }

  updateLastColors(primColor, secColor) {
    function setBgIfNotTransparent(color) {
      return color !== 'rgba(0,0,0,0)' ? color : '';
    }

    this.primColorElem.style.background = setBgIfNotTransparent(primColor);
    this.secColorElem.style.background = setBgIfNotTransparent(secColor);
  }

  updateCanvasSizeInfo(side) {
    this.sizeInfoContainer.innerText = `[${side}x${side}]`;
  }

  static updateDisplayedValues(sideLength) {
    // FIXME: [...opt.map...]
    const [canvasSizeSelector] = document.getElementsByClassName('canvas-size-selector');

    Array.prototype.forEach.call(canvasSizeSelector.options, (option, index) => {
      if (Number(option.value) === sideLength) {
        canvasSizeSelector.selectedIndex = index;
      }
    });
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

  addHeaderListeners() {
    this.header.addEventListener('click', ({ target: { classList } }) => {
      if (classList.contains('save-state')) {
        this.emit('saveState');
        return;
      }

      if (classList.contains('delete-state')) {
        this.emit('clearState');
        return;
      }

      if (classList.contains('upload-image')) {
        const query = this.ImageQueryInput.value;

        this.emit('uploadImage', query);

        return;
      }

      if (classList.contains('grayscaling')) {
        this.emit('grayscaleCanvas');
      }
    });

    this.sizeSelector.addEventListener('change', ({ target: { value } }) => {
      this.emit('changeCanvasSize', value);
    });
  }

  addPaletteListeners() {
    this.palette.addEventListener(
      'mousedown',
      ({ target: { classList, style }, button: mouseBtnCode }) => {
        if (classList.contains('palette-item')) {
          const color = style.backgroundColor;
          this.emit('pickNewColor', color, mouseBtnCode);

          return;
        }

        if (classList.contains('swap-colors')) {
          this.emit('swapColors');
        }
      },
    );

    this.palette.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });
  }

  addListeners() {
    this.addHeaderListeners();
    this.addToolsListeners();
    this.addPaletteListeners();
    this.addCanvasListeners();
  }

  init(AppState) {
    const {
      activeTool,
      primColor,
      secColor,
      canvasState: { sideCellCount },
    } = AppState;

    View.updateDisplayedValues(sideCellCount);
    this.updateCanvasSizeInfo(sideCellCount);
    this.selectTool(activeTool);
    this.updateLastColors(primColor, secColor);
    this.addListeners();
  }
}
