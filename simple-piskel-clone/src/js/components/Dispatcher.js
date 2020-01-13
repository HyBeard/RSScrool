import EventEmitter from '../helpers/EventEmitter';
import supportFunctions from '../helpers/supportFunctions';
import Canvas from './Canvas/CanvasController';
import Preview from './PreviewComponent/PreviewController';
import Frames from './Frames/FramesController';
import UserInterface from './Interface/UserInterface';

const { asyncForEach, getUploadedImage } = supportFunctions;
const savedState = JSON.parse(localStorage.getItem('piskelState')) || {};

export default class Dispatcher extends EventEmitter {
  constructor() {
    super();
    this.canvas = new Canvas(savedState);
    this.frames = new Frames(savedState);
    this.preview = new Preview(savedState);
    this.userInterface = new UserInterface();
  }

  get state() {
    return {
      ...this.canvas.model.state,
      framesState: this.frames.model.state,
      ...this.preview.model.state,
      keyboardShortcuts: this.userInterface.keyboardShortcuts,
    };
  }

  selectFrame(newData) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.fullCanvasRedraw();
  }

  addFrame(newData) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.fullCanvasRedraw();
  }

  deleteFrame(newData) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.fullCanvasRedraw();
  }

  cloneFrame(newData) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.fullCanvasRedraw();
    this.cacheCanvasAndRedrawPreview();
  }

  moveFrame(newData) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.fullCanvasRedraw();
  }

  cacheCanvasAndRedrawPreview() {
    const {
      frames,
      canvas: {
        model: { cachedDataUrl },
      },
    } = this;

    frames.model.currentFrameDataURL = cachedDataUrl;
    frames.view.paintFramePreview(cachedDataUrl);
  }

  sendFramesListToAnimationPreview() {
    const { listOfFrames } = this.frames.model;

    this.preview.model.listOfFrames = listOfFrames;
  }

  saveStateToLocalStorage() {
    const appState = Object.assign(
      this.canvas.model.state,
      this.frames.model.state,
      this.preview.model.state,
    );

    localStorage.setItem('piskelState', JSON.stringify(appState));
  }

  static deleteStateFromStorage() {
    localStorage.clear();
  }

  updateCanvasAfterResize(newSide) {
    const { canvas, frames } = this;

    canvas.model.ghostCanvas.width = newSide;
    canvas.model.ghostCanvas.height = newSide;
    canvas.model.sideCellCount = newSide;
    canvas.model.canvasData = frames.model.currentFrameData;
    canvas.model.fullCanvasRedraw();
  }

  async updateAllFramesAfterResize(newSide) {
    const { canvas, frames } = this;

    await asyncForEach(frames.model.listOfFrames, async (frame, num) => {
      const currentCanvasData = frame.canvasData;
      const currentFrameImage = frame.dataURL ? await getUploadedImage(frame.dataURL) : null;
      const { resizedData, resizedImgUrl } = canvas.model.getResizedDataAndImageUrl(
        newSide,
        currentCanvasData,
        currentFrameImage,
      );

      Object.assign(frame, { canvasData: resizedData }, { dataURL: resizedImgUrl });
      frames.view.paintFramePreview(resizedImgUrl, num);
    });
  }

  async resizeFramesAndCanvas(newSide) {
    await this.updateAllFramesAfterResize(newSide);
    this.updateCanvasAfterResize(newSide);
  }

  sendToCanvasNewPenSize(penSize) {
    this.canvas.model.penSize = penSize;
  }

  addEventsToEmitter() {
    const { canvas, frames, userInterface: ui } = this;

    ui.on('changeTool', canvas.changeActiveTool.bind(canvas));
    ui.on('swapColors', canvas.swapColors.bind(canvas));
    ui.on('pickNewColor', canvas.changeUsableColors.bind(canvas));
    ui.on('saveAppState', this.saveStateToLocalStorage.bind(this));
    ui.on('deleteAppState', Dispatcher.deleteStateFromStorage);
    ui.on('changeCanvasSize', this.resizeFramesAndCanvas.bind(this));
    ui.on('changePenSize', this.sendToCanvasNewPenSize.bind(this));

    frames.on('selectFrame', this.selectFrame.bind(this));
    frames.on('addFrame', this.addFrame.bind(this));
    frames.on('deleteFrame', this.deleteFrame.bind(this));
    frames.on('cloneFrame', this.cloneFrame.bind(this));
    frames.on('moveFrame', this.moveFrame.bind(this));

    canvas.on('renderNewColors', ui.renderLastColors.bind(ui));
    canvas.on('updateCoordsInfo', ui.updateCoordsContainer.bind(ui));
    canvas.on('takeChangesAfterDrawing', this.cacheCanvasAndRedrawPreview.bind(this));
  }

  init() {
    const { canvasData } = this.canvas.model;

    this.addEventsToEmitter();
    this.canvas.init();
    this.frames.init(canvasData);
    this.preview.init(this.state);
    this.userInterface.init(this.state);

    this.sendFramesListToAnimationPreview();
  }
}
