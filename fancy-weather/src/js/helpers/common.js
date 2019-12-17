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
