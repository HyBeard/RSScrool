export default function buildControls(state) {
  const isActive = (prop, value) => state[prop] === value;

  const htmlStringOfElement = `
  <div class="controls container">
    <div class="controls--lang_select">
      <select>
        <option value="en" ${isActive('lang', 'en') ? 'selected' : ''}>en</option>
        <option value="ru" ${isActive('lang', 'ru') ? 'selected' : ''}>ru</option>
        <option value="be" ${isActive('lang', 'be') ? 'selected' : ''}>be</option>
      </select>
    </div>
    <div class="controls--temperature_units">
      <div 
      class="controls--btn temp_units_btn
      ${isActive('temperatureUnits', 'celsius') ? 'controls--btn-active' : ''}
      "
      data-units='celsius' >°C</div>
      <div class="controls--btn temp_units_btn
      ${isActive('temperatureUnits', 'fahrenheit') ? 'controls--btn-active' : ''}" 
      data-units='fahrenheit'>°F</div>
    </div>
    <div class="controls--btn refresh_image_btn"></div>
  </div>
  `;
  const fragment = document.createRange().createContextualFragment(htmlStringOfElement);

  return fragment.firstElementChild;
}
