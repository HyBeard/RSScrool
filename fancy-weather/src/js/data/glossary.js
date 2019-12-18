const glossary = {
  dayOfWeek: {
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    be: ['Нядзеля', 'Панядзелак', 'Аўторак', 'Серада', 'Чацвер', 'Пятніца', 'Субота'],
  },

  dayOfWeekShort: {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ru: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
    be: ['Нд', 'Пн', 'Аў', 'Ср', 'Чц', 'Пт', 'Сб'],
  },

  month: {
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    ru: [
      'Января',
      'Февраля',
      'Марта',
      'Апреля',
      'Мая',
      'Июня',
      'Июля',
      'Августа',
      'Сентября',
      'Октября',
      'Ноября',
      'Декабря',
    ],
    be: [
      'Студзеня',
      'Лютага',
      'Сакавіка',
      'Красавіка',
      'Мая',
      'Чэрвеня',
      'Ліпеня',
      'Жніўня',
      'Верасня',
      'Кастрычніка',
      'Лістапада',
      'Снежня',
    ],
  },

  summary: {
    en: ['Feels like: ', 'Wind:', 'm/s', 'Humidity:', 'Latitude:', 'Longitude:'],
    ru: ['Ощущается как: ', 'Ветер:', 'м/с', 'Влажность:', 'Широта:', 'Долгота:'],
    be: ['Адчуваецца як: ', 'Вецер:', 'м/с', 'Вільготнасць:', 'Шырыня:', 'Даўгата:'],
  },

  icons: {
    'clear-day': 'wi-day-sunny',
    'clear-night': 'wi-night-clear',
    cloudy: 'wi-cloud',
    fog: 'wi-fog',
    'partly-cloudy-night': 'wi-night-alt-cloudy',
    'partly-cloudy-day': 'wi-day-cloudy',
    rain: 'wi-rain',
    sleet: 'wi-rain-mix',
    snow: 'wi-snow',
    wind: 'wi-cloudy-gusts',
  },

  errors: {
    en: [
      'Incorrect query!',
      'Images have ended, please, wait for next hour.',
      'Sorry, service temporary unavailable. Please try again later.',
    ],
    ru: [
      'Неверный запрос!',
      'Изображения закончились, пожалуйста, подождите следующего часа.',
      'Извините, сервис временно недоступен. Пожалуйста, попробуйте позже.',
    ],
    be: [
      'Няправільны запыт!',
      'Выявы скончыліся, пачакайце, наступную гадзіну.',
      'На жаль, служба часова недаступная. Калі ласка паспрабуйце зноў пазней.',
    ],
  },
};

export default glossary;
