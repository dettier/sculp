////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatLangIsEqual = require('lodash-compat/lang/isEqual');

var _lodashCompatLangIsEqual2 = _interopRequireDefault(_lodashCompatLangIsEqual);

var _lodashCompatObjectOmit = require('lodash-compat/object/omit');

var _lodashCompatObjectOmit2 = _interopRequireDefault(_lodashCompatObjectOmit);

var _objectHelper = require('./object/helper');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

/**
 * Функция из объекта с новыми значениями полей уберает все
 * значения, которые равны текущим значениям. Возвращает новый объект.
 * @param {Object} value текущей объект
 * @param {Object} fieldChanges новые значения полей
 */
function getNecessaryChanges(value, fieldChanges) {
  return (0, _lodashCompatObjectOmit2['default'])(fieldChanges, function (newValue, key) {
    return (0, _lodashCompatLangIsEqual2['default'])(newValue, (0, _objectHelper.getValue)(value, key));
  });
}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

exports['default'] = getNecessaryChanges;
module.exports = exports['default'];