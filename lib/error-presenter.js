////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import map from 'lodash-compat/collection/map';
import ltrim from 'underscore.string/ltrim';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// ERROR MESSAGES
////////////////////////////////////////////////////////////////////////////////

export const getCastErrorMessages = function (castErrors) {
  if (castErrors == null || castErrors.length === 0)
    return [ 'Ошибка преобразования к типу' ];

  return map(castErrors, (error) => {
    const path = ltrim(error.field, '.');
    const message = error.message;
    if (message)
      return `Ошибка преобразования к типу поля ${path} (${message})`;
    return `Ошибка преобразования к типу поля ${path}`;
  });
};

export const getValidationErrorMessages = function (validationErrors) {
  if (validationErrors == null || validationErrors.length === 0)
    return [ 'Ошибка валидации' ];

  return map(validationErrors, (error) => {
    const path = ltrim(error.field, '.');
    const message = error.message;
    if (message)
      return `Ошибка валидации поля ${path} (${message})`;
    return `Ошибка валидации поля ${path}`;
  });
};

////////////////////////////////////////////////////////////////////////////////
// ERROR DESCRIPTIONS
////////////////////////////////////////////////////////////////////////////////
// Тут вовращается описание ошибок более человеческим языком
// (имена полей вместо путей).

export const getValidationErrorDescriptions = function (validationErrors) {
  if (validationErrors == null || validationErrors.length === 0)
    return [ 'Ошибка' ];

  return map(validationErrors, (error) => {
    const name = error.name || ltrim(error.field, '.');
    const message = error.message;
    if (message)
      return `Поле "${name}": ${message.toLowerCase()}`;
    return `Ошибка в значении поля "${name}"`;
  });
};

export const getCastErrorDescriptions = function (castErrors) {
  return getValidationErrorDescriptions(castErrors);
};