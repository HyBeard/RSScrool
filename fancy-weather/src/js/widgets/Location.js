import Widget from './Widget';

function buildLocationTemplate(state) {
  const {
    cityFormatted,
    timeDetails: {
      date, dayOfWeekShort, month, hour, minute,
    },
  } = state;

  return `
  <div class="location container">
    <div class="location--name">${cityFormatted}</div>
    <div class="location--date_info">
      <div class="location--date date">
        <span class="date--day_of_week_short">${dayOfWeekShort}</span>
        <span class="date--day">${date}</span>
        <span class="date--month">${month}</span>
      </div>
      <div class="location--time time">
        <span class="time--hours">${hour}</span>:<span class="time--minutes">${minute}</span>
      </div>
    </div>
  </div>
  `;
}

export default class Location extends Widget {
  constructor(state, glossary = {}) {
    super(state, glossary, buildLocationTemplate);
  }
}
