export default function buildControls(state) {
  const isActive = (prop, value) => state[prop] === value;

  const htmlStringOfElement = `
  <div class="controls">
    <div class="controls--lang_select">
      <select>
        <option value="en" ${isActive('lang', 'en') ? 'selected' : ''}>en</option>
        <option value="ru" ${isActive('lang', 'ru') ? 'selected' : ''}>ru</option>
        <option value="be" ${isActive('lang', 'be') ? 'selected' : ''}>be</option>
      </select>
    </div>
    <div class="controls--temperature_scale_type">
      <div 
      class="controls--btn ${
  isActive(('temperatureUnits', 'celsius')) ? 'controls--btn-active' : ''
} ">°C</div>
      <div class="controls--btn  ${
  isActive(('temperatureUnits', 'fahrenheit')) ? 'controls--btn-active' : ''
}">°F</div>
    </div>
    <div class="controls--btn btn-refresh_image">refresh</div>
  </div>
  `;
  const fragment = document.createRange().createContextualFragment(htmlStringOfElement);

  return fragment.firstElementChild;
}
