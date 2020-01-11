import EventEmitter from '../../helpers/EventEmitter';
import CanvasModel from './CanvasModel';
import CanvasView from './CanvasView';
import toolsTypes, { toolInCategory } from './tools/toolsTypes';

const savedState = JSON.parse(localStorage.getItem('piskelState')) || {};

export default class CanvasController extends EventEmitter {
  constructor() {
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

  setActiveColor(mouseBtnCode, primColor, secColor) {
    const { model } = this;
    const LEFT_MOUSE_BUTTON_CODE = 0;

    switch (mouseBtnCode) {
      case LEFT_MOUSE_BUTTON_CODE:
        model.activeColor = primColor;
        break;
      default:
        model.activeColor = secColor;
    }
  }

  startDrawing(tool, primColor, secColor) {
    const {
      model,
      view: { mouseBtnCode },
    } = this;
    const {
      continuousEffect: {
        drawing: { requiringCanvasReload },
      },
    } = toolsTypes;

    if (tool === 'eyedropper') {
      const pickedColor = model.getColorOfCurrentIndex();

      this.emit('changeMainColors', mouseBtnCode, pickedColor);

      return;
    }

    this.setActiveColor(mouseBtnCode, primColor, secColor);

    if (toolInCategory(requiringCanvasReload, tool)) {
      model.memorizeCanvasData();
    }

    const indicesToDraw = model.getIndicesChangedByTool(tool);

    model.activeTool = tool;
    model.handleIndicesToDraw(indicesToDraw);
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

    if (toolInCategory(singleEffect, activeTool)) return;

    if (toolInCategory(requiringCanvasReload, activeTool)) {
      model.loadCanvasFromCache();
      model.canvasData = [...model.memorizedCanvasData];
    }

    const indicesToDraw = model.getIndicesChangedByTool();

    model.handleIndicesToDraw(indicesToDraw);
  }

  handleDrawingEnding() {
    const {
      model,
      model: { cachedDataUrl, activeTool },
    } = this;
    const { singleEffect } = toolsTypes;

    if (toolInCategory(singleEffect, activeTool)) return;

    const indicesToDraw = model.getIndicesChangedByTool();

    model.cacheCanvasAsDataUrl();
    model.handleIndicesToDraw(indicesToDraw);
    this.emit('takeChangesAfterDrawing', cachedDataUrl);
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

  // handleCanvasSizeChanging(size) {
  //   const {
  //     view,
  //     model: { canvasComponent, framesComponent },
  //   } = this;

  //   framesComponent.listOfFrames.forEach((frame, num) => {
  //     const changingCanvasData = frame.canvasData;

  //     canvasComponent.canvasData = changingCanvasData;
  //     canvasComponent.changeCanvasSize(size);
  //     framesComponent.listOfFrames[num].canvasData = canvasComponent.canvasData;
  //   });

  //   canvasComponent.sideCellCount = Number(size);
  //   canvasComponent.canvasData = framesComponent.currentFrameData;
  //   canvasComponent.fullCanvasRedraw();
  //   view.renderCanvasSizeInfo(size);
  // }

  addEventsToEmitter() {
    const { view } = this;

    view.on('startDrawing', this.reEmit('requestDataForDrawing').bind(this));
    view.on('cursorPositionChanged', this.handleCoordsChanging.bind(this));
    view.on('continueDrawing', this.drawNextIndices.bind(this));
    view.on('drawingEnded', this.handleDrawingEnding.bind(this));

    this.on('drawingDataReceived', this.startDrawing);

    // view.on('changeCanvasSize', this.handleCanvasSizeChanging.bind(this));
    // view.on('uploadImage', this.handleImageUploading.bind(this));
    // view.on('grayscaleCanvas', this.handleGrayscaleFiltering.bind(this));
  }

  init(currentFrameCanvasData) {
    const { model, view } = this;

    model.init(currentFrameCanvasData);
    view.init(model.state);
    this.addEventsToEmitter();
  }
}
