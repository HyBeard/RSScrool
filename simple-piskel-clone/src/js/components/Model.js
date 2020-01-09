import CanvasComponent from './CanvasComponent';
import APILoader from './APILoader';
import FramesComponent from './FramesComponent';
import keyboardShortcuts from '../data/keyboardShortcuts';
import 'babel-polyfill';

export default class Model {
  constructor(savedState) {
    this.canvasComponent = new CanvasComponent(savedState.canvasState || {});
    this.framesComponent = new FramesComponent(savedState.framesState || {});
    this.apiLoader = new APILoader();
    this.activeTool = savedState.activeTool || 'draw';
    this.primColor = savedState.primColor || 'rgb(0,0,0)';
    this.secColor = savedState.secColor || 'rgba(0,0,0,0)';
    // this.fpsValue = savedState.fpsValue;
    this.keyboardShortcuts = keyboardShortcuts;
  }

  get appState() {
    return {
      canvasState: this.canvasComponent.state,
      framesState: {
        listOfFrames: this.framesComponent.listOfFrames,
        currentFrameNumber: this.framesComponent.currentFrameNumber,
      },
      activeTool: this.activeTool,
      primColor: this.primColor,
      secColor: this.secColor,
      keyboardShortcuts: this.keyboardShortcuts,
    };
  }

  saveState() {
    localStorage.setItem('piskelState', JSON.stringify(this.appState));
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
    const { canvasComponent, framesComponent } = this;
    const updatedCurrentFrameData = canvasComponent.canvasData;

    canvasComponent.clearPointsToDraw();
    framesComponent.currentFrameData = updatedCurrentFrameData;
    framesComponent.currentFrameDataURL = canvasComponent.cachedDataUrl;
  }

  init() {
    const {
      framesComponent,
      canvasComponent,
      canvasComponent: {
        state: { sideCellCount },
      },
    } = this;

    framesComponent.init(sideCellCount);
    canvasComponent.init(framesComponent.currentFrameData);
  }

  async uploadImage(query) {
    const { canvasComponent, framesComponent, apiLoader } = this;
    const imgUrl = await apiLoader.getImgUrl(query);
    const image = new Image();

    return new Promise((resolve) => {
      image.crossOrigin = 'Anonymous';
      image.onload = () => {
        canvasComponent.insertImage(image);
        framesComponent.currentFrameData = canvasComponent.canvasData;
        framesComponent.currentFrameDataURL = canvasComponent.cachedDataUrl;

        resolve();
      };
      image.src = imgUrl;
    });
  }

  grayscale() {
    const { canvasComponent, framesComponent } = this;

    canvasComponent.grayscale();
    framesComponent.currentFrameData = canvasComponent.canvasData;
    framesComponent.currentFrameDataURL = canvasComponent.cachedDataUrl;
  }
}
