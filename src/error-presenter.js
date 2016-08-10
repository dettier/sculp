////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { getMessage } from './i18n/lang';

import map from 'lodash-compat/collection/map';
import ltrim from 'underscore.string/ltrim';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// ERROR MESSAGES
////////////////////////////////////////////////////////////////////////////////

export const getValidationErrorMessages = function (validationErrors) {
  if (validationErrors == null || validationErrors.length === 0)
    return [ getMessage('VALIDATION_ERROR', {}, true) ];

  return map(validationErrors, (error) => {
    const path = ltrim(error.field, '.');
    const message = error.message;
    if (path) {
      if (message)
        return getMessage('FIELD_VALIDATION_ERROR_WITH_MESSAGE', { path, message }, true);
      return getMessage('FIELD_VALIDATION_ERROR', { path }, true);
    } else {
      if (message)
        return getMessage('VALIDATION_ERROR_WITH_MESSAGE', { message }, true);
      return getMessage('VALIDATION_ERROR', {}, true);
    }
  });
};
