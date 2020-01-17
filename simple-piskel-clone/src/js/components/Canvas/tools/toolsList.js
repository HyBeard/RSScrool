import draw from './toolsFunctions/draw';
import mirrorDraw from './toolsFunctions/mirrorDraw';
import stroke from './toolsFunctions/stroke';
import rectangle from './toolsFunctions/rectangle';
import circle from './toolsFunctions/circle';
import move from './toolsFunctions/move';
import paintAll from './toolsFunctions/paintAll';
import paintBucket from './toolsFunctions/paintBucket';
import resize from './controlsFunctions/resize';
import getColorIndicesOfReducedImg from './controlsFunctions/reduceImg';

const toolsList = {
  draw,
  mirrorDraw,
  stroke,
  paintAll,
  paintBucket,
  resize,
  rectangle,
  circle,
  move,
  getColorIndicesOfReducedImg,
};

export default toolsList;
