import EventEmitter from '../helpers/EventEmitter';
import Model from './Model';
import View from './View';

const savedState = JSON.parse(localStorage.getItem('state'));
const model = new Model(savedState);
const view = new View();

export default class Controller extends EventEmitter {
  constructor() {
    super();
    this.view = view;
    this.model = model;
  }


  init() {
    this.model.init();
  }
}
