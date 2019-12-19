export default class Location {
  constructor(state) {
    this.node = Location.build(state);
  }

  static stringToHTML(string) {
    const fragmentWithNode = document.createRange().createContextualFragment(string);

    return fragmentWithNode.firstElementChild;
  }

  static createHTMLString(state) {
    const {
      cityFormatted,
      timeDetails: {
        date, dayOfWeekShort, month, hour, minute,
      },
    } = state;

    return `
    <div class="location">
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

  static build(state) {
    const string = Location.createHTMLString(state);

    return Location.stringToHTML(string);
  }

  update(state) {
    const updatedNode = Location.build(state);

    this.node.replaceWith(updatedNode);
  }
}
