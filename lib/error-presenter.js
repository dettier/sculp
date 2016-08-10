////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i18nLang = require('./i18n/lang');

var _lodashCompatCollectionMap = require('lodash-compat/collection/map');

var _lodashCompatCollectionMap2 = _interopRequireDefault(_lodashCompatCollectionMap);

var _underscoreStringLtrim = require('underscore.string/ltrim');

var _underscoreStringLtrim2 = _interopRequireDefault(_underscoreStringLtrim);

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// ERROR MESSAGES
////////////////////////////////////////////////////////////////////////////////

var getValidationErrorMessages = function getValidationErrorMessages(validationErrors) {
  if (validationErrors == null || validationErrors.length === 0) return [(0, _i18nLang.getMessage)('VALIDATION_ERROR', {}, true)];

  return (0, _lodashCompatCollectionMap2['default'])(validationErrors, function (error) {
    var path = (0, _underscoreStringLtrim2['default'])(error.field, '.');
    var message = error.message;
    if (path) {
      if (message) return (0, _i18nLang.getMessage)('FIELD_VALIDATION_ERROR_WITH_MESSAGE', { path: path, message: message }, true);
      return (0, _i18nLang.getMessage)('FIELD_VALIDATION_ERROR', { path: path }, true);
    } else {
      if (message) return (0, _i18nLang.getMessage)('VALIDATION_ERROR_WITH_MESSAGE', { message: message }, true);
      return (0, _i18nLang.getMessage)('VALIDATION_ERROR', {}, true);
    }
  });
};
exports.getValidationErrorMessages = getValidationErrorMessages;