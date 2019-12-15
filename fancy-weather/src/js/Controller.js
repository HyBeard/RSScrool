import '@babel/polyfill';

import EventEmitter from './helpers/EventEmitter';
import Model from './Model';
import View from './View';

const model = new Model();
const view = new View();

export default class Controller extends EventEmitter {
  constructor() {
    super();
    this.view = view;
    this.model = model;

    view.on('refreshImage', this.fillBackground.bind(this));
  }

  async fillBackground() {
    const { imageUrl } = await this.model.getImageLink();

    this.view.printPictureAfterUploading(imageUrl);
  }

  // init() {
  //   this.view.init();
  // }
}
