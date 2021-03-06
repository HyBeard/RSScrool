import mapboxgl from 'mapbox-gl/dist/mapbox-gl';

import Widget from './Widget';
import { formatCoords } from '../helpers/common';

function buildMapTemplate(state, glossary) {
  const { latitude, longitude, lang } = state;
  const formattedLatitude = formatCoords(latitude);
  const formattedLongitude = formatCoords(longitude);

  return `
  <div class="map_container container">
    <div class="map" id="map">
    </div>
    <div class="coordinates">
      <div class="coordinates--latitude">
        <span class="coordinates--latitude-text">${glossary.general[lang][4]} </span
        ><span class="coordinates--latitude-value">${formattedLatitude}</span>
      </div>
      <div class="coordinates--longitude">
        <span class="coordinates--longitude-text">${glossary.general[lang][5]} </span
        ><span class="coordinates--longitude-value">${formattedLongitude}</span>
      </div>
    </div>
  </div>
  `;
}

export default class Map extends Widget {
  constructor(state, glossary) {
    super(state, glossary, buildMapTemplate);
  }

  load({ longitude, latitude }) {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2FwdHNldmljaCIsImEiOiJjazRkOXVrcmQwMHI0M21sOXlhMHFhOWJpIn0.-O7Ii-s-ZOZQuG20VId3nQ';

    const nodeToInsertMap = this.node.querySelector('.map');
    const map = new mapboxgl.Map({
      container: nodeToInsertMap,
      style: 'mapbox://styles/mapbox/dark-v10?optimize=true',
      center: [longitude, latitude],
      zoom: 10,
    });
    map.addControl(new mapboxgl.NavigationControl());

    this.map = map;
  }

  update(state, glossary) {
    const { longitude, latitude } = state;
    const updatedNode = this.build(state, glossary);
    const prevCoords = this.node.querySelector('.coordinates');
    const updatedCoords = updatedNode.querySelector('.coordinates');

    prevCoords.replaceWith(updatedCoords);
    this.map.setCenter([longitude, latitude]);
    this.map.setZoom(10);
  }
}
