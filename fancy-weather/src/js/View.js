// import controls from './views/templates/controls';
import EventEmitter from './helpers/EventEmitter';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.body = document.body;
    this.refreshButton = document.querySelector('.btn-refresh_image');
    // this.layout = new Layout(state);

    this.addEventListeners();
  }

  printImage(imgUrl) {
    this.body.style.backgroundImage = `url(${imgUrl})`;
  }

  // toggleBackgroundBlur() {
  //   this.wrap.classList.toggle('wrap--blur');
  // }

  printPictureAfterUploading(url) {
    const img = new Image();
    img.onload = () => {
      this.printImage(url);
    };

    img.src = url;
  }

  addEventListeners() {
    this.refreshButton.addEventListener('click', () => {
      this.emit('refreshImage');
    });
  }
}
