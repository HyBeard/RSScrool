import EventEmitter from '../../helpers/EventEmitter';

export default class UserInterface extends EventEmitter {
  constructor() {
    super();
    this.header = document.querySelector('.header');
    this.sizeSelector = document.querySelector('.canvas-size-selector');
    this.imageQueryInput = document.querySelector('.image-query');
    this.toolsContainer = document.querySelector('.tools-container');
    this.palette = document.querySelector('.palette-container');
    this.primColorElem = document.querySelector('.primary-color');
    this.secColorElem = document.querySelector('.secondary-color');
    this.sizeSelector = document.querySelector('.canvas-size-selector');
    this.sizeInfoContainer = document.querySelector('.canvas-size-info');
    this.coordsContainer = document.querySelector('.target-coords');
  }

  selectTool(tool) {
    const selectedToolBtn = document.querySelector(`li[data-name=${tool}]`);

    if (this.currentToolElem) this.currentToolElem.classList.remove('active');

    selectedToolBtn.classList.add('active');
    this.currentToolElem = selectedToolBtn;
  }

  renderLastColors(primColor, secColor) {
    function setBgIfNotTransparent(color) {
      return color === null ? '' : color;
    }

    this.primColorElem.style.background = setBgIfNotTransparent(primColor);
    this.secColorElem.style.background = setBgIfNotTransparent(secColor);
  }

  swapColors(primBg, secBg) {
    this.primColorElem.style.background = secBg || '';
    this.secColorElem.style.background = primBg || '';
  }

  renderCanvasSizeInfo(side) {
    this.sizeInfoContainer.innerText = `[${side}x${side}]`;
  }

  updateDisplayedValues(sideLength) {
    [...this.sizeSelector.options].forEach((option, index) => {
      if (Number(option.value) === sideLength) {
        this.sizeSelector.selectedIndex = index;
      }
    });

    this.renderCanvasSizeInfo(sideLength);
  }

  clearCoordsContainer() {
    this.coordsContainer.innerText = '';
  }

  updateCoordsContainer(row, col) {
    this.coordsContainer.innerText = `${row}:${col}`;
  }

  addToolbarListeners() {
    this.toolsContainer.addEventListener('click', ({ target: { classList, dataset } }) => {
      if (!classList.contains('canvas-tool') || classList.contains('disabled')) return;

      const toolName = dataset.name;

      this.selectTool(toolName);
      this.emit('changeTool', toolName);
    });
  }

  addSettingsListeners() {
    this.header.addEventListener('click', ({ target: { classList } }) => {
      if (classList.contains('save-state')) {
        this.emit('saveAppState'); // TODO:
        return;
      }

      if (classList.contains('delete-state')) {
        this.emit('deleteAppState'); // TODO:
        return;
      }

      if (classList.contains('upload-image')) {
        const query = this.imageQueryInput.value;

        this.emit('uploadImage', query); // TODO:

        return;
      }

      if (classList.contains('grayscaling')) {
        this.emit('grayscaleCanvas'); // TODO:
      }
    });

    this.sizeSelector.addEventListener('change', ({ target: { value } }) => {
      this.renderCanvasSizeInfo(value);
      this.emit('changeCanvasSize', Number(value)); // TODO:
    });
  }

  addPaletteListeners() {
    this.palette.addEventListener(
      'mousedown',
      ({ target: { classList, style }, button: mouseBtnCode }) => {
        const primBg = this.primColorElem.style.background;
        const secBg = this.secColorElem.style.background;

        if (classList.contains('palette-item')) {
          const color = style.backgroundColor;

          if (mouseBtnCode) {
            this.renderLastColors(primBg, color);
          } else this.renderLastColors(color, secBg);

          this.emit('pickNewColor', mouseBtnCode, color);

          return;
        }

        if (classList.contains('swap-colors')) {
          this.swapColors(primBg, secBg);
          this.emit('swapColors');
        }
      },
    );

    this.palette.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });
  }

  addListeners() {
    this.addSettingsListeners();
    this.addToolbarListeners();
    this.addPaletteListeners();

    const canvas = document.querySelector('.main-canvas');
    canvas.addEventListener('mouseleave', this.clearCoordsContainer.bind(this));
  }

  init({
    activeTool, primColor, secColor, fpsValue, sideCellCount,
  }) {
    this.updateDisplayedValues(sideCellCount, fpsValue);
    this.selectTool(activeTool);
    this.renderLastColors(primColor, secColor);
    this.addListeners();
  }
}
