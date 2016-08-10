////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getRuleValue = getRuleValue;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatLangIsObject = require('lodash-compat/lang/isObject');

var _lodashCompatLangIsObject2 = _interopRequireDefault(_lodashCompatLangIsObject);

var _lodashCompatLangIsFunction = require('lodash-compat/lang/isFunction');

var _lodashCompatLangIsFunction2 = _interopRequireDefault(_lodashCompatLangIsFunction);

var _fieldAccessor = require('./field-accessor');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// getRuleValue
////////////////////////////////////////////////////////////////////////////////

function getRuleValue(_x, _x2, _x3, _x4) {
  var _again = true;

  _function: while (_again) {
    var ruleValue = _x,
        res = _x2,
        path = _x3,
        context = _x4;
    _again = false;

    if ((0, _lodashCompatLangIsFunction2['default'])(ruleValue)) {
      var fa = (0, _fieldAccessor.getFieldAccessor)(res, path, context);
      ruleValue = ruleValue(fa);
      _x = ruleValue;
      _x2 = res;
      _x3 = path;
      _x4 = context;
      _again = true;
      fa = undefined;
      continue _function;
    } else if ((0, _lodashCompatLangIsObject2['default'])(ruleValue) && ruleValue.value != null) {
      _x = ruleValue.value;
      _x2 = res;
      _x3 = path;
      _x4 = context;
      _again = true;
      fa = undefined;
      continue _function;
    }
    return ruleValue;
  }
}

////////////////////////////////////////////////////////////////////////////////
// getRuleErrorMessage
////////////////////////////////////////////////////////////////////////////////

var getRuleErrorMessage = function getRuleErrorMessage(_x5, _x6, _x7, _x8) {
  var _again2 = true;

  _function2: while (_again2) {
    var ruleValue = _x5,
        res = _x6,
        path = _x7,
        context = _x8;
    _again2 = false;

    if ((0, _lodashCompatLangIsFunction2['default'])(ruleValue)) {
      var fa = (0, _fieldAccessor.getFieldAccessor)(res, path, context);
      ruleValue = ruleValue(fa);
      _x5 = ruleValue;
      _x6 = res;
      _x7 = path;
      _x8 = context;
      _again2 = true;
      fa = undefined;
      continue _function2;
    } else if ((0, _lodashCompatLangIsObject2['default'])(ruleValue) && ruleValue.message != null) {
      return ruleValue.message;
    }
    return undefined;
  }
};
exports.getRuleErrorMessage = getRuleErrorMessage;