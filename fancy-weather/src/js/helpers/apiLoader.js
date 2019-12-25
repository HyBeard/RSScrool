const apiLoader = {
  async getJson(url) {
    const response = await fetch(url);
    const json = await response.json();

    return json;
  },

  passThroughProxy(url) {
    const proxy = 'https://cors-anywhere.herokuapp.com/';

    return `${proxy}${url}`;
  },

  async getImageUrl(query) {
    const url = `https://api.unsplash.com/photos/random?sig=${Math.random().toFixed(3)}&query=${query}&client_id=9a2a3a79ec7c1ff612c4f80e49d689119d1957beb8df77d0a20403f26dedaa1c`;
    const trustedUrl = this.passThroughProxy(url);
    const response = await this.getJson(trustedUrl);

    return response.urls.regular;
  },

  async getLaunchingCity() {
    const url = 'https://ipinfo.io/json?token=f16cf59763a028';

    const json = await this.getJson(url);
    const { city } = json;

    return city;
  },

  async getCityLocationInfo(city, lang) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=9dc8f5a4e2724c3aa83e3d0d471d2ad4&language=${lang}&pretty=1&no_annotations=1&limit=1`;

    const response = await this.getJson(url);
    const {
      results: [responseResult],
    } = response;

    return {
      cityFormatted: responseResult.formatted,
      latitude: responseResult.geometry.lat.toFixed(2),
      longitude: responseResult.geometry.lng.toFixed(2),
      lang,
    };
  },

  async getCity({ latitude, longitude, lang }) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C%20${longitude}&key=9dc8f5a4e2724c3aa83e3d0d471d2ad4&language=${lang}&pretty=1&no_annotations=1&limit=1`;

    return this.getJson(url);
  },

  async getWeather({ latitude, longitude, lang }) {
    const url = `https://api.darksky.net/forecast/f98630c0901ea282ea311703ad5e077b/${latitude},${longitude}?units=si&lang=${lang}&exclude=hourly,flags,alerts`;
    const trustedUrl = this.passThroughProxy(url);
    const response = await this.getJson(trustedUrl);

    return this.filterWeatherResponse(response);
  },

  filterWeatherResponse(responseObj) {
    const {
      timezone,
      currently: {
        summary, icon, temperature, apparentTemperature, windSpeed, humidity,
      },
    } = responseObj;

    const daily = responseObj.daily.data.slice(1, 4).map((dayObj) => {
      const { icon: dailyIcon, temperatureMax, temperatureMin } = dayObj;
      const temperatureAverage = Math.ceil((temperatureMax + temperatureMin) / 2);

      return { icon: dailyIcon, temperature: temperatureAverage };
    });

    return {
      summary,
      icon,
      temperature: Math.ceil(temperature),
      apparentTemperature: Math.ceil(apparentTemperature),
      windSpeed: Math.ceil(windSpeed),
      humidity: humidity * 100,
      daily,
      timezone,
    };
  },

  async getTranslate(textStrings, lang) {
    const queries = textStrings.reduce((sumStr, str) => `${sumStr}&text=${str}`, '');

    const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20191221T102000Z.c245c54bdeb89ff3.d5a49e3c6e952118a8401b3c1d7e18bd4a2ba856&${queries}&lang=${lang}`;

    const response = await this.getJson(url);

    return response.text;
  },
};

export default apiLoader;
