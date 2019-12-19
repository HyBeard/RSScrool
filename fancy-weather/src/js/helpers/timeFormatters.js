import moment from 'moment-timezone';

function getNextDays(count, now) {
  const nextDates = new Array(count);

  nextDates.fill(null);
  return nextDates.map(() => {
    const nextDayTime = now.add(1, 'day');
    const day = nextDayTime.day();

    return day;
  });
}

export function getBasicLocalTime(momentObj = moment()) {
  const monthNum = momentObj.month();
  const date = momentObj.date();
  const dayNum = momentObj.day();
  const hour = momentObj.hour();
  const minute = momentObj.minute();
  const second = momentObj.second();
  const nextDays = getNextDays(3, momentObj);

  return {
    monthNum,
    date,
    dayNum,
    hour,
    minute,
    second,
    nextDays,
  };
}

export function getBasicCountryTime({ timezone }) {
  return getBasicLocalTime(moment.tz(timezone));
}

export function getTimeOfYear(monthNum) {
  if (monthNum <= 1 || monthNum === 11) {
    return 'Winter';
  }
  if (monthNum <= 4) {
    return 'Spring';
  }
  if (monthNum <= 7) {
    return 'Summer';
  }

  return 'Autumn';
}

export function getTimeOfDay(hour) {
  return hour < 6 || hour > 21 ? 'night' : 'day';
}
