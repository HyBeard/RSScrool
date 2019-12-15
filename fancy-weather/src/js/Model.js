import apiLoader from './helpers/apiLoader';

import EventEmitter from './helpers/EventEmitter';

export default class Model extends EventEmitter {
  constructor() {
    super();
    this.defaultQuery = 'spring-day-clear';
  }

  // async updateQuery(query) {
  //   if (query === this.prevQuery) return;

  //   this.prevQuery = query;
  // }

  async getImageLink() {
    const query = this.defaultQuery;

    const imageResponse = await this.getImageJson(query);
    const {
      urls: { regular: imageUrl },
    } = imageResponse;

    return { imageUrl };
  }
}

Object.assign(Model.prototype, apiLoader);
