export default class Widget {
  constructor(state, glossary, buildFunction) {
    this.node = Widget.build(state, glossary, buildFunction);
  }

  static stringToHTML(string) {
    const fragmentWithNode = document.createRange().createContextualFragment(string);

    return fragmentWithNode.firstElementChild;
  }

  static build(state, glossary, buildFunction) {
    const string = buildFunction(state, glossary);

    return Widget.stringToHTML(string);
  }

  update(state) {
    const updatedNode = Widget.build(state);

    this.node.replaceWith(updatedNode);
  }
}
