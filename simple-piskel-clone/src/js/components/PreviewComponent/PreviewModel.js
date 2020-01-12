import EventEmitter from '../../helpers/EventEmitter';

export default class AnimationComponent extends EventEmitter {
  constructor(savedState) {
    super();
    this.intervalId = null;
    this.expectedFrameNumber = 0;
    this.fpsValue = savedState.fpsValue || 7;
    this.listOfFrames = null;
  }

  get state() {
    return { fpsValue: this.fpsValue };
  }

  getNextFrameImageUrl() {
    const { listOfFrames } = this;
    const framesCount = listOfFrames.length;

    this.expectedFrameNumber %= framesCount;

    const expectedFrame = listOfFrames[this.expectedFrameNumber];
    const { dataURL } = expectedFrame;

    if (expectedFrame.disabled) {
      if (listOfFrames.every((frame) => frame.disabled)) {
        return this.listOfFrames.currentFrameDataURL;
      }

      this.expectedFrameNumber += 1;

      return this.getNextFrameImageUrl.call(this);
    }

    this.expectedFrameNumber += 1;

    return dataURL;
  }

  init(framesState) {
    const { listOfFrames } = framesState;

    this.listOfFrames = listOfFrames;
  }
}
