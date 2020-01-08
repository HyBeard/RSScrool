import EventEmitter from '../helpers/EventEmitter';
import Model from './Model';
import View from './View';

const savedState = JSON.parse(localStorage.getItem('piskelState')) || {};

export default class Controller extends EventEmitter {
  constructor() {
    super();
    this.view = new View();
    this.model = new Model(savedState);
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

  handleCanvasSizeChanging(size) {
    this.model.canvasComponent.changeCanvasSize(size);
    this.view.updateCanvasSizeInfo(size);
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
    const {
      view,
      model,
      model: { canvasComponent },
    } = this;

    view.on('saveState', model.saveState.bind(model));
    view.on('clearState', Model.clearState.bind(model));
    view.on('uploadImage', model.uploadImage.bind(model));
    view.on('grayscaleCanvas', canvasComponent.grayscale.bind(canvasComponent));
    view.on('changeCanvasSize', this.handleCanvasSizeChanging.bind(this));
    view.on('drawingEnded', model.endDrawing.bind(model));

    view.on('toolChanged', this.handleToolChanging.bind(this));
    view.on('drawingStarted', model.startDrawing.bind(model));
    view.on('cursorPositionChanged', this.handleCoordsChanging.bind(this));
    view.on('continueDrawing', model.drawNextIndices.bind(model));

    view.on('pickNewColor', this.handleColorChange.bind(this));
    view.on('swapColors', this.handleColorChange.bind(this));
  }

  init() {
    const { model, view } = this;

    view.init(model.appState);
    model.init();
    this.addEventsToEmitter();
    this.addShortcutsListeners();
  }
}
