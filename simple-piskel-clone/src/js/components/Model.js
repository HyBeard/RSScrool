import CanvasComponent from './CanvasComponent';
import View from './View';
import keyboardShortcuts from '../data/keyboardShortcuts';
import APILoader from './APILoader';
import 'babel-polyfill';

const apiLoader = new APILoader();
const view = new View();

export default class Model {
  constructor(savedState) {
    this.canvasComponent = new CanvasComponent(savedState.canvasState || {});
    this.activeTool = savedState.activeTool || 'draw';
    this.primColor = savedState.primColor || 'rgb(0,0,0)';
    this.secColor = savedState.secColor || 'rgba(0,0,0,0)';
    this.activeColor = null;

    this.mousePressed = false;
  }

  getAppState() {
    return {
      activeTool: this.activeTool,
      primColor: this.primColor,
      secColor: this.secColor,
      canvasState: this.canvasComponent.state,
    };
  }

  saveState() {
    const appState = this.getAppState();
    localStorage.setItem('piskelState', JSON.stringify(appState));
  }

  static clearState() {
    localStorage.removeItem('piskelState');
  }

  pickColor(color, mouseBtnCode) {
    const LEFT_MOUSE_BUTTON_CODE = 0;

    switch (mouseBtnCode) {
      case LEFT_MOUSE_BUTTON_CODE:
        this.primColor = color;
        break;
      default:
        this.secColor = color;
    }
  }

  swapColors() {
    [this.primColor, this.secColor] = [this.secColor, this.primColor];
  }

  updateStateColors(prim, sec) {
    if (prim) {
      this.primColor = prim;
    }
    if (sec) {
      this.secColor = sec;
    }
  }

  changeActiveTool(toolName) {
    this.activeTool = toolName;
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

  startDrawing(mouseBtnCode) {
    const LEFT_MOUSE_BUTTON_CODE = 0;
    const {
      canvasComponent, activeTool, primColor, secColor,
    } = this;

    switch (mouseBtnCode) {
      case LEFT_MOUSE_BUTTON_CODE:
        this.canvasComponent.activeColor = primColor;
        break;
      default:
        this.canvasComponent.activeColor = secColor;
    }

    canvasComponent[activeTool]();
    canvasComponent.handleIndicesToDraw();
  }

  updateCurrentIndexIfChanged(x, y) {
    const { canvasComponent } = this;
    const idx = canvasComponent.coordsToIndex(x, y);

    if (canvasComponent.currentIndexIsChanged(idx)) {
      canvasComponent.setNewCurrentIndex(idx);

      return true;
    }

    return false;
  }

  drawNextIndices() {
    const { canvasComponent } = this;

    canvasComponent.clearPointsToDraw();
    canvasComponent[this.activeTool]();
    canvasComponent.handleIndicesToDraw();
  }

  endDrawing() {
    const { canvasComponent } = this;

    canvasComponent.clearPointsToDraw();
  }

  addListeners() {
    this.addShortcutsListeners();
  }

  init() {
    this.canvasComponent.init();
    this.addListeners();
  }

  async uploadImage(query) {
    const imgUrl = await apiLoader.getImgUrl(query);
    const image = new Image();

    image.crossOrigin = 'Anonymous';
    image.onload = () => this.canvasComponent.insertImage(image);
    image.src = imgUrl;
  }
}
