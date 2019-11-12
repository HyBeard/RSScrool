export default class StaticTools {
  constructor(toolSupport) {
    this.toolSupport = toolSupport;
  }

  draw(idx) {
    this.toolSupport.indicesToDraw.push(idx);

    if (this.toolSupport.indicesAreMissed()) {
      const mouseFrom = this.toolSupport.indexToRowCol(this.toolSupport.prevIndex);
      const mouseTo = this.toolSupport.indexToRowCol(this.toolSupport.currentIndex);

      this.toolSupport.indicesToDraw = this.toolSupport.drawLine(mouseFrom, mouseTo);
    }
  }

}
