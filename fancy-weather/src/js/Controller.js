import '@babel/polyfill';

import EventEmitter from './helpers/EventEmitter';
import Model from './Model';
import View from './View';

const model = new Model();
const view = new View(model.state);

export default class Controller extends EventEmitter {
  constructor() {
    super();
    this.view = view;
    this.model = model;
  }

  async fillBackground() {
    const imageUrl = await this.model.getImageUrlByQuery();

    this.view.printPictureAfterUploading(imageUrl);
  }

  async init() {
    const { glossary, state: currentState } = this.model;

    await this.model.init();
    await this.view.init(currentState, glossary);
    await this.fillBackground();
    this.view.addEventListeners();
    this.addEventsToEmitter();
  }

  changeTempUnits(units) {
    const { state, glossary } = this.model;

    this.model.updateState({ temperatureUnits: units });
    this.view.dayWeather.update(state, glossary);
    this.view.dailyForecast.update(state, glossary);
  }

  async changeLanguage(lang) {
    // FIXME: destructuring methods, no-shadow
    const {
      state,
      glossary,
      state: { timeDetails: currentTimeDetails },
    } = this.model;

    await this.model.translateCity(lang);
    this.model.updateState({ lang });
    const translatedTimeDetails = this.model.getFullTimeDetails(currentTimeDetails);
    this.model.updateState({ timeDetails: translatedTimeDetails });
    this.view.redrawComponents(state, glossary);
  }

  async searchCity(city) {
    const { state, glossary } = this.model;

    await this.model.updateAllDataForCity(city);
    await this.model.translateCity(state.lang);

    this.view.redrawComponents(state, glossary);
    this.fillBackground();
  }

  addEventsToEmitter() {
    this.view.on('refreshImage', this.fillBackground.bind(this));
    this.view.on('searchCity', this.searchCity.bind(this));
    this.view.on('changeTempUnits', this.changeTempUnits.bind(this));
    this.view.on('changeLanguage', this.changeLanguage.bind(this));
  }
}
