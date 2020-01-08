export default class FramesListData {
  constructor(savedData = {}) {
    this.listOfFrames = savedData.listOfFrames || [];
    this.currentFrameNumb = null || savedData.currentFrameNumb;
  }

  get currentFrame() {
    return this.listOfFrames[this.currentFrameNumb];
  }

  static createEmptyData(cellCount) {
    const TRANSPARENT_COLOR = 'rgba(0,0,0,0)';

    return new Array(cellCount ** 2).fill(TRANSPARENT_COLOR);
  }

  static createFrameProps(cellCount) {
    return {
      canvasData: FramesListData.createEmptyData(cellCount),
      image: null,
      disabled: false,
    };
  }

  addFrameData(cellCount) {
    const newFrameData = FramesListData.createFrameProps(cellCount);

    this.listOfFrames.push(newFrameData);
    this.currentFrameNumb = this.listOfFrames.length - 1;
  }

  changeCurrentFrameNumber(frameNum) {
    this.currentFrameNumb = frameNum;
  }

  updateFrameImgURL(framePreview, frameNum) {
    this.listOfFrames[frameNum].image = framePreview.toDataURL();
  }

  deleteFrame(frameNum) {
    this.listOfFrames.splice(frameNum, 1);

    if (frameNum === this.currentFrameNumb) {
      const nextFrameNumber = frameNum + 1;
      const prevFrameNumber = frameNum - 1;
      const correctFrameNumber = this.listOfFrames[nextFrameNumber]
        ? nextFrameNumber
        : prevFrameNumber;

      this.currentFrameNumb = correctFrameNumber;
    }
  }

  duplicateFrame(frameNum) {
    const newFrameData = JSON.parse(JSON.stringify(this.listOfFrames[frameNum]));

    this.listOfFrames.splice(frameNum + 1, 0, newFrameData);
    this.currentFrameNumb = frameNum + 1;
  }

  changeFramePosition(movedFrameNum, targetFrameNum) {
    [this.listOfFrames[movedFrameNum], this.listOfFrames[targetFrameNum]] = [
      this.listOfFrames[targetFrameNum],
      this.listOfFrames[movedFrameNum],
    ];

    this.changeCurrentFrameNumber(targetFrameNum);
  }

  toggleFrame(frameNum) {
    if (this.listOfFrames[frameNum].disabled) {
      this.listOfFrames[frameNum].disabled = false;
    } else {
      this.listOfFrames[frameNum].disabled = true;
    }
  }
}
