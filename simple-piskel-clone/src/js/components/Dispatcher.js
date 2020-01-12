import EventEmitter from '../helpers/EventEmitter';
import Canvas from './Canvas/CanvasController';
import Preview from './PreviewComponent/PreviewController';
import Frames from './Frames/FramesController';
import Controls from './ScreenComponent/Controls';

const savedState = JSON.parse(localStorage.getItem('piskelState')) || {};

export default class Dispatcher extends EventEmitter {
  constructor() {
    super();
    this.canvas = new Canvas(savedState);
    this.frames = new Frames(savedState);
    this.preview = new Preview(savedState);
    this.controls = new Controls();
  }

  get state() {
    return {
      ...this.canvas.model.state,
      framesState: this.frames.model.state,
      ...this.preview.model.state,
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
    const { canvas, frames } = this;

    canvas.model.setNewCanvasData(newData);
    canvas.model.fullCanvasRedraw();
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

  addEventsToEmitter() {
    const {
      canvas, frames, controls,
    } = this;

    controls.on('changeTool', canvas.changeActiveTool.bind(canvas));
    controls.on('swapColors', canvas.swapColors.bind(canvas));
    controls.on('pickNewColor', canvas.changeUsableColors.bind(canvas));

    frames.on('selectFrame', this.selectFrame.bind(this));
    frames.on('addFrame', this.addFrame.bind(this));
    frames.on('deleteFrame', this.deleteFrame.bind(this));
    frames.on('cloneFrame', this.addFrame.bind(this));
    frames.on('moveFrame', this.addFrame.bind(this));

    canvas.on('renderNewColors', controls.renderLastColors.bind(controls));
    canvas.on('updateCoordsInfo', controls.updateCoordsContainer.bind(controls));
    canvas.on('takeChangesAfterDrawing', this.cacheCanvasAndRedrawPreview.bind(this));

    controls.on('saveAppState', this.saveStateToLocalStorage.bind(this));
    controls.on('deleteAppState', Dispatcher.deleteStateFromStorage.bind(this));
  }

  init() {
    const { canvasData } = this.canvas.model;

    this.addEventsToEmitter();
    this.canvas.init();
    this.frames.init(canvasData);
    this.preview.init(this.state);
    this.controls.init(this.state);

    this.sendFramesListToAnimationPreview();
  }
}
