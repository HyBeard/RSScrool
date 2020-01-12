import EventEmitter from '../../helpers/EventEmitter';
import CanvasModel from './CanvasModel';
import CanvasView from './CanvasView';
import toolsTypes, { toolInCategory } from './tools/toolsTypes';

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
    const requiringCanvasReload = toolsTypes.continuousEffect.drawing;

    if (activeTool === 'eyedropper') {
      const pickedColor = model.getColorOfCurrentIndex();

      this.changeUsableColors(mouseBtnCode, pickedColor);
      this.emit('renderNewColors', model.primColor, model.secColor);

      return;
    }

    this.changeUsableColors(mouseBtnCode);

    if (toolInCategory(requiringCanvasReload, activeTool)) {
      model.memorizeCanvasData();
    }

    const indicesToDraw = model.getIndicesChangedByTool(activeTool);

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
      model: { activeTool },
    } = this;
    const { singleEffect } = toolsTypes;

    if (toolInCategory(singleEffect, activeTool)) return;

    const indicesToDraw = model.getIndicesChangedByTool();

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

    view.on('startDrawing', this.startDrawing.bind(this));
    view.on('cursorPositionChanging', this.handleCoordsChanging.bind(this));
    view.on('continueDrawing', this.drawNextIndices.bind(this));
    view.on('endDrawing', this.handleDrawingEnding.bind(this));

    // view.on('changeCanvasSize', this.handleCanvasSizeChanging.bind(this));
    // view.on('uploadImage', this.handleImageUploading.bind(this));
    // view.on('grayscaleCanvas', this.handleGrayscaleFiltering.bind(this));
  }

  init() {
    this.model.init();
    this.view.init();
    this.addEventsToEmitter();
  }
}
