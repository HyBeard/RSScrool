import glossary from './data/glossary';

import { load, errorHandlingDecorator } from './helpers/common';
import EventEmitter from './helpers/EventEmitter';
import apiLoader from './helpers/apiLoader';
import { getTimeOfYear, getTimeOfDay, getBasicTime } from './helpers/timeFormatters';

export default class Model extends EventEmitter {
  constructor() {
    super();
    this.apiLoader = apiLoader;
    // FIXME: ObjectAssign
    this.glossary = glossary;
    this.state = {
      lang: load('lang') || 'en',
      temperatureUnits: load('temperatureUnits') || 'celsius',
    };
  }

  getGlossaryFieldData(fieldName, positionInField) {
    const {
      glossary: glossaryCopy,
      state: { lang },
    } = this;
    // FIXME: copy????
    return glossaryCopy[fieldName][lang][positionInField];
  }

  async getImageUrlByQuery() {
    const {
      summary,
      timeDetails: { timeOfYear, timeOfDay },
    } = this.state;

    const query = `${timeOfYear}+${summary}+${timeOfDay}`;

    return this.apiLoader.getImageUrl(query);
  }

  getFullTimeDetails({
    monthNum, dayNum, hour, nextDays, ...rest
  }) {
    const timeOfYear = getTimeOfYear(monthNum);
    const month = this.getGlossaryFieldData('month', monthNum);
    const dayOfWeek = this.getGlossaryFieldData('dayOfWeek', dayNum);
    const dayOfWeekShort = this.getGlossaryFieldData('dayOfWeekShort', dayNum);
    const timeOfDay = getTimeOfDay(hour);
    const nextDaysOfWeek = nextDays.map((num) => this.getGlossaryFieldData('dayOfWeek', num)); // FIXME: no-shadow eslint

    return {
      ...rest,
      timeOfYear,
      month,
      dayNum,
      dayOfWeek,
      dayOfWeekShort,
      timeOfDay,
      hour,
      nextDaysOfWeek,
      monthNum,
      nextDays,
    };
  }

  updateState(...props) {
    Object.assign(this.state, ...props);
  }

  async translateCityAndWeather(lang) {
    const { cityFormatted, summary } = this.state;

    const translatedArr = await this.apiLoader.getTranslate([cityFormatted, summary], lang);
    const translatedCity = translatedArr[0];
    const translatedWeather = translatedArr[1];

    this.updateState({ cityFormatted: translatedCity, summary: translatedWeather });
  }

  async updateAllDataForCity(city) {
    const { lang } = this.state;

    const locationInfo = await this.apiLoader.getCityLocationInfo(city, lang);
    const weather = await this.apiLoader.getWeather(locationInfo);
    const basicTimeInfo = getBasicTime(weather.timezone);
    const timeDetails = this.getFullTimeDetails(basicTimeInfo);

    this.updateState(weather, locationInfo, { timeDetails });
  }

  async updateImageUrl() {
    const imageUrl = await this.getImageUrlByQuery();

    this.updateState({ imageUrl });
  }

  async init() {
    this.addErrorHandlings();
    const city = await this.apiLoader.getLaunchingCity();
    await this.updateAllDataForCity(city);
    await this.updateImageUrl();
  }

  addErrorHandlings() {
    this.updateAllDataForCity = errorHandlingDecorator(
      this.updateAllDataForCity.bind(this),
      'Проверьте правильность введенных данных',
    );
    this.getImageUrlByQuery = errorHandlingDecorator(
      this.getImageUrlByQuery.bind(this),
      'Unsplash себя исчерпал. Пожалуйста, подождите часок)',
    );
  }
}
