import EventEmitter from '../../helpers/EventEmitter';
import FramesModel from './FramesModel';
import FramesView from './FramesView';

export default class FramesController extends EventEmitter {
  constructor(savedState) {
    super();
    this.model = new FramesModel(savedState);
    this.view = new FramesView();
  }

  handleDrawingEnding() {
    const {
      view,
      model: { currentFrameDataURL },
    } = this;

    view.paintFramePreview(currentFrameDataURL);
  }

  // async handleImageUploading(query) {
  //   const { view, model } = this;

  //   await model.uploadImage(query);

  //   const { currentFrameDataURL, currentFrameNumber } = model.model;

  //   view.paintFramePreview(currentFrameDataURL, currentFrameNumber);
  // }

  // handleGrayscaleFiltering() {
  //   const { view, model } = this;

  //   model.grayscale();

  //   const { currentFrameDataURL, currentFrameNumber } = model.model;

  //   view.paintFramePreview(currentFrameDataURL, currentFrameNumber);
  // }

  // handleCanvasSizeChanging(size) {
  //   const { view, model } = this;

  //   model.listOfFrames.forEach((frame, num) => {
  //     const changingCanvasData = frame.canvasData;

  //     canvasComponent.canvasData = changingCanvasData;
  //     canvasComponent.changeCanvasSize(size);
  //     model.listOfFrames[num].canvasData = canvasComponent.canvasData;
  //   });

  //   canvasComponent.sideCellCount = size;
  //   canvasComponent.canvasData = model.currentFrameData;
  //   canvasComponent.fullCanvasRedraw();
  //   view.renderCanvasSizeInfo(size);
  // }

  addFrame() {
    // TODO:  the same emit handlers
    const { model, view } = this;

    model.addFrameData();
    view.renderNewFrame();

    this.emit('addFrame', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameDeleting(frameNum) {
    const { model, view } = this;

    model.deleteFrame(frameNum);
    view.deleteFrame(frameNum, model.currentFrameNumber);

    this.emit('deleteFrame', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameCloning(frameNum) {
    const { model, view } = this;

    model.duplicateFrame(frameNum);
    view.duplicateFrame(frameNum);
    view.paintFramePreview(model.currentFrameDataURL, model.currentFrameNumber);

    this.emit('cloneFrame', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameToggling(frameNum) {
    const { model, view } = this;

    model.toggleFrame(frameNum);
    view.toggleFrame(frameNum);
  }

  handleFrameSelecting(frameNum) {
    const { model, view } = this;

    model.changeCurrentFrameNumber(frameNum);
    view.selectFrame(frameNum);

    this.emit('selectFrame', model.currentFrameData, model.currentFrameDataURL);
  }

  handleFrameMoving(oldNum, newNum) {
    const { model, view } = this;

    model.changeFramePosition(oldNum, newNum);
    view.renumberFrames();
    view.selectFrame(newNum);

    this.emit('moveFrame', model.currentFrameData, model.currentFrameDataURL);
  }

  addEventsToEmitter() {
    const { view } = this;

    view.on('addFrame', this.addFrame.bind(this));
    view.on('selectFrame', this.handleFrameSelecting.bind(this));
    view.on('deleteFrame', this.handleFrameDeleting.bind(this));
    view.on('cloneFrame', this.handleFrameCloning.bind(this));
    view.on('moveFrame', this.handleFrameMoving.bind(this));
    view.on('toggleFrame', this.handleFrameToggling.bind(this));

    view.on('drawingEnded', this.handleDrawingEnding.bind(this));

    // view.on('changeCanvasSize', this.handleCanvasSizeChanging.bind(this));
    // view.on('uploadImage', this.handleImageUploading.bind(this));
    // view.on('grayscaleCanvas', this.handleGrayscaleFiltering.bind(this));
  }

  init(canvasData) {
    this.addEventsToEmitter();
    this.model.init(canvasData);
    this.view.init(this.model.state);
  }
}
