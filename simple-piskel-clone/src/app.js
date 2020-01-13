import 'babel-polyfill';

import './styles/styles.scss';

import Dispatcher from './js/components/Dispatcher';

const dispatcher = new Dispatcher();

dispatcher.init();

window.dispatcher = dispatcher;

// import Controller from './js/components/Controller';

// const controller = new Controller();

// controller.init();

// window.controller = controller;
