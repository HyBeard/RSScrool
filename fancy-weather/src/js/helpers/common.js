import moment from 'moment-timezone';

export function getLocalTimeProps(momentObj = moment()) {
  const monthNum = momentObj.month();
  const dayNum = momentObj.day();
  const hour = momentObj.hour();
  const minute = momentObj.minute();

  return {
    monthNum,
    dayNum,
    hour,
    minute,
  };
}

export function getCountryTimeProps({ timezone }) {
  return getLocalTimeProps(moment.tz(timezone));
}

function getTimeOfYear({ monthNum }) {
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

function getTimeOfDay(hour) {
  return hour < 6 || hour > 21 ? 'night' : 'day';
}

export function getDayDetails({
  monthNum, dayNum, hour, currentLang, glossary,
}) {
  const timeOfYear = getTimeOfYear(monthNum);
  const month = glossary.month[currentLang][monthNum];
  const dayOfWeek = glossary.dayOfWeek[currentLang][dayNum];
  const dayOfWeekShort = glossary.dayOfWeekShort[currentLang][dayNum];
  const timeOfDay = getTimeOfDay(hour);

  return {
    timeOfYear,
    month,
    dayNum,
    dayOfWeek,
    dayOfWeekShort,
    timeOfDay,
  };
}
