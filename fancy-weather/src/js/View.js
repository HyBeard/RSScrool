// import controls from './views/templates/controls';
import EventEmitter from './helpers/EventEmitter';
import buildControls from './templates/сontrols';
import buildSearchBar from './templates/searchBar';
import Location from './widgets/Location';
import DayWeather from './widgets/DayWeather';
import DailyForecast from './widgets/DailyForecast';
import Map from './widgets/Map';

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
    this.searchBar = buildSearchBar();
    this.location = new Location(state);
    this.dayWeather = new DayWeather(state, glossary);
    this.dailyForecast = new DailyForecast(state, glossary);
    this.map = new Map(state, glossary);

    wrapper.insertAdjacentElement('afterbegin', this.map.node);
    wrapper.insertAdjacentElement('afterbegin', this.dailyForecast.node);
    wrapper.insertAdjacentElement('afterbegin', this.dayWeather.node);
    wrapper.insertAdjacentElement('afterbegin', this.location.node);
    wrapper.insertAdjacentElement('afterbegin', this.searchBar);
    wrapper.insertAdjacentElement('afterbegin', this.controls);

    this.map.load(state);
  }
}
