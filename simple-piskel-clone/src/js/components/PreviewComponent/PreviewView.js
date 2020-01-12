import EventEmitter from '../../helpers/EventEmitter';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.animationPreview = document.querySelector('.animate-preview-background');
    this.animationContainer = document.querySelector('.animate-preview');
    this.fpsSlider = document.querySelector('.fps-slider');
    this.fpsValueContainer = document.querySelector('.fps-value');
  }

  renderFpsValue(fpsValue) {
    this.fpsSlider.value = fpsValue;

    this.fpsValueContainer.innerText = `${fpsValue} FPS`;
  }

  showNewAnimationFrame(url) {
    this.animationContainer.style.backgroundImage = `url('${url || ''}')`;
  }

  toggleFullScreen() {
    const { animationPreview } = this;

    if (!document.fullscreenElement) {
      animationPreview.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  addListeners() {
    this.animationPreview.addEventListener('click', ({ target }) => {
      if (target.closest('.frame-preview-button')) {
        this.toggleFullScreen();
      }
    });

    this.fpsSlider.addEventListener('input', () => {
      const newFps = this.fpsSlider.value;
      this.emit('fpsChanged', newFps);
    });
  }

  init(fpsValue) {
    this.renderFpsValue(fpsValue);
    this.addListeners();
  }
}
