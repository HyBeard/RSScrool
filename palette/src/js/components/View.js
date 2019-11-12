export default class View {
  constructor() {
    this.FRAME_PREVIEW_SIDE_LENGTH = 128;
    this.currentTool = null;
    [this.sizeInfoContainer] = document.getElementsByClassName(
      'canvas-size-info',
    );
    this.layersCollection = document.getElementsByClassName('layer');
    [this.palette] = document.getElementsByClassName('palette');
    [this.primColor] = document.getElementsByClassName('primary-color');
    [this.secColor] = document.getElementsByClassName('secondary-color');
  }

  static createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  }

  selectTool(tool = this.currentTool) {
    const selectedTool = tool;

    if (this.currentTool) this.currentTool.classList.remove('active');

    selectedTool.classList.add('active');
    this.currentTool = selectedTool;
  }

  updateLastColors(state) {
    const { primColor } = state.general;
    const { secColor } = state.general;

    function getCorrectBackground(color) {
      if (color === 'rgba(0,0,0,0)') {
        return `url(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABlBMVEXV1dXb29tFGkCIAAAAHklEQVR4AWNghAIGCMDgjwgFCDDSw2M0PSCD0fQAACRcAgF4ciGUAAAAAElFTkSuQmCC'
      ) repeat`;
      }
      return color;
    }

    const primBackground = getCorrectBackground(primColor);
    const secBackground = getCorrectBackground(secColor);

    this.primColor.style.background = primBackground;
    this.secColor.style.background = secBackground;
  }

}
