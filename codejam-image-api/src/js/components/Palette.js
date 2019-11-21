import Canvas from './Canvas';
import View from './View';
import keyboardShortcuts from '../shortcuts/keyboardShortcuts';
import APILoader from './APILoader';
import 'babel-polyfill';

const apiLoader = new APILoader();

const view = new View();

export default class Palette {
  constructor(savedState = {}) {
    this.canvasState = new Canvas(savedState.canvasState || {});
    this.activeTool = savedState.activeTool || 'draw';
    this.primColor = savedState.primColor || 'rgb(0,0,0)';
    this.secColor = savedState.secColor || 'rgba(0,0,0,0)';

    this.mousePressed = false;
  }

  updateStateColors(prim, sec) {
    if (prim) {
      this.primColor = prim;
    }
    if (sec) {
      this.secColor = sec;
    }
  }

  async uploadImage(query) {
    const imgUrl = await apiLoader.getImgUrl(query);
    const image = new Image();
    image.crossOrigin = 'Anonymous';

    image.onload = () => this.canvasState.drawImage(image);

    image.src = imgUrl;
  }

  updateCanvasColors() {
    const dataImage = this.ctx.getImageData(
      0,
      0,
      this.SIDE_LENGTH,
      this.SIDE_LENGTH,
    ).data;

    const newCanvasData = this.canvasData.map((color, idx) => {
      const colorIndices = Canvas.getColorIndicesForCoords(
        idx,
        this.cellLength,
        this.sideCellCount,
      );
      return Canvas.imageDataToRgba(dataImage, colorIndices);
    });

    this.canvasData = newCanvasData;
  }

  static getColorIndicesForCoords(idx, pixelSize, cellCount) {
    const red = (Math.floor(idx / cellCount) * cellCount * pixelSize
        + (idx % cellCount))
      * pixelSize
      * 4;

    return [red, red + 1, red + 2, red + 3];
  }

  static imageDataToRgba(data, indices) {
    return `rgba(${data[indices[0]]},${data[indices[1]]},${
      data[indices[2]]
    },${data[indices[3]] / 255})`;
  }

  grayscale() {
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.SIDE_LENGTH,
      this.SIDE_LENGTH,
    );
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
    }

    this.ctx.putImageData(imageData, 0, 0);
    this.updateCanvasColors();
  }

  addHeaderListeners() {
    const header = document.querySelector('.header');
    const sizeSelector = document.querySelector('.canvas-size-selector');

    header.addEventListener('click', ({ target }) => {
      if (target.classList.contains('save-state')) {
        localStorage.setItem('state', JSON.stringify(this));
      } else if (target.classList.contains('delete-state')) {
        localStorage.removeItem('state', JSON.stringify(this));
      } else if (target.classList.contains('upload-image')) {
        const filterInput = document.querySelector('.image-filter');
        const query = {
          [filterInput.dataset.filter]: filterInput.value,
        };
        this.uploadImage(query);
      } else if (target.classList.contains('grayscaling')) {
        this.canvasState.grayscale();
      }
    });

    sizeSelector.addEventListener('change', (ev) => {
      const { value } = ev.target;

      view.updateCanvasSizeInfo(value);
      this.canvasState.changeCanvasSize(value);
    });
  }

  addShortcutsListeners() {
    document.addEventListener('keydown', ({ code }) => {
      if (!Object.prototype.hasOwnProperty.call(keyboardShortcuts, code)) {
        return;
      }

      this.activeTool = keyboardShortcuts[code];

      view.selectTool(this.activeTool);
    });
  }

  addPaletteListeners() {
    const palette = document.querySelector('.palette-container');

    palette.addEventListener('mousedown', (ev) => {
      if (ev.target.classList.contains('palette-item')) {
        const color = ev.target.style.backgroundColor;

        if (ev.button === 0) {
          this.updateStateColors(color);
        } else if (ev.button === 2) {
          this.updateStateColors(false, color);
        }
      } else if (ev.target.classList.contains('swap-colors')) {
        this.updateStateColors(this.secColor, this.primColor);
      } else return;

      view.updateLastColors(this.primColor, this.secColor);
    });

    palette.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });
  }

  addCanvasListeners() {
    const canvas = document.querySelector('.main-canvas');

    canvas.addEventListener(
      'mousedown',
      (ev) => {
        this.mousePressed = true;
        ev.preventDefault();

        if (this.activeTool === 'eyedropper') {
          const color = this.canvasState.getColor();

          if (ev.button === 0) {
            this.updateStateColors(color);
          } else if (ev.button === 2) {
            this.updateStateColors(false, color);
          }

          view.updateLastColors(this.primColor, this.secColor);

          return;
        }

        if (ev.button === 0) {
          this.canvasState.activeColor = this.primColor;
        } else {
          this.canvasState.activeColor = this.secColor;
        }

        this.canvasState[this.activeTool]();

        this.canvasState.setDirtyIndices();
        this.canvasState.handleDirtyIndices(this.mousePressed);
      },
      false,
    );

    canvas.addEventListener(
      'mousemove',
      (ev) => {
        if (this.canvasState.coordsIsChanged(ev.offsetX, ev.offsetY)) {
          this.canvasState.updateCoordsInfo(ev);
        } else return;

        if (!this.mousePressed) return;

        if (this.canvasState[this.activeTool]) {
          this.canvasState.clearPointsToDraw();
          this.canvasState[this.activeTool]();
        }

        this.canvasState.setDirtyIndices();
      },
      false,
    );

    canvas.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });

    canvas.addEventListener(
      'mouseleave',
      () => {
        this.canvasState.updateCoordsInfo();
      },
      false,
    );

    window.addEventListener(
      'mouseup',
      () => {
        if (!this.mousePressed) return;
        this.mousePressed = false;

        if (this.canvasState.dirtyIndices.length !== 0) {
          this.canvasState.handleDirtyIndices(this.mousePressed);
        }

        window.cancelAnimationFrame(this.canvasState.reqAnimId);
        this.canvasState.clearPointsToDraw();
      },
      false,
    );
  }

  addToolsListeners() {
    const toolsContainer = document.querySelector('.tools-container');

    toolsContainer.addEventListener('click', ({ target }) => {
      if (
        !target.classList.contains('canvas-tool')
        || target.classList.contains('disabled')
      ) {
        return;
      }

      this.activeTool = target.dataset.name;
      view.selectTool(target.dataset.name);
    });
  }

  addListeners() {
    this.addHeaderListeners();
    this.addShortcutsListeners();
    this.addPaletteListeners();
    this.addCanvasListeners();
    this.addToolsListeners();
  }

  initialize() {
    view.initView(this);
    this.canvasState.initCanvas();
    this.addListeners();
  }
}
