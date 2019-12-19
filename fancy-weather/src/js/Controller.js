import '@babel/polyfill';

import EventEmitter from './helpers/EventEmitter';
import Model from './Model';
import View from './View';

const model = new Model();
const view = new View(model.state);

export default class Controller extends EventEmitter {
  constructor() {
    super();
    this.view = view;
    this.model = model;

    view.on('refreshImage', this.fillBackground.bind(this));
  }

  async fillBackground() {
    const imageUrl = await this.model.getImageUrlByQuery();

    this.view.printPictureAfterUploading(imageUrl);
  }

  async init() {
    const { glossary, state: currentState } = this.model;

    await this.model.init();
    await this.view.init(currentState, glossary);
    await this.fillBackground();
  }
}
