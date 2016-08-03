////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import format from './i18n/format';
import { messages } from './i18n/lang';

import map from 'lodash-compat/collection/map';
import ltrim from 'underscore.string/ltrim';
import capitalize from 'underscore.string/capitalize';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const formatAndCapitalize = (...args) => capitalize(format(...args));

////////////////////////////////////////////////////////////////////////////////
// ERROR MESSAGES
////////////////////////////////////////////////////////////////////////////////

export const getValidationErrorMessages = function (validationErrors) {
  if (validationErrors == null || validationErrors.length === 0)
    return [ formatAndCapitalize(messages.VALIDATION_ERROR) ];

  return map(validationErrors, (error) => {
    const path = ltrim(error.field, '.');
    const message = error.message;
    if (path) {
      if (message)
        return formatAndCapitalize(messages.FIELD_VALIDATION_ERROR_WITH_MESSAGE, { path, message });
      return formatAndCapitalize(messages.FIELD_VALIDATION_ERROR, { path });
    } else {
      if (message)
        return formatAndCapitalize(messages.VALIDATION_ERROR_WITH_MESSAGE, { message });
      return formatAndCapitalize(messages.VALIDATION_ERROR);
    }
  });
};
