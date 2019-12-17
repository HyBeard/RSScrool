import apiLoader from './helpers/apiLoader';

import EventEmitter from './helpers/EventEmitter';
import state from './models/state';

export default class Model extends EventEmitter {
  constructor() {
    super();
    this.defaultQuery = 'spring-day-clear';
    this.apiLoader = apiLoader;
    // FIXME: ObjectAssign
    this.state = state;
  }

  // async updateQuery(query) {
  //   if (query === this.prevQuery) return;

  //   this.prevQuery = query;
  // }

  async getImageLink() {
    const query = this.defaultQuery;

    const imageResponse = await this.apiLoader.getImageJson(query);
    // FIXME: ObjectAssign
    const {
      urls: { regular: imageUrl },
    } = imageResponse;

    return { imageUrl };
  }
}
