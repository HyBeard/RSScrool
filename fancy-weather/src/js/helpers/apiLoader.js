const apiLoader = {
  async getJson(url) {
    const response = await fetch(url);
    const json = await response.json();

    return json;
  },

  async getImageJson(query) {
    const url = `https://cors-anywhere.herokuapp.com/https://api.unsplash.com/photos/random?query=${query}&client_id=ae8d7de6acc767654ce496c4d3cc5e08da2f74bae163d354d682e400d8cee33e`;

    return this.getJson(url);
  },

  async getLocation() {
    const url = 'https://ipinfo.io/json?token=f16cf59763a028';

    const json = await this.getJson(url);
    const { city } = json;
    const [latitude, longitude] = json.loc.split(',').map(Number);

    return { latitude, longitude, city };
  },

  async getCoordinates(city) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=9dc8f5a4e2724c3aa83e3d0d471d2ad4&language=en&pretty=1&no_annotations=1&limit=1`;

    return this.getJson(url);
  },

  async getCity(latitude, longitude) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}%2C%20${longitude}&key=9dc8f5a4e2724c3aa83e3d0d471d2ad4&language=en&pretty=1&no_annotations=1&limit=1`;

    return this.getJson(url);
  },

  async  getWeather({ latitude, longitude, lang = 'en' }) {
    const url = `https://api.darksky.net/forecast/3b0029e877b4499d720e83528314bf14/${latitude},${longitude}?units=si&lang=${lang}&exclude=hourly,flags,alerts`;

    return this.getJson(url);
  },
};

export default apiLoader;
