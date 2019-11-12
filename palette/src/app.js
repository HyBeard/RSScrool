import './styles/styles.scss';

import CanvasState from './js/components/CanvasState';
import DrawingToolHandler from './js/components/DrawingToolHandler';
import ToolSupport from './js/tools/ToolSupport';
import StaticTools from './js/tools/StaticTools';
import View from './js/components/View';


const header = document.getElementsByClassName('header')[0];
const canvas = document.getElementsByClassName('main-canvas')[0];
const ctx = canvas.getContext('2d');
const toolsContainer = document.getElementsByClassName('tools-container')[0];
const palette = document.getElementsByClassName('palette-container')[0];
const sizeSelector = document.getElementsByClassName('canvas-size-selector')[0];
const savedState = JSON.parse(localStorage.getItem('state'));
const defaultState = {
  general: new CanvasState(),
  activeTool: 'draw',
  mousedown: false,
};
const state = (() => {
  if (savedState) {
    return {
      general: new CanvasState(savedState.general),
      activeTool: savedState.activeTool,
      mousePressed: false,
    };
  }

  return defaultState;
})();

const view = new View(state);
const toolSupport = new ToolSupport(state);
const drawingToolHandler = new DrawingToolHandler(ctx, state, toolSupport);
const staticTools = new StaticTools(toolSupport);

canvas.addEventListener(
  'mousedown',
  (ev) => {
    state.mousePressed = true;
    ev.preventDefault();

    if (state.activeTool === 'eyedropper') {
      const color = state.general.canvasData[toolSupport.currentIndex];

      if (ev.button === 0) {
        toolSupport.updateStateColors(color);
      } else if (ev.button === 2) {
        toolSupport.updateStateColors(false, color);
      }

      view.updateLastColors(state);

      return;
    }

    if (ev.button === 0) {
      state.general.activeColor = state.general.primColor;
    } else {
      state.general.activeColor = state.general.secColor;
    }

    staticTools[state.activeTool](toolSupport.currentIndex, state);

    drawingToolHandler.setDirtyIndices(toolSupport.indicesToDraw, toolSupport.indicesColors);
    drawingToolHandler.handleDirtyIndices(state.mousePressed);
  },
  false,
);

canvas.addEventListener(
  'mousemove',
  (ev) => {
    if (toolSupport.coordsIsChanged(ev.offsetX, ev.offsetY)) {
      drawingToolHandler.updateCoordsInfo(ev);
    } else return;

    if (!state.mousePressed) return;

    if (staticTools[state.activeTool]) {
      toolSupport.clearPointsToDraw();
      staticTools[state.activeTool](toolSupport.currentIndex, state);
    }

    drawingToolHandler.setDirtyIndices(toolSupport.indicesToDraw, toolSupport.indicesColors);
  },
  false,
);

canvas.addEventListener('contextmenu', (ev) => {
  ev.preventDefault();
});

window.addEventListener(
  'mouseup',
  () => {
    if (!state.mousePressed) return;
    state.mousePressed = false;

    if (drawingToolHandler.dirtyIndices.length !== 0) {
      drawingToolHandler.handleDirtyIndices(state.mousePressed);
    }

    window.cancelAnimationFrame(drawingToolHandler.reqAnimId);
    toolSupport.clearPointsToDraw();
  },
  false,
);

canvas.addEventListener(
  'mouseleave',
  () => {
    drawingToolHandler.updateCoordsInfo();
  },
  false,
);

function initialize() {
    view.initView(state);
    drawingToolHandler.changeMainCanvas();
  }

  initialize();
