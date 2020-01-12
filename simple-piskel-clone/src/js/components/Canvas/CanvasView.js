import EventEmitter from '../../helpers/EventEmitter';

export default class CanvasView extends EventEmitter {
  constructor() {
    super();
    this.canvas = document.querySelector('.main-canvas');
    this.mouseBtnCode = null;
    this.mousePressed = false;
  }

  static createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  }

  addListeners() {
    const { canvas } = this;

    canvas.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      this.mouseBtnCode = ev.button;
      this.mousePressed = true;
      this.emit('startDrawing');
    });

    canvas.addEventListener('mousemove', (ev) => {
      const { offsetX: x, offsetY: y } = ev;

      this.emit('cursorPositionChanging', x, y);

      if (!this.mousePressed) return;

      this.emit('continueDrawing');
    });

    window.addEventListener('mouseup', () => {
      if (!this.mousePressed) return;

      this.mousePressed = false;
      this.emit('endDrawing');
    });

    canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  init() {
    this.addListeners();
  }
}
