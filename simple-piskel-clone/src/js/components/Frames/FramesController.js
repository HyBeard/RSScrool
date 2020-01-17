import EventEmitter from '../../helpers/EventEmitter';
import FramesModel from './FramesModel';
import FramesView from './FramesView';

export default class FramesController extends EventEmitter {
  constructor(savedState) {
    super();
    this.model = new FramesModel(savedState);
    this.view = new FramesView();
  }

  addFrame() {
    const { model, view } = this;

    model.addFrameData();
    view.renderNewFramePreview();

    this.emit('framesWasChanged', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameDeleting(frameNum) {
    const { model, view } = this;
    model.deleteFrameData(frameNum);
    view.deleteFrame(frameNum, model.currentFrameNumber);

    this.emit('framesWasChanged', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameCloning(frameNum) {
    const { model, view } = this;

    model.duplicateFrameData(frameNum);
    view.duplicateFramePreview(frameNum);
    view.fillPreviewCanvas(model.currentFrameDataURL, model.currentFrameNumber);

    this.emit('framesWasChanged', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameToggling(frameNum) {
    const { model, view } = this;

    model.toggleFrameDisabledState(frameNum);
    view.toggleFrame(frameNum);
  }

  handleFrameSelecting(frameNum) {
    const { model, view } = this;

    model.currentFrameNumber = frameNum;
    view.selectFramePreview(frameNum);

    this.emit('framesWasChanged', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameMoving(oldNum, newNum) {
    const { model, view } = this;

    model.changeFramePosition(oldNum, newNum);
    view.renderChangedPreviewsPositions();
    view.selectFramePreview(newNum);

    this.emit('framesWasChanged', model.currentFrameData, model.currentFrameDataURL);
  }

  addEventsToEmitter() {
    const { view } = this;

    view.on('addFrame', this.addFrame.bind(this));
    view.on('selectFrame', this.handleFrameSelecting.bind(this));
    view.on('deleteFrame', this.handleFrameDeleting.bind(this));
    view.on('cloneFrame', this.handleFrameCloning.bind(this));
    view.on('moveFrame', this.handleFrameMoving.bind(this));
    view.on('toggleFrame', this.handleFrameToggling.bind(this));
  }

  init(canvasData) {
    this.addEventsToEmitter();
    this.model.init(canvasData);
    this.view.init(this.model.state);
  }
}
