import './styles/styles.scss';

import Palette from './js/components/Palette';

const savedState = JSON.parse(localStorage.getItem('state'));
const palette = new Palette(savedState || {});

palette.initialize();
