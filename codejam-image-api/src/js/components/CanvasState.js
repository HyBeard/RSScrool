export default class CanvasState {
  constructor(savedData = {}) {
    this.CANVAS_SIDE_LENGTH = 512;
    this.DEFAULT_COLOR = savedData.DEFAULT_COLOR || 'rgba(0,0,0,0)';
    this.sideCellCount = savedData.sideCellCount || 16;
    this.canvasData = savedData.canvasData || new Array(this.sideCellCount ** 2).fill('rgba(0,0,0,0)');
    this.savedState = savedData.savedState || null;
    this.primColor = savedData.primColor || 'rgb(0,0,0)';
    this.secColor = savedData.secColor || 'rgba(0,0,0,0)';
    this.activeColor = savedData.activeColor || null;
  }

  get cellLength() {
    return this.CANVAS_SIDE_LENGTH / this.sideCellCount;
  }
}
