import EventEmitter from '../helpers/EventEmitter';
import supportFunctions from '../helpers/supportFunctions';
import Canvas from './Canvas/CanvasController';
import Preview from './PreviewComponent/PreviewController';
import Frames from './Frames/FramesController';
import UserInterface from './Interface/UserInterface';
import featuresList from './features/featuresList';

const { asyncForEach, convertDataUrlToImg } = supportFunctions;
const savedState = JSON.parse(localStorage.getItem('piskelState')) || {};

export default class Dispatcher extends EventEmitter {
  constructor() {
    super();
    this.canvas = new Canvas(savedState);
    this.frames = new Frames(savedState);
    this.preview = new Preview(savedState);
    this.userInterface = new UserInterface(savedState);
  }

  get state() {
    return {
      ...this.canvas.model.state,
      ...this.frames.model.state,
      ...this.preview.model.state,
      keyboardShortcuts: this.userInterface.keyboardShortcuts,
    };
  }

  selectFrame(newData, newImgUrl) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.drawCanvasFromSavedImageUrl(newImgUrl);
  }

  addFrame(newData, newImgUrl) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.drawCanvasFromSavedImageUrl(newImgUrl);
  }

  deleteFrame(newData, newImgUrl) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.drawCanvasFromSavedImageUrl(newImgUrl);
  }

  async cloneFrame(newData, newImgUrl) {
    this.canvas.model.setNewCanvasData(newData);
    await this.canvas.model.drawCanvasFromSavedImageUrl(newImgUrl);
    this.cacheCanvasAndRedrawPreview();
  }

  moveFrame(newData, newImgUrl) {
    this.canvas.model.setNewCanvasData(newData);
    this.canvas.model.drawCanvasFromSavedImageUrl(newImgUrl);
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
    localStorage.setItem('piskelState', JSON.stringify(this.state));
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
      const currentFrameImage = frame.dataURL ? await convertDataUrlToImg(frame.dataURL) : null;
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

  _collect() {}

  downloadFile(extension) {
    const urlsArray = this.frames.model.listOfFrames.reduce(
      (onlyActive, frame) => (frame.disabled ? onlyActive : onlyActive.concat(frame.dataURL)),
      [],
    );
    const { sideCellCount } = this.canvas.model;
    const { fpsValue } = this.preview.model;
    const interval = 1 / fpsValue;

    if (extension === '.gif') {
      featuresList.downloadAsGif(urlsArray, interval, sideCellCount);
      return;
    }

    if (extension === '.apng') {
      featuresList.downloadAsApng(urlsArray, interval, sideCellCount);
    }
  }

  addEventsToEmitter() {
    const { canvas, frames, userInterface: ui } = this;

    // TODO: the same handlers for send data
    ui.on('changeTool', canvas.changeActiveTool.bind(canvas));
    ui.on('swapColors', canvas.swapColors.bind(canvas));
    ui.on('pickNewColor', canvas.changeUsableColors.bind(canvas));
    ui.on('saveAppState', this.saveStateToLocalStorage.bind(this));
    ui.on('deleteAppState', Dispatcher.deleteStateFromStorage);
    ui.on('saveFileToFilesystem', this.downloadFile.bind(this));
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
    featuresList.auth.init();

    this.sendFramesListToAnimationPreview();
  }
}
