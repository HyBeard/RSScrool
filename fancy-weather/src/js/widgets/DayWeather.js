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
  <div class="weather_wrapper">
    <div class="weather--temperature">
      <span class="weather--temperature_value">${temperature}</span>
    </div>
    <div class="weather--icon_container">
      <i class="weather--icon wi ${icons[icon]}"></i>
    </div>
    <div class="weather--state state">
      <div class="state--summary">${summary}</div>
      <div class="state--apparent_temperature">
        <span class="state--apparent_temp-text">${general[lang][0]}</span>
        <span class="state--apparent_temp-value">${apparentTemperature}</span>
      </div>
      <div class="state--wind state">
        <span class="state--wind-text">${general[lang][1]}</span>
        <span class="state--wind-value ">${windSpeed}</span>
        <span class="state--wind-units">${general[lang][2]}</span>
      </div>
      <div class="state--humidity state">
        <span class="state--humidity-text">${general[lang][3]}</span>
        <span class="state--humidity-value ">${humidity}</span>
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
