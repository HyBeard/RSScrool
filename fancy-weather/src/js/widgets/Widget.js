export default class Widget {
  constructor(state, glossary, buildFunction) {
    this.buildFunction = buildFunction;
    this.node = this.build(state, glossary);
  }

  static stringToHTML(string) {
    const fragmentWithNode = document.createRange().createContextualFragment(string);

    return fragmentWithNode.firstElementChild;
  }

  build(state, glossary) {
    const string = this.buildFunction(state, glossary);

    return Widget.stringToHTML(string);
  }

  update(state, glossary) {
    const updatedNode = this.build(state, glossary);

    this.node.replaceWith(updatedNode);
    this.node = updatedNode;
  }
}
