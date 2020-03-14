import EventEmitter from '../../helpers/EventEmitter';

export default class CanvasView extends EventEmitter {
  constructor() {
    super();
    this.canvas = document.querySelector('.canvas_box--canvas');
    this.mouseBtnCode = null;
    this.mousePressed = false;
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
  }

  init() {
    this.addListeners();
  }
}
