import 'babel-polyfill';

import './styles/app.scss';

import Dispatcher from './js/components/Dispatcher';

const dispatcher = new Dispatcher();

dispatcher.init();
