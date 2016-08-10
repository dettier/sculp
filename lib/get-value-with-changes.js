////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatObjectKeys = require('lodash-compat/object/keys');

var _lodashCompatObjectKeys2 = _interopRequireDefault(_lodashCompatObjectKeys);

var _lodashCompatLangCloneDeep = require('lodash-compat/lang/cloneDeep');

var _lodashCompatLangCloneDeep2 = _interopRequireDefault(_lodashCompatLangCloneDeep);

var _objectHelper = require('./object/helper');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

/**
 * Функция возвращает новый объект с примененными изменениями fieldChanges.
 * @param {Object} value текущей объект
 * @param {Object} fieldChanges новые значения полей
 */
function getValueWithChanges(value, fieldChanges) {
  var newValue = (0, _lodashCompatLangCloneDeep2['default'])(value);

  var fieldKeys = (0, _lodashCompatObjectKeys2['default'])(fieldChanges);
  for (var i = 0; i < fieldKeys.length; i++) {
    var key = fieldKeys[i];
    newValue = (0, _objectHelper.setValue)(newValue, key, fieldChanges[key]);
  }

  return newValue;
}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

exports['default'] = getValueWithChanges;
module.exports = exports['default'];