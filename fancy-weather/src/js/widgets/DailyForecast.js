import Widget from './Widget';
import { celsiusToFahrenheit } from '../helpers/common';

function buildDailyForecast(state, glossary) {
  const {
    temperatureUnits,
    daily,
    timeDetails: { nextDaysOfWeek },
  } = state;

  const dayForecastTemplate = (nextDayNum) => {
    let { temperature } = daily[nextDayNum];
    const { icon } = daily[nextDayNum];
    const dayOfWeek = nextDaysOfWeek[nextDayNum];
    const iconClassName = glossary.icons[icon];

    if (temperatureUnits === 'fahrenheit') temperature = celsiusToFahrenheit(temperature);

    return `
    <div class="forecast--item">
    <div class="forecast--day">${dayOfWeek}</div>
    <div class="forecast--temperature">
      <span class="forecast--temp-value">${temperature}</span>
    </div>
    <div class="forecast--icon_container">
      <i class="forecast--icon wi ${iconClassName}"></i>
    </div>
  </div>
  `;
  };

  const templateOfAllDays = daily.reduce(
    (res, _, nextDayNum) => `${res}${dayForecastTemplate(nextDayNum)}`,
    '',
  );

  return `
  <div class="forecast">
    ${templateOfAllDays}
  </div>
  `;
}

export default class DailyForecast extends Widget {
  constructor(state, glossary) {
    super(state, glossary, buildDailyForecast);
  }
}
