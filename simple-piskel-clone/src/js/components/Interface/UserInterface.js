import EventEmitter from '../../helpers/EventEmitter';
import keyboardShortcuts from '../Canvas/tools/shortcuts/shortcuts';

export default class UserInterface extends EventEmitter {
  constructor() {
    super();
    this.header = document.querySelector('.header');
    this.sizeSelector = document.querySelector('.canvas-size-selector');
    this.imageQueryInput = document.querySelector('.image-query');
    this.toolbar = document.querySelector('.toolbar');
    this.palette = document.querySelector('.palette-container');
    this.primColorElem = document.querySelector('.primary-color');
    this.secColorElem = document.querySelector('.secondary-color');
    this.sizeSelector = document.querySelector('.canvas-size-selector');
    this.sizeInfoContainer = document.querySelector('.canvas-size-info');
    this.coordsContainer = document.querySelector('.target-coords');

    this.keyboardShortcuts = keyboardShortcuts;
  }

  static selectTool(tool) {
    document.querySelector('.canvas-tool.active').classList.remove('active');
    document.querySelector(`li[data-name=${tool}]`).classList.add('active');
  }

  static selectPenSize(size) {
    document.querySelector('.pen-size.active').classList.remove('active');
    document.querySelector(`[data-pen-size='${size}']`).classList.add('active');
  }

  selectToolByPressedKey({ code }) {
    if (code in this.keyboardShortcuts) {
      const toolName = keyboardShortcuts[code];

      UserInterface.selectTool(toolName);
      this.emit('changeTool', toolName);
    }
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
    this.toolbar.addEventListener('click', ({ target }) => {
      if (target.classList.contains('disabled')) return;

      if (target.classList.contains('canvas-tool')) {
        const toolName = target.dataset.name;

        UserInterface.selectTool(toolName);
        this.emit('changeTool', toolName);

        return;
      }

      if (target.classList.contains('pen-size')) {
        const { penSize } = target.dataset;

        UserInterface.selectPenSize(penSize);
        this.emit('changePenSize', Number(penSize));
      }
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

  addShortcutsListeners() {
    document.addEventListener('keydown', this.selectToolByPressedKey.bind(this));
  }

  addListeners() {
    this.addSettingsListeners();
    this.addToolbarListeners();
    this.addPaletteListeners();
    this.addShortcutsListeners();

    const canvas = document.querySelector('.main-canvas');
    canvas.addEventListener('mouseleave', this.clearCoordsContainer.bind(this));
  }

  init({
    activeTool, primColor, secColor, fpsValue, sideCellCount, penSize,
  }) {
    this.addListeners();
    this.updateDisplayedValues(sideCellCount, fpsValue);
    UserInterface.selectTool(activeTool);
    UserInterface.selectPenSize(penSize);
    this.renderLastColors(primColor, secColor);
  }
}
