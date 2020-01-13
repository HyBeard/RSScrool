import Sortable from 'sortablejs';

import EventEmitter from '../../helpers/EventEmitter';

export default class FramesView extends EventEmitter {
  constructor() {
    super();
    this.FRAME_PREVIEW_SIDE_LENGTH = 128;
    this.framesListColumn = document.querySelector('.frames-list-column');
    this.framesList = document.querySelector('.frames-list');
    this.framesCollection = document.getElementsByClassName('frame-preview');
    this.currentFrame = null;
  }

  static createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  }

  createFrameLayout(frameNumber = 0) {
    // TODO: switch canvas on div
    const { createDomElement } = FramesView;
    const frameLayout = createDomElement('li', 'frame-preview');
    const frameCanvas = createDomElement('canvas', 'frame-canvas', {
      width: this.FRAME_PREVIEW_SIDE_LENGTH,
      height: this.FRAME_PREVIEW_SIDE_LENGTH,
    });
    const deleteFrameBtn = createDomElement('button', 'frame-preview-button delete-frame');
    const duplicateFrameBtn = createDomElement('button', 'frame-preview-button duplicate-frame');
    const toggleFrameBtn = createDomElement('button', 'frame-preview-button toggle-frame');
    const moveFrameBtn = createDomElement('div', 'frame-preview-button move-frame');
    const canvasContext = frameCanvas.getContext('2d');

    canvasContext.imageSmoothingEnabled = false;
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

    if (selectedFrame === this.currentFrame) return;
    if (this.currentFrame) this.currentFrame.classList.remove('active-frame');

    selectedFrame.classList.add('active-frame');
    this.currentFrame = selectedFrame;
    [this.currentFramePreview] = this.currentFrame.getElementsByTagName('canvas');
  }

  renderNewFrame() {
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

  deleteFrame(frameNum, nextFrameNum) {
    const deletingFrame = this.framesCollection[frameNum];

    this.framesList.removeChild(deletingFrame);
    this.renumberFrames();

    if (deletingFrame === this.currentFrame) {
      this.selectFrame(nextFrameNum);
    }
  }

  duplicateFrame(frameNum) {
    const targetFrame = this.framesCollection[frameNum];
    const duplicate = this.createFrameLayout(this.framesCollection.length);
    const duplicateFrameNum = frameNum + 1;

    this.framesList.insertBefore(duplicate, targetFrame.nextElementSibling);
    this.renumberFrames();
    this.selectFrame(duplicateFrameNum);
  }

  toggleFrame(frameNum) {
    const toggledFrame = this.framesCollection[frameNum];

    const toggleButtonElem = toggledFrame.querySelector('.toggle-frame');
    toggleButtonElem.classList.toggle('disabled');
  }

  paintFramePreview(dataURL, frameNum) {
    const img = new Image();
    const givenFrame = this.framesCollection[frameNum];
    const currentFrame = document.querySelector('.active-frame');
    const preview = (givenFrame || currentFrame).querySelector('canvas');
    const previewCtx = preview.getContext('2d');
    const side = this.FRAME_PREVIEW_SIDE_LENGTH;

    img.onload = () => {
      previewCtx.clearRect(0, 0, side, side);
      previewCtx.drawImage(img, 0, 0, side, side);
    };
    img.src = dataURL || '';
  }

  addListeners() {
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

    Sortable.create(this.framesList, {
      sort: true,
      direction: 'vertical',
      fallbackTolerance: 5,
      ghostClass: 'frame-preview--ghost',
      chosenClass: 'frame-preview--chosen',
      dragClass: 'frame-preview--draggable',

      onEnd: (ev) => {
        const { oldIndex, newIndex } = ev;
        this.emit('moveFrame', oldIndex, newIndex);
      },
    });
  }

  init({ currentFrameNumber, listOfFrames }) {
    listOfFrames.forEach(({ dataURL }, frameNum) => {
      this.renderNewFrame();
      this.paintFramePreview(dataURL, frameNum);
    });

    this.addListeners();
    this.emit('selectFrame', currentFrameNumber);
  }
}
