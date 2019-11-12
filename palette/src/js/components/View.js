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

}
