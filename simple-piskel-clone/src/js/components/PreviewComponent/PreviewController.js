import EventEmitter from '../../helpers/EventEmitter';
import AnimationModel from './PreviewModel';
import AnimationView from './PreviewView';

export default class AnimationController extends EventEmitter {
  constructor(savedState) {
    super();
    this.model = new AnimationModel(savedState);
    this.view = new AnimationView();
  }

  handleFpsChanging(newFps) {
    this.runAnimate(newFps);
    this.model.fpsValue = newFps;
    this.view.renderFpsValue(newFps);
  }

  runAnimate(fps) {
    const { model } = this;

    if (model.intervalId) {
      clearInterval(model.intervalId);
    }

    model.intervalId = setInterval(() => {
      const nextFrameUrl = model.getNextFrameImageUrl();

      this.view.showNewAnimationFrame(nextFrameUrl);
    }, 1000 / fps);
  }

  addEventsToEmitter() {
    this.view.on('fpsChanged', this.handleFpsChanging.bind(this));
  }

  init({ fpsValue, listOfFrames }) {
    this.addEventsToEmitter();
    this.model.init(listOfFrames);
    this.view.init(fpsValue);
    this.runAnimate(fpsValue);
  }
}
