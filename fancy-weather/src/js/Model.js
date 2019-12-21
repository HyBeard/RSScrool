import glossary from './data/glossary';

import EventEmitter from './helpers/EventEmitter';
import apiLoader from './helpers/apiLoader';
import { getTimeOfYear, getTimeOfDay, getBasicLocalTime } from './helpers/timeFormatters';

export default class Model extends EventEmitter {
  constructor() {
    super();
    this.apiLoader = apiLoader;
    // FIXME: ObjectAssign
    this.glossary = glossary;
    this.state = {
      lang: 'en',
      temperatureUnits: 'celsius',
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

    const query = `${timeOfYear}-${summary}-${timeOfDay}`;

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

  async translateCity(lang) {
    const { lang: prevLang, cityFormatted } = this.state;

    const translatedCity = await this.apiLoader.getTranslate(cityFormatted, prevLang, lang);
    // this.updateState({ lang });
    // const translatedTimeDetails = this.getFullTimeDetails(currentTimeDetails);
    // this.updateState({ timeDetails: translatedTimeDetails });
    this.updateState({ cityFormatted: translatedCity });
  }

  async updateAllDataForCity(city) {
    const locationInfo = await this.apiLoader.getCityLocationInfo(city);
    const weather = await this.apiLoader.getWeather(locationInfo);
    const basicTimeInfo = getBasicLocalTime();
    const timeDetails = this.getFullTimeDetails(basicTimeInfo);

    this.updateState(weather, locationInfo, { timeDetails });
  }

  async init() {
    const city = await this.apiLoader.getLaunchingCity();
    await this.updateAllDataForCity(city);

    console.log(this.state);
  }
}
