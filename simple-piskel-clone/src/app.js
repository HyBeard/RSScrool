import 'babel-polyfill';

import './styles/app.scss';

import Dispatcher from './js/components/Dispatcher';

const dispatcher = new Dispatcher();

dispatcher.init();

window.dispatcher = dispatcher;

// import Controller from './js/components/Controller';

// const controller = new Controller();

// controller.init();

// window.controller = controller;
