export default class APILoader {
  constructor() {
    this.baseLink = 'https://api.unsplash.com/photos/random?query=town,Minsk&client_id=';
    this.key = '3bc7ddad91eaf92b379173d13909b138856b2f3e622dc12b84e6be194907d42c';
    this.currentQuery = null;
  }

  makeUrlForId() {
    return `${this.baseLink}${this.key}`;
  }

  async getImgUrl() {
    try {
      const url = this.makeUrlForId();
      const response = await fetch(url);
      const data = await response.json();
      return data.urls.small;
    } catch (error) {
      throw new Error(error);
    }
  }
}
