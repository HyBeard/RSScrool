import Widget from './Widget';
import { formatTime } from '../helpers/timeFormatters';

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
        <span class="time--hours">${formatTime(
    hour,
  )}</span>:<span class="time--minutes">${formatTime(minute)}</span>
      </div>
    </div>
  </div>
  `;
}

export default class Location extends Widget {
  constructor(state, glossary = {}) {
    super(state, glossary, buildLocationTemplate);
  }

  static startClock(state, elem) {
    let {
      timeDetails: { hour, minute, second },
    } = state;

    const hoursElement = elem.querySelector('.time--hours');
    const minutesElement = elem.querySelector('.time--minutes');

    function printClock() {
      hoursElement.innerText = formatTime(hour);
      minutesElement.innerText = formatTime(minute);
    }

    setInterval(() => {
      if (second < 59) {
        second += 1;
      } else {
        second = 0;
        if (minute < 59) {
          minute += 1;
        } else {
          minute = 0;
          if (hour < 23) {
            hour += 1;
          } else hour = 0;
        }
        printClock();
      }
    }, 1000);
  }

  build(state, glossary) {
    const string = this.buildFunction(state, glossary);
    const elem = Widget.stringToHTML(string);

    Location.startClock(state, elem);
    return elem;
  }
}
