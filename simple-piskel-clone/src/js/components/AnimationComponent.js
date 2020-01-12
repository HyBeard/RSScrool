import EventEmitter from '../helpers/EventEmitter';

export default class AnimationComponent extends EventEmitter {
  constructor(framesData) {
    super();
    this.intervalId = null;
    this.expectedFrameNumber = 0;
    this.framesData = framesData;
  }

  updateAnimatePreview() {
    const { currentFrame } = this.framesData;
    const editableFrameNumber = this.framesData.currentFrameNumb;

    if (this.expectedFrameNumber - 1 === editableFrameNumber) {
      this.animationContainer.style.backgroundImage = `url(${currentFrame.dataURL})`;
    }
  }

  getNextAnimationFrame() {
    const { listOfFrames } = this.framesData;
    const framesCount = listOfFrames.length;

    this.expectedFrameNumber %= framesCount;

    const expectedFrame = listOfFrames[this.expectedFrameNumber];
    const { dataURL } = expectedFrame;

    if (expectedFrame.disabled) {
      if (listOfFrames.every((frame) => frame.disabled)) {
        return this.framesData.currentFrameDataURL;
      }

      this.expectedFrameNumber += 1;

      return this.getNextAnimationFrame.call(this);
    }

    this.expectedFrameNumber += 1;

    return dataURL;
  }

  runAnimate(fps) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      // this.emit('animationFrameChanged', this.getNextAnimationFrame());
    }, 1000 / fps);
  }
}
