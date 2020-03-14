export default class FramesModel {
  constructor(savedState) {
    this.listOfFrames = savedState.listOfFrames || [];
    this.currentFrameNumber = null || savedState.currentFrameNumber;
  }

  get state() {
    return {
      listOfFrames: this.listOfFrames,
      currentFrameNumber: this.currentFrameNumber,
    };
  }

  set currentFrameData(data) {
    this.listOfFrames[this.currentFrameNumber].canvasData = data;
  }

  get currentFrameData() {
    return this.listOfFrames[this.currentFrameNumber].canvasData;
  }

  set currentFrameDataURL(dataURL) {
    this.listOfFrames[this.currentFrameNumber].dataURL = dataURL;
  }

  get currentFrameDataURL() {
    return this.listOfFrames[this.currentFrameNumber].dataURL;
  }

  createEmptyCanvasData() {
    return [...this.currentFrameData].fill(null);
  }

  createFrameProps(canvasData) {
    return {
      canvasData: canvasData || this.createEmptyCanvasData(),
      dataURL: '',
      disabled: false,
    };
  }

  addFrameData(canvasData) {
    const newFrameData = this.createFrameProps(canvasData);

    this.listOfFrames.push(newFrameData);
    this.currentFrameNumber = this.listOfFrames.length - 1;
  }

  deleteFrameData(frameNum) {
    const lastFrameNum = this.listOfFrames.length - 1;
    this.listOfFrames.splice(frameNum, 1);

    if (frameNum === this.currentFrameNumber) {
      const newFrameNum = frameNum === lastFrameNum ? frameNum - 1 : frameNum;
      this.currentFrameNumber = newFrameNum;

      return;
    }

    this.currentFrameNumber = Math.max(this.currentFrameNumber - 1, 0);
  }

  duplicateFrameData(frameNum) {
    const frameClone = JSON.parse(JSON.stringify(this.listOfFrames[frameNum]));

    this.listOfFrames.splice(frameNum + 1, 0, frameClone);
    this.currentFrameNumber = frameNum + 1;
  }

  changeFramePosition(movedFrameNum, targetFrameNum) {
    if (movedFrameNum === targetFrameNum) {
      this.currentFrameNumber = targetFrameNum;

      return;
    }

    const { listOfFrames } = this;
    const movedFrame = listOfFrames[movedFrameNum];
    const correctTargetNum = targetFrameNum > movedFrameNum ? targetFrameNum + 1 : targetFrameNum;
    const correctMovedNum = targetFrameNum > movedFrameNum ? movedFrameNum : movedFrameNum + 1;

    listOfFrames.splice(correctTargetNum, 0, movedFrame);
    listOfFrames.splice(correctMovedNum, 1);
    this.currentFrameNumber = targetFrameNum;
  }

  toggleFrameDisabledState(frameNum) {
    const toggledFrame = this.listOfFrames[frameNum];

    toggledFrame.disabled = !toggledFrame.disabled;
  }

  init(canvasData) {
    if (!this.listOfFrames.length) this.addFrameData(canvasData);
  }
}
