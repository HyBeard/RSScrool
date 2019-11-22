export default class APILoader {
  constructor() {
    this.baseLink = 'https://api.unsplash.com/photos/random?';
    this.query = {
      town: 'Minsk',
    };
    this.key = '3bc7ddad91eaf92b379173d13909b138856b2f3e622dc12b84e6be194907d42c';
  }

  makeUrlForId(query = this.query) {
    const finalQuery = Object.entries(query).reduce((str, arr) => `${str}${arr.join(',')}&`, '');

    return `${this.baseLink}query=${finalQuery}client_id=${this.key}`;
  }

  async getImgUrl(query) {
    try {
      const url = this.makeUrlForId(query);
      const response = await fetch(url);
      const data = await response.json();

      return data.urls.small;
    } catch (error) {
      throw new Error(error);
    }
  }
}
