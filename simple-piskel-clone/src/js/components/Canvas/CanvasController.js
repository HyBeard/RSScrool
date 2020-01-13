import EventEmitter from '../../helpers/EventEmitter';
import CanvasModel from './CanvasModel';
import CanvasView from './CanvasView';
import toolsTypes, { toolIsInCategory } from './tools/toolsTypes';

export default class CanvasController extends EventEmitter {
  constructor(savedState) {
    super();
    this.model = new CanvasModel(savedState);
    this.view = new CanvasView();
  }

  handleCoordsChanging(x, y) {
    const coordsWasUpdated = this.model.updateCurrentIndexIfChanged(x, y);

    if (coordsWasUpdated) {
      const { row, col } = this.model.getCurrentCoords();

      this.emit('updateCoordsInfo', row, col);
    }
  }

  changeUsableColors(mouseBtnCode, newColor) {
    const {
      model,
      model: { primColor, secColor },
    } = this;
    const LEFT_MOUSE_BUTTON_CODE = 0;

    switch (mouseBtnCode) {
      case LEFT_MOUSE_BUTTON_CODE:
        if (newColor) model.updateFields({ primColor: newColor });
        model.updateFields({ activeColor: primColor });
        break;

      default:
        if (newColor) model.updateFields({ secColor: newColor });
        model.updateFields({ activeColor: secColor });
    }
  }

  changeActiveTool(tool) {
    this.model.updateFields({ activeTool: tool });
  }

  swapColors() {
    const {
      model: { primColor, secColor },
    } = this;

    this.model.updateFields({ primColor: secColor, secColor: primColor });
  }

  startDrawing() {
    const {
      model,
      model: { activeTool },
      view: { mouseBtnCode },
    } = this;
    const {
      singleEffect,
      continuousEffect: {
        drawing: { requiringCanvasReload },
      },
    } = toolsTypes;

    if (activeTool === 'eyedropper') {
      const pickedColor = model.getColorOfCurrentIndex();

      this.changeUsableColors(mouseBtnCode, pickedColor);
      this.emit('renderNewColors', model.primColor, model.secColor);

      return;
    }

    this.changeUsableColors(mouseBtnCode);
    if (toolIsInCategory(requiringCanvasReload, activeTool)) {
      model.memorizeCanvasBeforeDrawing();
    }

    const indicesToDraw = model.getIndicesChangedByToolData(activeTool);

    model.handleIndicesToDraw(indicesToDraw);

    if (toolIsInCategory(singleEffect, activeTool)) {
      this.emit('takeChangesAfterDrawing');
    }
  }

  drawNextIndices() {
    const {
      model,
      model: { activeTool },
    } = this;
    const {
      singleEffect,
      continuousEffect: {
        drawing: { requiringCanvasReload },
      },
    } = toolsTypes;

    if (toolIsInCategory(singleEffect, activeTool)) return;

    if (toolIsInCategory(requiringCanvasReload, activeTool)) {
      model.loadCanvasFromCache(); // TODO: not pass again
      model.canvasData = [...model.memorizedCanvasData];
    }

    const indicesToDraw = model.getIndicesChangedByToolData();

    model.handleIndicesToDraw(indicesToDraw);
  }

  handleDrawingEnding() {
    const {
      model,
      model: { activeTool },
    } = this;
    const { singleEffect } = toolsTypes;

    if (toolIsInCategory(singleEffect, activeTool)) return;

    const indicesToDraw = model.getIndicesChangedByToolData();

    model.handleIndicesToDraw(indicesToDraw);

    this.emit('takeChangesAfterDrawing');
  }

  // async handleImageUploading(query) {
  //   const { view, model } = this;

  //   await model.uploadImage(query);

  //   const { currentFrameDataURL, currentFrameNumber } = model.framesComponent;

  //   view.paintFramePreview(currentFrameDataURL, currentFrameNumber);
  // }

  // handleGrayscaleFiltering() {
  //   const { view, model } = this;

  //   model.grayscale();

  //   const { currentFrameDataURL, currentFrameNumber } = model.framesComponent;

  //   view.paintFramePreview(currentFrameDataURL, currentFrameNumber);
  // }

  addEventsToEmitter() {
    const { view } = this;

    view.on('startDrawing', this.startDrawing.bind(this));
    view.on('cursorPositionChanging', this.handleCoordsChanging.bind(this));
    view.on('continueDrawing', this.drawNextIndices.bind(this));
    view.on('endDrawing', this.handleDrawingEnding.bind(this));
  }

  init() {
    this.addEventsToEmitter();
    this.model.init();
    this.view.init();
  }
}
