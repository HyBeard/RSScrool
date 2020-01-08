import CanvasComponent from './CanvasComponent';
import APILoader from './APILoader';
import FramesComponent from './FramesComponent';
import keyboardShortcuts from '../data/keyboardShortcuts';
import 'babel-polyfill';

const apiLoader = new APILoader();

export default class Model {
  constructor(savedState) {
    this.canvasComponent = new CanvasComponent(savedState.canvasState || {});
    this.framesComponent = new FramesComponent(savedState.framesState || {});
    this.activeTool = savedState.activeTool || 'draw';
    this.primColor = savedState.primColor || 'rgb(0,0,0)';
    this.secColor = savedState.secColor || 'rgba(0,0,0,0)';
    // this.fpsValue = savedState.fpsValue;
    this.keyboardShortcuts = keyboardShortcuts;
  }

  get appState() {
    return {
      canvasState: this.canvasComponent.state,
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

  // addFramesListeners() {
  //   this.framesListColumn.addEventListener('click', ({ target }) => {
  //     if (!target.closest('.frame-preview') && !target.closest('.add-frame')) return;

  //     const clickedFrame = target.closest('.frame-preview');
  //     const framesCollection = document.getElementsByClassName('frame-preview');
  //     const clickedFrameNumber = Array.prototype.indexOf.call(framesCollection, clickedFrame);

  //     if (target.classList.contains('add-frame')) {
  //       state.framesListData.addFrameData(
  //         state.general.sideCellCount,
  //         state.layersListData.listOfLayers.length,
  //       );
  //       view.addFrame();
  //     } else if (target.classList.contains('delete-frame')) {
  //       state.framesListData.deleteFrame(clickedFrameNumber);
  //       view.deleteFrame(clickedFrame);
  //     } else if (target.classList.contains('duplicate-frame')) {
  //       const newFrameNum = clickedFrameNumber + 1;

  //       view.duplicateFrame(clickedFrame);
  //       state.framesListData.duplicateFrame(clickedFrameNumber);
  //       drawingToolHandler.redrawFramePreview(view.currentFramePreview, newFrameNum);
  //     } else if (target.classList.contains('toggle-frame')) {
  //       state.framesListData.toggleFrame(clickedFrameNumber);
  //       View.toggleFrame(clickedFrame);
  //     } else if (target.parentNode.classList.contains('frame-preview')) {
  //       view.selectFrame(clickedFrame);
  //       state.framesListData.changeCurrentFrameNumber(clickedFrameNumber);
  //     }

  //     drawingToolHandler.changeMainCanvas();
  //   });
  // }

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

  init() {
    const {
      canvasComponent,
      framesComponent,
      canvasComponent: {
        state: { sideCellCount },
      },
    } = this;

    canvasComponent.init();
    framesComponent.addFrameData(sideCellCount);
  }

  async uploadImage(query) {
    const imgUrl = await apiLoader.getImgUrl(query);
    const image = new Image();

    image.crossOrigin = 'Anonymous';
    image.onload = () => this.canvasComponent.insertImage(image);
    image.src = imgUrl;
  }
}
