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

  redrawComponents(state, glossary) {
    this.location.update(state, glossary);
    this.dayWeather.update(state, glossary);
    this.dailyForecast.update(state, glossary);
    this.map.update(state, glossary);
  }

  addEventListeners() {
    const langSelector = document.querySelector('.controls--lang_select');
    const searchBar = document.querySelector('.search--fake_input');

    this.controls.addEventListener('click', ({ target }) => {
      if (target.closest('.refresh_image_btn')) {
        this.emit('refreshImage');

        return;
      }

      if (target.closest('.temp_units_btn') && !target.closest('.controls--btn-active')) {
        // FIXME:
        this.controls
          .querySelector('.controls--btn-active')
          .classList.remove('controls--btn-active');
        target.closest('.temp_units_btn').classList.add('controls--btn-active');

        const newTempUnits = target.dataset.units;
        this.emit('changeTempUnits', newTempUnits);
      }
    });

    langSelector.addEventListener('change', ({ target }) => {
      const newLang = target.value;

      this.emit('changeLanguage', newLang);
    });

    searchBar.addEventListener('submit', (ev) => {
      ev.preventDefault();

      const { value } = searchBar.querySelector('input');

      this.emit('searchCity', value);
    });
  }
}
