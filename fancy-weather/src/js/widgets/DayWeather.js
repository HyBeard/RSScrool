import Widget from './Widget';
import { celsiusToFahrenheit } from '../helpers/common';

function buildDayWeatherTemplate(state, glossary) {
  let { apparentTemperature, temperature } = state;
  const {
    temperatureUnits, lang, summary, icon, windSpeed, humidity,
  } = state;
  const { icons, general } = glossary;

  if (temperatureUnits === 'fahrenheit') {
    temperature = celsiusToFahrenheit(temperature);
    apparentTemperature = celsiusToFahrenheit(apparentTemperature);
  }

  return `
  <div class="weather container">
    <div class="weather--temperature">
      <span class="weather--temperature_value">${temperature}°</span>
    </div>
    <div class="weather--icon_container">
      <i class="weather--icon wi ${icons[icon]}"></i>
    </div>
    <div class="weather--state state">
      <div class="state--summary weather--state_elem">${summary}</div>
      <div class="state--apparent_temperature weather--state_elem">
        <span class="state--apparent_temp_text">${general[lang][0]}</span>
        <span class="state--apparent_temp_value">${apparentTemperature}°</span>
      </div>
      <div class="state--wind weather--state_elem">
        <span class="state--wind_text">${general[lang][1]}</span>
        <span class="state--wind_value ">${windSpeed}</span>
        <span class="state--wind_units">${general[lang][2]}</span>
      </div>
      <div class="state--humidity weather--state_elem">
        <span class="state--humidity_text">${general[lang][3]}</span>
        <span class="state--humidity_value ">${humidity}%</span>
      </div>
    </div>
  </div>
  `;
}

export default class DayWeather extends Widget {
  constructor(state, glossary) {
    super(state, glossary, buildDayWeatherTemplate);
  }
}
