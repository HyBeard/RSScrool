export function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

export function fahrenheitToCelsius(fahrenheit) {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

export function formatCoords(coordsValue) {
  return `${coordsValue.split('.').join('°')}'`;
}

export function save(state) {
  const string = JSON.stringify(state);

  localStorage.setItem('state', string);
}

export function load(field) {
  const string = localStorage.getItem('state');

  if (!string) return null;

  const data = JSON.parse(string);

  return data[field];
}

export function errorHandlingDecorator(fn, errMessage) {
  return async (...args) => {
    try {
      await fn.call(this, args);
    } catch (error) {
      alert(`${errMessage} (${error})`);
    }
  };
}
