////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.tryValidate = tryValidate;
exports.validate = validate;
exports.getSchemeValue = getSchemeValue;
exports.getFieldName = getFieldName;
exports.getFieldPresence = getFieldPresence;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatLangIsObject = require('lodash-compat/lang/isObject');

var _lodashCompatLangIsObject2 = _interopRequireDefault(_lodashCompatLangIsObject);

var _options = require('./options');

var _helper = require('./helper');

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

var _enums = require('./enums');

var _sculp = require('./sculp');

var _sculp2 = _interopRequireDefault(_sculp);

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// tryValidate static
////////////////////////////////////////////////////////////////////////////////

function tryValidate(value, scheme) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  // eslint-disable-next-line prefer-rest-params
  if (arguments.length >= 4 || arguments.length < 2) throw new Error('Validate function expects 2 or 3 arguments');
  if (options != null && (0, _lodashCompatLangIsObject2['default'])(options) === false) throw new Error('Options argument should be an object');

  var sculp = new _sculp2['default'](value, scheme, _extends({}, options, {
    disableDependencyTracking: true
  }));
  return sculp.tryValidate();
}

////////////////////////////////////////////////////////////////////////////////
// validate static
////////////////////////////////////////////////////////////////////////////////

function validate(value, scheme) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  // eslint-disable-next-line prefer-rest-params
  if (arguments.length >= 4 || arguments.length < 2) throw new Error('Validate function expects 2 or 3 arguments');
  if (options != null && (0, _lodashCompatLangIsObject2['default'])(options) === false) throw new Error('Options argument should be an object');

  var sculp = new _sculp2['default'](value, scheme, _extends({}, options, {
    disableDependencyTracking: true
  }));
  return sculp.validate();
}

////////////////////////////////////////////////////////////////////////////////
// getSchemeValue static
////////////////////////////////////////////////////////////////////////////////

function getSchemeValue(scheme, value, path, rule) {
  var sculp = new _sculp2['default'](value, scheme, { disableDependencyTracking: true });
  return sculp.getSchemeValue(path, rule);
}

////////////////////////////////////////////////////////////////////////////////
// getFieldName static
////////////////////////////////////////////////////////////////////////////////

function getFieldName(scheme, value, path) {
  var sculp = new _sculp2['default'](value, scheme, { disableDependencyTracking: true });
  return sculp.getFieldName(path);
}

////////////////////////////////////////////////////////////////////////////////
// getFieldPresence static
////////////////////////////////////////////////////////////////////////////////

function getFieldPresence(scheme, value, path) {
  var sculp = new _sculp2['default'](value, scheme, { disableDependencyTracking: true });
  return sculp.getFieldPresence(path);
}

////////////////////////////////////////////////////////////////////////////////
// setDefaultOptions static
////////////////////////////////////////////////////////////////////////////////

exports.setDefaultOptions = _options.setDefaultOptions;

////////////////////////////////////////////////////////////////////////////////
// getInitial static
////////////////////////////////////////////////////////////////////////////////

exports.getInitial = _helper.getInitial;
exports.getSubScheme = _helper.getSubScheme;

////////////////////////////////////////////////////////////////////////////////
// Error and enums
////////////////////////////////////////////////////////////////////////////////

exports.ValidationError = _error2['default'];
exports.Type = _enums.Type;
exports.Presence = _enums.Presence;

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

exports.Sculp = _sculp2['default'];