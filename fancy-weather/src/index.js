import './styles/style.scss';
import Controller from './js/Controller';

const controller = new Controller();

window.onload = controller.init.bind(controller);

global.controller = controller; // FIXME: to dev
