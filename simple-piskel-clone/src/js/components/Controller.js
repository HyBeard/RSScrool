import EventEmitter from '../helpers/EventEmitter';
import Model from './Model';
import View from './View';

const savedState = JSON.parse(localStorage.getItem('state')) || {};

export default class Controller extends EventEmitter {
  constructor() {
    super();
    this.view = new View();
    this.model = new Model(savedState);
  }

  handleCoordsChanging(x, y) {
    const { model, view } = this;
    const coordsWasUpdated = model.updateCurrentIndexIfChanged(x, y);

    if (coordsWasUpdated) {
      const { row, col } = model.canvasComponent.coordsToRowCol(x, y);

      view.updateCoordsContainer(row, col);
    }
  }

  addEventsToEmitter() {
    this.view.on('toolChanged', this.model.changeActiveTool);
    this.view.on('drawingStarted', this.model.startDrawing.bind(this.model));
    this.view.on('cursorPositionChanged', this.handleCoordsChanging.bind(this));
    this.view.on('continueDrawing', this.model.drawNextIndices.bind(this.model));
    this.view.on('drawingEnded', this.model.endDrawing.bind(this.model));
  }

  init() {
    const appState = (({
      canvasComponent: { state: canvasState },
      activeTool,
      secColor,
      primColor,
    }) => ({
      activeTool,
      secColor,
      primColor,
      ...canvasState,
    }))(this.model);

    this.view.init(appState);
    this.model.init();
    this.addEventsToEmitter();
  }
}
