import Sortable from 'sortablejs';

import EventEmitter from '../../helpers/EventEmitter';

export default class FramesView extends EventEmitter {
  constructor() {
    super();
    this.FRAME_PREVIEW_SIDE_LENGTH = 128;
    this.framesListColumn = document.querySelector('.frames_bar');
    this.framesList = document.querySelector('.frames_bar--frames');
    this.framesCollection = document.getElementsByClassName('preview');
    this.currentFrame = null;
  }

  static createDomElement(tag, classes, props) {
    const newElement = document.createElement(tag);

    newElement.className = classes;
    Object.assign(newElement, props);

    return newElement;
  }

  createFrameLayout(frameNumber, disabled) {
    const { createDomElement } = FramesView;
    const frameLayout = createDomElement('li', 'frames_bar--preview preview');
    const frameCanvas = createDomElement('canvas', 'preview--canvas', {
      width: this.FRAME_PREVIEW_SIDE_LENGTH,
      height: this.FRAME_PREVIEW_SIDE_LENGTH,
    });
    const deleteFrameBtn = createDomElement('button', 'sticked_btn delete_frame');
    const duplicateFrameBtn = createDomElement('button', 'sticked_btn duplicate_frame');
    const toggleFrameBtn = createDomElement(
      'button',
      `sticked_btn toggle_frame ${disabled ? 'toggle_frame-disabled' : ''}`,
    );
    const moveFrameBtn = createDomElement('div', 'sticked_btn move_frame');
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
    if (this.currentFrame) this.currentFrame.classList.remove('preview-active');

    selectedFrame.classList.add('preview-active');
    this.currentFrame = selectedFrame;
    [this.currentFramePreview] = this.currentFrame.getElementsByTagName('canvas');
  }

  renderNewFrame(disabled) {
    const newFrameNum = this.framesCollection.length;
    const newFrame = this.createFrameLayout(newFrameNum, disabled);

    this.framesList.appendChild(newFrame);
    this.selectFrame(newFrameNum);
  }

  renumberFrames() {
    Array.prototype.forEach.call(this.framesCollection, (item, pos) => {
      const numberContainer = item.getElementsByClassName('toggle_frame')[0];

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

    const toggleButtonElem = toggledFrame.querySelector('.toggle_frame');
    toggleButtonElem.classList.toggle('toggle_frame-disabled');
  }

  paintFramePreview(dataURL, frameNum) {
    const img = new Image();
    const givenFrame = this.framesCollection[frameNum];
    const currentFrame = document.querySelector('.preview-active');
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
      if (!target.closest('.preview') && !target.closest('.frames_bar--add_frame_btn')) return;

      const clickedFrame = target.closest('.preview');
      const clickedFrameNumber = [...this.framesCollection].indexOf(clickedFrame);
      const { classList } = target;

      if (classList.contains('frames_bar--add_frame_btn')) {
        this.emit('addFrame');
        return;
      }

      if (classList.contains('delete_frame')) {
        this.emit('deleteFrame', clickedFrameNumber);
        return;
      }

      if (classList.contains('duplicate_frame')) {
        this.emit('cloneFrame', clickedFrameNumber);
        return;
      }

      if (classList.contains('toggle_frame')) {
        this.emit('toggleFrame', clickedFrameNumber);
        return;
      }

      if (target.closest('.preview')) {
        this.emit('selectFrame', clickedFrameNumber);
      }
    });

    Sortable.create(this.framesList, {
      sort: true,
      direction: 'vertical',
      fallbackTolerance: 5,
      ghostClass: 'preview-ghost',
      chosenClass: 'preview-chosen',
      dragClass: 'preview-draggable',

      onEnd: (ev) => {
        const { oldIndex, newIndex } = ev;
        this.emit('moveFrame', oldIndex, newIndex);
      },
    });
  }

  init({ currentFrameNumber, listOfFrames }) {
    listOfFrames.forEach(({ dataURL, disabled }, frameNum) => {
      this.renderNewFrame(disabled);
      this.paintFramePreview(dataURL, frameNum);
    });

    this.addListeners();
    this.emit('selectFrame', currentFrameNumber);
  }
}
