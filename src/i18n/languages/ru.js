
const messages = {
  UNKNOWN_TYPE : 'неизвестный тип ${type}',
  UNKNOWN_VALIDATION : 'неизвестная валидация ${name}',
  CAST_ERROR : 'не удалось привести значение к типу ${type}',
  INVALID_VALUE_ERROR : 'недопустимое значение',
  LENGTH_MIN_ERROR : 'длина меньше ${length}',
  LENGTH_MAX_ERROR : 'длина больше ${length}',
  LENGTH_NE_ERROR : 'длина не равна ${length}',
  MIN_ERROR : 'значение меньше ${value}',
  MAX_ERROR : 'значение больше ${value}',
  NE_ERROR : 'значение не может быть равно ${value}',
  GT_ERROR : 'значение должно быть больше ${value}',
  LT_ERROR : 'значение должно быть меньше ${value}',
  PRESENCE_REQUIRED_ERROR : 'значение не указано',
  PRESENCE_ABSENT_ERROR : 'значение должно отсутствовать',

  VALIDATION_ERROR : 'ошибка валидации',
  VALIDATION_ERROR_WITH_MESSAGE : 'ошибка валидации (${message})',
  FIELD_VALIDATION_ERROR : 'ошибка валидации поля "${path}"',
  FIELD_VALIDATION_ERROR_WITH_MESSAGE : 'ошибка валидации поля "${path}" (${message})'
};

export default messages;
