import EventEmitter from '../helpers/EventEmitter';
import Model from './Model';
import View from './View';

const savedState = JSON.parse(localStorage.getItem('piskelState')) || {};

export default class Controller extends EventEmitter {
  constructor() {
    super();
    this.model = new Model(savedState);
    this.view = new View();
  }

  handleToolChanging(toolName) {
    this.model.changeActiveTool(toolName);
    this.view.selectTool(toolName);
  }

  handleCoordsChanging(x, y) {
    const { model, view } = this;
    const coordsWasUpdated = model.updateCurrentIndexIfChanged(x, y);

    if (coordsWasUpdated) {
      const { row, col } = model.canvasComponent.coordsToRowCol(x, y);

      view.updateCoordsContainer(row, col);
    }
  }

  handleDrawingEnding() {
    const { view, model } = this;

    model.endDrawing();

    const { currentFrameDataURL, currentFrameNumber } = model.framesComponent;

    view.paintFramePreview(currentFrameDataURL, currentFrameNumber);
  }

  async handleImageUploading(query) {
    const { view, model } = this;

    await model.uploadImage(query);

    const { currentFrameDataURL, currentFrameNumber } = model.framesComponent;

    view.paintFramePreview(currentFrameDataURL, currentFrameNumber);
  }

  handleGrayscaleFiltering() {
    const { view, model } = this;

    model.grayscale();

    const { currentFrameDataURL, currentFrameNumber } = model.framesComponent;

    view.paintFramePreview(currentFrameDataURL, currentFrameNumber);
  }

  handleCanvasSizeChanging(size) {
    const {
      view,
      model: { canvasComponent, framesComponent },
    } = this;

    canvasComponent.changeCanvasSize(size);
    framesComponent.currentFrameData = canvasComponent.canvasData;
    view.updateCanvasSizeInfo(size);
  }

  handleColorChange(color, mouseBtnCode) {
    const { view, model } = this;
    if (color) {
      model.pickColor(color, mouseBtnCode);
    } else {
      model.swapColors();
    }

    const { primColor, secColor } = model;

    view.updateLastColors(primColor, secColor);
  }

  handleFrameAdding() {
    const {
      framesComponent,
      canvasComponent,
      canvasComponent: {
        state: { sideCellCount },
      },
    } = this.model;

    framesComponent.addFrameData(sideCellCount);
    canvasComponent.canvasData = framesComponent.currentFrameData;
    canvasComponent.fullCanvasRedraw();
    this.view.addFrame();
  }

  handleFrameDeleting(frameNum) {
    const {
      model: { framesComponent, canvasComponent },
      view,
    } = this;

    framesComponent.deleteFrame(frameNum);
    canvasComponent.canvasData = framesComponent.currentFrameData;
    canvasComponent.fullCanvasRedraw();
    view.deleteFrame(frameNum);
  }

  handleFrameCloning(frameNum) {
    const {
      model: { framesComponent },
      view,
    } = this;

    framesComponent.duplicateFrame(frameNum);
    view.duplicateFrame(frameNum);
  }

  handleFrameToggling(frameNum) {
    const {
      model: { framesComponent },
    } = this;

    framesComponent.toggleFrame(frameNum);
    View.toggleFrame(frameNum);
  }

  handleFrameSelecting(frameNum) {
    const {
      model: { framesComponent, canvasComponent },
      view,
    } = this;

    framesComponent.changeCurrentFrameNumber(frameNum);
    canvasComponent.canvasData = framesComponent.currentFrameData;
    canvasComponent.fullCanvasRedraw();
    view.selectFrame(frameNum);
  }

  addShortcutsListeners() {
    // FIXME:
    document.addEventListener('keydown', ({ code }) => {
      if (!Object.prototype.hasOwnProperty.call(this.model.keyboardShortcuts, code)) {
        return;
      }

      this.model.activeTool = this.model.keyboardShortcuts[code];

      this.view.selectTool(this.model.activeTool);
    });
  }

  addEventsToEmitter() {
    const { view, model } = this;

    view.on('saveState', model.saveState.bind(model));
    view.on('clearState', Model.clearState.bind(model));

    view.on('addFrame', this.handleFrameAdding.bind(this));
    view.on('selectFrame', this.handleFrameSelecting.bind(this));
    view.on('deleteFrame', this.handleFrameDeleting.bind(this));
    view.on('cloneFrame', this.handleFrameCloning.bind(this));
    view.on('toggleFrame', this.handleFrameToggling.bind(this));

    view.on('toolChanged', this.handleToolChanging.bind(this));
    view.on('pickNewColor', this.handleColorChange.bind(this));
    view.on('swapColors', this.handleColorChange.bind(this));

    view.on('drawingStarted', model.startDrawing.bind(model));
    view.on('cursorPositionChanged', this.handleCoordsChanging.bind(this));
    view.on('continueDrawing', model.drawNextIndices.bind(model));
    view.on('drawingEnded', this.handleDrawingEnding.bind(this));

    view.on('changeCanvasSize', this.handleCanvasSizeChanging.bind(this));
    view.on('uploadImage', this.handleImageUploading.bind(this));
    view.on('grayscaleCanvas', this.handleGrayscaleFiltering.bind(this));
  }

  init() {
    const { model, view } = this;

    model.init();
    view.init(model.appState);
    this.addEventsToEmitter();
    this.addShortcutsListeners();
  }
}
