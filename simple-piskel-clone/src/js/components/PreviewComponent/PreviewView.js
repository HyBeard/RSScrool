import EventEmitter from '../../helpers/EventEmitter';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.animationPreview = document.querySelector('.animation_box--inner_wrap');
    this.animationContainer = document.querySelector('.animation_box--changeable_bg');
    this.fpsSlider = document.querySelector('.animation_box--fps_slider');
    this.fpsValueContainer = document.querySelector('.animation_box--fps_value');
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
      if (target.closest('.sticked_btn')) {
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
