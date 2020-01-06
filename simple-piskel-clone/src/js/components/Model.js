import CanvasComponent from './CanvasComponent';
import View from './View';
import keyboardShortcuts from '../shortcuts/keyboardShortcuts';
import APILoader from './APILoader';
import 'babel-polyfill';

const apiLoader = new APILoader();
const view = new View();

export default class Model {
  constructor(savedState = {}) {
    this.canvasComponent = new CanvasComponent(savedState.canvasComponent || {});
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
    const imgUrl = Object.values(query)[0]
      ? await apiLoader.getImgUrl(query)
      : await apiLoader.getImgUrl();
    const image = new Image();

    image.crossOrigin = 'Anonymous';

    image.onload = () => this.canvasComponent.insertImage(image);

    image.src = imgUrl;
  }

  updateCanvasColors() {
    const dataImage = this.ctx.getImageData(0, 0, this.SIDE_LENGTH, this.SIDE_LENGTH).data;

    const newCanvasData = this.canvasData.map((color, idx) => {
      const colorIndices = CanvasComponent.getColorIndicesForCoords(
        idx,
        this.cellLength,
        this.sideCellCount,
      );
      return CanvasComponent.imageDataToRgba(dataImage, colorIndices);
    });

    this.canvasData = newCanvasData;
  }

  static getColorIndicesForCoords(idx, pixelSize, cellCount) {
    const red = (Math.floor(idx / cellCount)
      * cellCount * pixelSize + (idx % cellCount)) * pixelSize * 4;

    return [red, red + 1, red + 2, red + 3];
  }

  static imageDataToRgba(data, indices) {
    return `rgba(${data[indices[0]]},${data[indices[1]]},${data[indices[2]]},${data[indices[3]]
      / 255})`;
  }

  grayscale() {
    const imageData = this.ctx.getImageData(0, 0, this.SIDE_LENGTH, this.SIDE_LENGTH);
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

  changeActiveTool(tool) {
    this.activeTool = tool;
  }

  addHeaderListeners() {
    const header = document.querySelector('.header');
    const sizeSelector = document.querySelector('.canvas-size-selector');

    header.addEventListener('click', (ev) => {
      const { classList } = ev.target;

      if (classList.contains('save-state')) {
        localStorage.setItem('state', JSON.stringify(this));
        return;
      }

      if (classList.contains('delete-state')) {
        localStorage.removeItem('state', JSON.stringify(this));
        return;
      }

      if (classList.contains('upload-image')) {
        const filterInput = document.querySelector('.image-filter');
        const query = {
          [filterInput.dataset.filter]: filterInput.value,
        };

        this.uploadImage(query);

        return;
      }

      if (classList.contains('grayscaling')) {
        this.canvasComponent.grayscale();
      }
    });

    sizeSelector.addEventListener('change', (ev) => {
      const { value } = ev.target;

      view.updateCanvasSizeInfo(value);
      this.canvasComponent.changeCanvasSize(value);
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
      const { classList, style } = ev.target;

      if (classList.contains('palette-item')) {
        const color = style.backgroundColor;

        switch (ev.button) {
          case 0:
            this.updateStateColors(color);
            break;
          default:
            this.updateStateColors(false, color);
        }
      } else if (classList.contains('swap-colors')) {
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

    canvas.addEventListener('mousedown', (ev) => {
      const { canvasComponent } = this;

      this.mousePressed = true;
      ev.preventDefault();

      if (this.activeTool === 'eyedropper') {
        const color = canvasComponent.getColor();

        switch (ev.button) {
          case 0:
            this.updateStateColors(color);
            break;
          default:
            this.updateStateColors(false, color);
        }

        view.updateLastColors(this.primColor, this.secColor);

        return;
      }

      switch (ev.button) {
        case 0:
          this.canvasComponent.activeColor = this.primColor;
          break;
        default:
          this.canvasComponent.activeColor = this.secColor;
      }

      this.canvasComponent[this.activeTool]();

      canvasComponent.handleIndicesToDraw();
    });

    canvas.addEventListener('mousemove', (ev) => {
      const { canvasComponent } = this;

      if (canvasComponent.coordsIsChanged(ev.offsetX, ev.offsetY)) {
        canvasComponent.updateCoordsInfo(ev);
      } else return;

      if (!this.mousePressed) return;

      if (this.canvasComponent[this.activeTool]) {
        canvasComponent.clearPointsToDraw();
        this.canvasComponent[this.activeTool]();
      }

      canvasComponent.handleIndicesToDraw();
    });

    canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());

    canvas.addEventListener('mouseleave', this.canvasComponent.updateCoordsInfo, false);

    window.addEventListener('mouseup', () => {
      const { canvasComponent } = this;

      if (!this.mousePressed) return;
      this.mousePressed = false;

      window.cancelAnimationFrame(canvasComponent.reqAnimId);
      canvasComponent.clearPointsToDraw();
    });
  }


  addListeners() {
    this.addHeaderListeners();
    this.addShortcutsListeners();
    this.addPaletteListeners();
    this.addCanvasListeners();
    this.addToolsListeners();
  }

  init() {
    view.init(this);
    this.canvasComponent.initCanvas();
    this.addListeners();
  }
}
