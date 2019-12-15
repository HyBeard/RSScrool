export default class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(type, handler) {
    this.events[type] = this.events[type] || [];
    this.events[type].push(handler);
  }

  off(type, removableHandler) {
    const handlers = this.events[type];

    if (!handlers) return;

    handlers.filter((handler) => handler !== removableHandler);
  }

  emit(type, ...args) {
    if (!this.events[type]) return;

    this.events[type].forEach((handler) => handler.apply(this, args));
  }
}
