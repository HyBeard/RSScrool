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

  async refreshCanvasComponent(newData, newImgUrl) {
    this.canvas.model.canvasData = newData;
    this.canvas.model.drawCanvasFromSavedImageUrl(newImgUrl);
  }

  cacheCanvasAndRedrawPreview() {
    const cachedDataUrl = this.canvas.model.minCanvasToDataUrl();

    this.frames.model.currentFrameDataURL = cachedDataUrl;
    this.frames.view.fillPreviewCanvas(cachedDataUrl);
  }

  sendFramesListToAnimationPreview() {
    const { listOfFrames } = this.frames.model;

    this.preview.model.listOfFrames = listOfFrames;
  }

  saveStateToLocalStorage() {
    localStorage.setItem('piskelState', JSON.stringify(this.state));
  }

  static deleteStateFromStorage() {
    localStorage.removeItem('piskelState');
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
      frames.view.fillPreviewCanvas(resizedImgUrl, num);
    });
  }

  async resizeFramesAndCanvas(newSide) {
    await this.updateAllFramesAfterResize(newSide);

    const resizedCanvasData = this.frames.model.currentFrameData;

    this.canvas.updateCanvasAfterResize(newSide, resizedCanvasData);
  }

  sendToCanvasNewPenSize(penSize) {
    this.canvas.model.penSize = penSize;
  }

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

  async pasteReducedRandomImg(query) {
    const img = await featuresList.loadRandomImg(query);

    this.canvas.model.pasteImgAfterReduceIt(img);
    this.cacheCanvasAndRedrawPreview();
  }

  addEventsToEmitter() {
    const { canvas, frames, userInterface: ui } = this;

    ui.on('changeTool', canvas.changeActiveTool.bind(canvas));
    ui.on('swapColors', canvas.swapColors.bind(canvas));
    ui.on('pickNewColor', canvas.changeUsableColors.bind(canvas));
    ui.on('saveAppState', this.saveStateToLocalStorage.bind(this));
    ui.on('deleteAppState', Dispatcher.deleteStateFromStorage);
    ui.on('saveFileToFilesystem', this.downloadFile.bind(this));
    ui.on('changeCanvasSize', this.resizeFramesAndCanvas.bind(this));
    ui.on('changePenSize', this.sendToCanvasNewPenSize.bind(this));
    ui.on('pasteImg', this.pasteReducedRandomImg.bind(this));

    frames.on('framesWasChanged', this.refreshCanvasComponent.bind(this));

    canvas.on('renderNewColors', ui.renderLastColors.bind(ui));
    canvas.on('updateCoordsInfo', ui.updateCoordsContainer.bind(ui));
    canvas.on('handleDrawingEnding', this.cacheCanvasAndRedrawPreview.bind(this));
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
