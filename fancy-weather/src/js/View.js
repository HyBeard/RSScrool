// import controls from './views/templates/controls';
import EventEmitter from './helpers/EventEmitter';
import buildControls from './templates/сontrols';
import Location from './widgets/Location';
import DayWeather from './widgets/DayWeather';
import DailyForecast from './widgets/DailyForecast';

export default class View extends EventEmitter {
  constructor() {
    super();
    this.body = document.body;
  }

  printImage(imgUrl) {
    this.body.style.backgroundImage = `url(${imgUrl})`;
  }

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

  init(state, glossary) {
    const wrapper = document.querySelector('.wrapper');

    this.controls = buildControls(state);
    this.location = new Location(state);
    this.dayWeather = new DayWeather(state, glossary);
    this.dailyForecast = new DailyForecast(state, glossary);

    wrapper.insertAdjacentElement('afterbegin', this.dailyForecast.node);
    wrapper.insertAdjacentElement('afterbegin', this.dayWeather.node);
    wrapper.insertAdjacentElement('afterbegin', this.location.node);
    wrapper.insertAdjacentElement('afterbegin', this.controls);
  }
}
