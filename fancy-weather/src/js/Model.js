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
      timeOfYear,
      month,
      dayNum,
      dayOfWeek,
      dayOfWeekShort,
      timeOfDay,
      hour,
      nextDaysOfWeek,
      ...rest,
    };
  }

  updateState(...props) {
    Object.assign(this.state, ...props);
  }

  async init() {
    const { latitude, longitude, city } = await this.apiLoader.getLocation();
    const weather = await this.apiLoader.getWeather({ latitude, longitude });
    const locationInfo = await this.apiLoader.getCityLocationInfo(city);
    const basicTimeInfo = getBasicLocalTime();
    const timeDetails = this.getFullTimeDetails(basicTimeInfo);

    this.updateState(weather, locationInfo, { timeDetails });

    console.log(this.state);
  }
}
