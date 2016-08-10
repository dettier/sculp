////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CASTS;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _lodashCompatLangIsNumber = require('lodash-compat/lang/isNumber');

var _lodashCompatLangIsNumber2 = _interopRequireDefault(_lodashCompatLangIsNumber);

var _lodashCompatLangIsBoolean = require('lodash-compat/lang/isBoolean');

var _lodashCompatLangIsBoolean2 = _interopRequireDefault(_lodashCompatLangIsBoolean);

var _lodashCompatLangIsDate = require('lodash-compat/lang/isDate');

var _lodashCompatLangIsDate2 = _interopRequireDefault(_lodashCompatLangIsDate);

var _lodashCompatLangIsFunction = require('lodash-compat/lang/isFunction');

var _lodashCompatLangIsFunction2 = _interopRequireDefault(_lodashCompatLangIsFunction);

var _lodashCompatLangIsString = require('lodash-compat/lang/isString');

var _lodashCompatLangIsString2 = _interopRequireDefault(_lodashCompatLangIsString);

var _lodashCompatLangIsObject = require('lodash-compat/lang/isObject');

var _lodashCompatLangIsObject2 = _interopRequireDefault(_lodashCompatLangIsObject);

var _lodashCompatLangIsArray = require('lodash-compat/lang/isArray');

var _lodashCompatLangIsArray2 = _interopRequireDefault(_lodashCompatLangIsArray);

var _enums = require('./enums');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// CASTS
////////////////////////////////////////////////////////////////////////////////

var CASTS = (_CASTS = {}, _defineProperty(_CASTS, _enums.Type.STRING, function (v) {
  if ((0, _lodashCompatLangIsString2['default'])(v) || (0, _lodashCompatLangIsNumber2['default'])(v) || (0, _lodashCompatLangIsBoolean2['default'])(v) || (0, _lodashCompatLangIsDate2['default'])()) return v.toString();

  return _enums.CAST_ERROR;
}), _defineProperty(_CASTS, _enums.Type.STRING_NET, function (v) {
  var res = CASTS[_enums.Type.STRING](v);

  if (res === _enums.CAST_ERROR) return res;

  if ((0, _lodashCompatLangIsString2['default'])(res)) {
    res = res.trim();
    if (res === '') res = undefined;
  }
  return res;
}), _defineProperty(_CASTS, _enums.Type.NUMBER, function (v) {
  if ((0, _lodashCompatLangIsNumber2['default'])(v)) {
    if (isNaN(v)) return _enums.CAST_ERROR;
    return v;
  }
  if ((0, _lodashCompatLangIsString2['default'])(v)) return CASTS[_enums.Type.NUMBER](+v);

  return _enums.CAST_ERROR;
}), _defineProperty(_CASTS, _enums.Type.DATE, function (v) {
  if ((0, _lodashCompatLangIsDate2['default'])(v)) return new Date(v.getTime());

  if ((0, _lodashCompatLangIsString2['default'])(v)) {
    var n = +v;
    if (isNaN(n) === false) v = n;else v = Date.parse(v);
  }

  if ((0, _lodashCompatLangIsNumber2['default'])(v) && isNaN(v) === false) {
    return new Date(v);
  }

  return _enums.CAST_ERROR;
}), _defineProperty(_CASTS, _enums.Type.FUNCTION, function (v) {
  if ((0, _lodashCompatLangIsFunction2['default'])(v)) return v;

  return _enums.CAST_ERROR;
}), _defineProperty(_CASTS, _enums.Type.BOOLEAN, function (v) {
  if ((0, _lodashCompatLangIsBoolean2['default'])(v)) return v;

  var isValueString = (0, _lodashCompatLangIsString2['default'])(v);
  if (isValueString || (0, _lodashCompatLangIsNumber2['default'])(v)) {
    if (isValueString) v = v.trim().toLowerCase();

    if (v === 'true' || v === 't' || v === '1' || v === 1) return true;

    if (v === 'false' || v === 'f' || v === '0' || v === '' || v === 0) return false;
  }

  return _enums.CAST_ERROR;
}), _defineProperty(_CASTS, _enums.Type.ANY_VALUE, function (v) {
  return v;
}), _defineProperty(_CASTS, _enums.Type.ANY_OBJECT, function (v) {
  if ((0, _lodashCompatLangIsObject2['default'])(v) && !(0, _lodashCompatLangIsArray2['default'])(v)) return v;
  return _enums.CAST_ERROR;
}), _CASTS);

exports['default'] = CASTS;
module.exports = exports['default'];

//////////////////////////////////////////////////////////////////////////////
// STRING
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// STRING NOT EMPTY TRIMMED
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// NUMBER
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// DATE
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// FUNCTION
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// BOOLEAN
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// ANY_VALUE
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// ANY_OBJECT
//////////////////////////////////////////////////////////////////////////////