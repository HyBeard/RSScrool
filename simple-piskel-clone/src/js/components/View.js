import EventEmitter from '../helpers/EventEmitter';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.FRAME_PREVIEW_SIDE_LENGTH = 128;
    this.header = document.querySelector('.header');
    this.sizeSelector = document.querySelector('.canvas-size-selector');
    this.ImageQueryInput = document.querySelector('.image-query');
    this.canvas = document.querySelector('.main-canvas');
    this.toolsContainer = document.querySelector('.tools-container');
    this.palette = document.querySelector('.palette-container');
    this.primColorElem = document.querySelector('.primary-color');
    this.secColorElem = document.querySelector('.secondary-color');
    this.framesListColumn = document.querySelector('.frames-list-column');
    this.framesList = document.querySelector('.frames-list');
    this.framesCollection = document.getElementsByClassName('frame-preview');
    this.currentFrame = null;
    this.fpsSlider = document.querySelector('.fps-slider');
    this.sizeSelector = document.querySelector('.canvas-size-selector');
    this.sizeInfoContainer = document.querySelector('.canvas-size-info');
    this.coordsContainer = document.querySelector('.target-coords');
    this.currentToolElem = null;

    this.mousePressed = false;
  }

  static createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  }

  selectTool(tool) {
    const selectedToolBtn = document.querySelector(`li[data-name=${tool}]`);

    if (this.currentToolElem) this.currentToolElem.classList.remove('active');

    selectedToolBtn.classList.add('active');
    this.currentToolElem = selectedToolBtn;
  }

  updateLastColors(primColor, secColor) {
    function setBgIfNotTransparent(color) {
      return color !== 'rgba(0,0,0,0)' ? color : '';
    }

    this.primColorElem.style.background = setBgIfNotTransparent(primColor);
    this.secColorElem.style.background = setBgIfNotTransparent(secColor);
  }

  updateCanvasSizeInfo(side) {
    this.sizeInfoContainer.innerText = `[${side}x${side}]`;
  }

  static updateDisplayedValues(sideLength) {
    // FIXME: [...opt.map...]
    const [canvasSizeSelector] = document.getElementsByClassName('canvas-size-selector');

    Array.prototype.forEach.call(canvasSizeSelector.options, (option, index) => {
      if (Number(option.value) === sideLength) {
        canvasSizeSelector.selectedIndex = index;
      }
    });
  }

  clearCoordsContainer() {
    this.coordsContainer.innerText = '';
  }

  updateCoordsContainer(row, col) {
    this.coordsContainer.innerText = `${row}:${col}`;
  }

  createFrameLayout(frameNumber = 0) {
    const frameLayout = View.createDomElement('li', 'frame-preview');
    const frameCanvas = View.createDomElement('canvas', 'frame-canvas', {
      width: this.FRAME_PREVIEW_SIDE_LENGTH,
      height: this.FRAME_PREVIEW_SIDE_LENGTH,
    });
    const deleteFrameBtn = View.createDomElement('button', 'frame-preview-button delete-frame');
    const duplicateFrameBtn = View.createDomElement(
      'button',
      'frame-preview-button duplicate-frame',
    );
    const toggleFrameBtn = View.createDomElement('button', 'frame-preview-button toggle-frame');
    const moveFrameBtn = View.createDomElement('div', 'frame-preview-button move-frame');

    toggleFrameBtn.innerText = frameNumber + 1;
    frameLayout.appendChild(frameCanvas);
    frameLayout.appendChild(deleteFrameBtn);
    frameLayout.appendChild(duplicateFrameBtn);
    frameLayout.appendChild(toggleFrameBtn);
    frameLayout.appendChild(moveFrameBtn);

    return frameLayout;
  }

  selectFrame(frameNum) {
    const selectedFrame = this.framesCollection[frameNum];

    if (this.currentFrame) this.currentFrame.classList.remove('active-frame');

    selectedFrame.classList.add('active-frame');
    this.currentFrame = selectedFrame;
    [this.currentFramePreview] = this.currentFrame.getElementsByTagName('canvas');
  }

  addFrame() {
    const newFrame = this.createFrameLayout(this.framesCollection.length);
    const newFrameNum = this.framesCollection.length;

    this.framesList.appendChild(newFrame);
    this.selectFrame(newFrameNum);
  }

  renumberFrames() {
    Array.prototype.forEach.call(this.framesCollection, (item, pos) => {
      const numberContainer = item.getElementsByClassName('toggle-frame')[0];

      numberContainer.innerText = pos + 1;
    });
  }

  deleteFrame(frameNum) {
    const deletingFrame = this.framesCollection[frameNum];

    if (deletingFrame === this.currentFrame) {
      const nextFrame = this.currentFrame.nextElementSibling;
      const prevFrame = this.currentFrame.previousElementSibling;

      this.selectFrame(nextFrame || prevFrame);
    }

    this.framesList.removeChild(deletingFrame);
    this.renumberFrames();
  }

  duplicateFrame(frameNum) {
    const targetFrame = this.framesCollection[frameNum];
    const duplicate = this.createFrameLayout(this.framesCollection.length);

    this.framesList.insertBefore(duplicate, targetFrame.nextElementSibling);
    this.renumberFrames();
  }

  static toggleFrame(frame) {
    frame.classList.toggle('disabled');
  }

  addToolsListeners() {
    this.toolsContainer.addEventListener('click', ({ target: { classList, dataset } }) => {
      if (!classList.contains('canvas-tool') || classList.contains('disabled')) return;

      const toolName = dataset.name;

      this.emit('toolChanged', toolName);
    });
  }

  addFramesListeners() {
    this.framesListColumn.addEventListener('click', ({ target }) => {
      if (!target.closest('.frame-preview') && !target.closest('.add-frame')) return;

      const clickedFrame = target.closest('.frame-preview');
      const clickedFrameNumber = [...this.framesCollection].indexOf(clickedFrame);
      const { classList } = target;

      if (classList.contains('add-frame')) {
        this.emit('addFrame');
        return;
      }

      if (classList.contains('delete-frame')) {
        this.emit('deleteFrame', clickedFrameNumber);
        return;
      }

      if (classList.contains('duplicate-frame')) {
        this.emit('cloneFrame', clickedFrameNumber);
        return;
      }

      if (classList.contains('toggle-frame')) {
        this.emit('toggleFrame', clickedFrameNumber);
        return;
      }

      if (target.closest('.frame-preview')) {
        this.emit('selectFrame', clickedFrameNumber);
      }
    });
  }

  paintFramePreview(dataURL, frameNum) {
    const img = new Image();
    const frame = this.framesCollection[frameNum];
    const preview = frame.querySelector('canvas');
    const previewCtx = preview.getContext('2d');
    const side = this.FRAME_PREVIEW_SIDE_LENGTH;

    img.onload = () => {
      previewCtx.clearRect(0, 0, side, side);
      previewCtx.drawImage(img, 0, 0, side, side);
    };
    img.src = dataURL || '';
  }

  addCanvasListeners() {
    this.canvas.addEventListener('mousedown', (ev) => {
      const mouseBtnCode = ev.button;

      ev.preventDefault();
      this.mousePressed = true;

      this.emit('drawingStarted', mouseBtnCode);
    });

    this.canvas.addEventListener('mousemove', (ev) => {
      const { offsetX: x, offsetY: y } = ev;

      this.emit('cursorPositionChanged', x, y);

      if (!this.mousePressed) return;

      this.emit('continueDrawing');
    });

    this.canvas.addEventListener('mouseleave', this.clearCoordsContainer.bind(this));

    window.addEventListener('mouseup', () => {
      if (!this.mousePressed) return;

      this.mousePressed = false;
      this.emit('drawingEnded');
    });

    this.canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());
  }

  addHeaderListeners() {
    this.header.addEventListener('click', ({ target: { classList } }) => {
      if (classList.contains('save-state')) {
        this.emit('saveState');
        return;
      }

      if (classList.contains('delete-state')) {
        this.emit('clearState');
        return;
      }

      if (classList.contains('upload-image')) {
        const query = this.ImageQueryInput.value;

        this.emit('uploadImage', query);

        return;
      }

      if (classList.contains('grayscaling')) {
        this.emit('grayscaleCanvas');
      }
    });

    this.sizeSelector.addEventListener('change', ({ target: { value } }) => {
      this.emit('changeCanvasSize', value);
    });
  }

  addPaletteListeners() {
    this.palette.addEventListener(
      'mousedown',
      ({ target: { classList, style }, button: mouseBtnCode }) => {
        if (classList.contains('palette-item')) {
          const color = style.backgroundColor;
          this.emit('pickNewColor', color, mouseBtnCode);

          return;
        }

        if (classList.contains('swap-colors')) {
          this.emit('swapColors');
        }
      },
    );

    this.palette.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });
  }

  addListeners() {
    this.addHeaderListeners();
    this.addToolsListeners();
    this.addPaletteListeners();
    this.addFramesListeners();
    this.addCanvasListeners();
  }

  init({
    activeTool,
    primColor,
    secColor,
    canvasState: { sideCellCount },
    framesState: { currentFrameNumber, listOfFrames },
  }) {
    View.updateDisplayedValues(sideCellCount);
    this.updateCanvasSizeInfo(sideCellCount);
    this.selectTool(activeTool);
    this.updateLastColors(primColor, secColor);
    this.addListeners();

    listOfFrames.forEach(({ dataURL }, frameNum) => {
      this.addFrame();
      this.paintFramePreview(dataURL, frameNum);
    });
    this.selectFrame(currentFrameNumber);
  }
}
