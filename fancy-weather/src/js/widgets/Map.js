import mapboxgl from 'mapbox-gl/dist/mapbox-gl';

import Widget from './Widget';

function buildMapTemplate(state, glossary) {
  const { latitude, longitude, lang } = state;

  return `
  <div class="map_container container">
    <div class="map" id="map">
    </div>
    <div class="coordinates">
      <div class="coordinates--latitude">
        <span class="coordinates--latitude-text">${glossary.general[lang][4]}</span
        ><span class="coordinates--latitude-value">${latitude}</span>
      </div>
      <div class="coordinates--longitude">
        <span class="coordinates--longitude-text">${glossary.general[lang][5]}</span
        ><span class="coordinates--longitude-value">${longitude}</span>
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
    map.addControl(
      new mapboxgl.NavigationControl(),
    );

    return map;
  }
}
