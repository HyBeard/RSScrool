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
    const url = `https://api.unsplash.com/photos/random?query=${query}&client_id=ae8d7de6acc767654ce496c4d3cc5e08da2f74bae163d354d682e400d8cee33e`;
    const trustedUrl = this.passThroughProxy(url);
    const response = await this.getJson(trustedUrl);

    return response.urls.regular;
  },

  async getLocation() {
    const url = 'https://ipinfo.io/json?token=f16cf59763a028';

    const json = await this.getJson(url);
    const { city } = json;
    const [latitude, longitude] = json.loc.split(',').map(Number);

    return { latitude, longitude, city };
  },

  async getCityLocationInfo(city) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=9dc8f5a4e2724c3aa83e3d0d471d2ad4&language=en&pretty=1&no_annotations=1&limit=1`;

    const response = await this.getJson(url);
    const {
      results: [responseResult],
    } = response;

    return {
      cityFormatted: responseResult.formatted,
      latitude: responseResult.geometry.lat.toFixed(2),
      longitude: responseResult.geometry.lng.toFixed(2),
    };
  },

  async getCity(latitude, longitude) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C%20${longitude}&key=9dc8f5a4e2724c3aa83e3d0d471d2ad4&language=en&pretty=1&no_annotations=1&limit=1`;

    return this.getJson(url);
  },

  async getWeather({ latitude, longitude }) {
    const url = `https://api.darksky.net/forecast/3b0029e877b4499d720e83528314bf14/${latitude},${longitude}?units=si&lang=en&exclude=hourly,flags,alerts`;
    const trustedUrl = this.passThroughProxy(url);
    const response = await this.getJson(trustedUrl);

    return this.filterWeatherResponse(response);
  },

  filterWeatherResponse(responseObj) {
    const {
      summary,
      icon,
      temperature,
      apparentTemperature,
      windSpeed,
      humidity,
    } = responseObj.currently;

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
    };
  },
};

export default apiLoader;
