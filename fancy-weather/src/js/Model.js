import glossary from './data/glossary';

import EventEmitter from './helpers/EventEmitter';
import apiLoader from './helpers/apiLoader';
import {
  getTimeOfYear,
  getTimeOfDay,
  getBasicCountryTime,
  getBasicLocalTime,
} from './helpers/common';

export default class Model extends EventEmitter {
  constructor() {
    super();
    this.defaultQuery = 'spring-day-clear';
    this.apiLoader = apiLoader;
    // FIXME: ObjectAssign
    this.glossary = glossary;
    this.state = {
      lang: 'en',
      temperatureUnits: 'celsius',
    };
  }

  async getImageLink(query) {
    const imageResponse = await this.apiLoader.getImageJson(query);
    // FIXME: ObjectAssign
    const { imageUrl } = imageResponse.urls.regular;

    return { imageUrl };
  }

  getFullTimeDetails({
    monthNum, dayNum, hour, ...rest
  }) {
    const {
      glossary: glossaryCopy,
      state: { lang },
    } = this;

    const timeOfYear = getTimeOfYear(monthNum);
    const month = glossaryCopy.month[lang][monthNum];
    const dayOfWeek = glossaryCopy.dayOfWeek[lang][dayNum];
    const dayOfWeekShort = glossaryCopy.dayOfWeekShort[lang][dayNum];
    const timeOfDay = getTimeOfDay(hour);

    return {
      timeOfYear,
      month,
      dayNum,
      dayOfWeek,
      dayOfWeekShort,
      timeOfDay,
      hour,
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

    this.updateState(weather, locationInfo);
  }
}
