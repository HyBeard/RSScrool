export default class FramesListData {
  constructor(savedData = {}) {
    this.listOfFrames = savedData.listOfFrames || [];
    this.currentFrameNumber = null || savedData.currentFrameNumber;
  }

  set currentFrameData(data) {
    this.listOfFrames[this.currentFrameNumber].canvasData = [...data];
  }

  get currentFrameData() {
    return [...this.listOfFrames[this.currentFrameNumber].canvasData];
  }

  set currentFrameDataURL(dataURL) {
    this.listOfFrames[this.currentFrameNumber].dataURL = dataURL;
  }

  get currentFrameDataURL() {
    return this.listOfFrames[this.currentFrameNumber].dataURL;
  }

  static createEmptyCanvasData(cellCount) {
    const TRANSPARENT_COLOR = 'rgba(0,0,0,0)';

    return new Array(cellCount ** 2).fill(TRANSPARENT_COLOR);
  }

  static createFrameProps(cellCount) {
    return {
      canvasData: FramesListData.createEmptyCanvasData(cellCount),
      dataURL: null,
      disabled: false,
    };
  }

  addFrameData(cellCount) {
    const newFrameData = FramesListData.createFrameProps(cellCount);

    this.listOfFrames.push(newFrameData);
    this.currentFrameNumber = this.listOfFrames.length - 1;
  }

  changeCurrentFrameNumber(frameNum) {
    this.currentFrameNumber = frameNum;
  }

  deleteFrame(frameNum) {
    const lastFrameNum = this.listOfFrames.length - 1;
    this.listOfFrames.splice(frameNum, 1);

    if (frameNum === this.currentFrameNumber) {
      const newFrameNum = frameNum === lastFrameNum ? frameNum - 1 : frameNum;
      this.currentFrameNumber = newFrameNum;

      return;
    }

    this.currentFrameNumber -= 1;
  }

  duplicateFrame(frameNum) {
    const newFrameData = { ...this.listOfFrames[frameNum] };

    this.listOfFrames.splice(frameNum + 1, 0, newFrameData);
    this.currentFrameNumber = frameNum + 1;
  }

  changeFramePosition(movedFrameNum, targetFrameNum) {
    if (movedFrameNum === targetFrameNum) {
      this.changeCurrentFrameNumber(targetFrameNum);
      return;
    }

    const { listOfFrames } = this;
    const movedFrame = listOfFrames[movedFrameNum];
    const correctTargetNum = targetFrameNum > movedFrameNum ? targetFrameNum + 1 : targetFrameNum;
    const correctMovedNum = targetFrameNum > movedFrameNum ? movedFrameNum : movedFrameNum + 1;

    listOfFrames.splice(correctTargetNum, 0, movedFrame);
    listOfFrames.splice(correctMovedNum, 1);
    this.changeCurrentFrameNumber(targetFrameNum);
  }

  toggleFrame(frameNum) {
    const toggledFrame = this.listOfFrames[frameNum];

    toggledFrame.disabled = !toggledFrame.disabled;
  }

  init(canvasSideSize) {
    if (!this.listOfFrames.length) this.addFrameData(canvasSideSize);
  }
}
