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
      const { row, col } = this.model.currentCoords;

      this.emit('updateCoordsInfo', row, col);
    }
  }

  updateModelFields(...fields) {
    Object.assign(this.model, ...fields);
  }

  changeUsableColors(mouseBtnCode, newColor) {
    const {
      model: { primColor, secColor },
    } = this;
    const LEFT_MOUSE_BUTTON_CODE = 0;

    switch (mouseBtnCode) {
      case LEFT_MOUSE_BUTTON_CODE:
        if (newColor !== undefined) this.updateModelFields({ primColor: newColor });
        this.updateModelFields({ activeColor: primColor });
        break;

      default:
        if (newColor !== undefined) this.updateModelFields({ secColor: newColor });
        this.updateModelFields({ activeColor: secColor });
    }
  }

  changeActiveTool(tool) {
    this.updateModelFields({ activeTool: tool });
  }

  swapColors() {
    const {
      model: { primColor, secColor },
    } = this;

    this.updateModelFields({ primColor: secColor, secColor: primColor });
  }

  static standardizeToolAnswer(answer) {
    const indicesToDraw = answer.indicesToDraw || answer;
    const indicesColors = answer.indicesColors || [];

    return { indicesToDraw, indicesColors };
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
      const pickedColor = model.canvasData[model.currentIndex];

      this.changeUsableColors(mouseBtnCode, pickedColor);
      this.emit('renderNewColors', model.primColor, model.secColor);

      return;
    }

    this.changeUsableColors(mouseBtnCode);
    model.memorizeCanvasBeforeDrawing();

    const toolAnswer = model.getToolAnswer(activeTool);
    const { indicesToDraw, indicesColors } = CanvasController.standardizeToolAnswer(toolAnswer);

    if (toolIsInCategory(requiringCanvasReload, activeTool)) {
      model.revertBackToPreviousData(indicesToDraw, indicesColors);
    }

    model.handleIndicesToDraw(indicesToDraw, indicesColors);

    if (toolIsInCategory(singleEffect, activeTool)) {
      this.emit('handleDrawingEnding');
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

    const toolAnswer = model.getToolAnswer();
    const { indicesToDraw, indicesColors } = CanvasController.standardizeToolAnswer(toolAnswer);

    if (toolIsInCategory(requiringCanvasReload, activeTool)) {
      model.revertBackToPreviousData(indicesToDraw, indicesColors);
    }

    model.handleIndicesToDraw(indicesToDraw, indicesColors);
  }

  handleDrawingEnding() {
    const {
      model,
      model: { activeTool },
    } = this;
    const { singleEffect } = toolsTypes;

    if (toolIsInCategory(singleEffect, activeTool)) return;

    const toolAnswer = model.getToolAnswer();
    const { indicesToDraw, indicesColors } = CanvasController.standardizeToolAnswer(toolAnswer);

    model.changedBeforeIndices.length = 0;
    model.handleIndicesToDraw(indicesToDraw, indicesColors);

    this.emit('handleDrawingEnding');
  }

  updateCanvasAfterResize(newSide, newCanvasData) {
    this.updateModelFields({
      sideCellCount: newSide,
      canvasData: newCanvasData,
    });
    this.model.ghostCanvas.width = newSide;
    this.model.ghostCanvas.height = newSide;
    this.model.fullCanvasRedraw();
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
