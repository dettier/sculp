////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getSubScheme = getSubScheme;
exports.getRunValidationsForSubfields = getRunValidationsForSubfields;
exports.getParentPath = getParentPath;
exports.getRunValidationsForPath = getRunValidationsForPath;
exports.isSubfield = isSubfield;
exports.isSubfieldOrEqual = isSubfieldOrEqual;
exports.extendFieldStateWithError = extendFieldStateWithError;
exports.deleteFieldFromCache = deleteFieldFromCache;
exports.deleteFieldFromErrors = deleteFieldFromErrors;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _underscoreStringStartsWith = require('underscore.string/startsWith');

var _underscoreStringStartsWith2 = _interopRequireDefault(_underscoreStringStartsWith);

var _lodashCompatLangIsEmpty = require('lodash-compat/lang/isEmpty');

var _lodashCompatLangIsEmpty2 = _interopRequireDefault(_lodashCompatLangIsEmpty);

var _lodashCompatLangIsString = require('lodash-compat/lang/isString');

var _lodashCompatLangIsString2 = _interopRequireDefault(_lodashCompatLangIsString);

var _lodashCompatLangIsDate = require('lodash-compat/lang/isDate');

var _lodashCompatLangIsDate2 = _interopRequireDefault(_lodashCompatLangIsDate);

var _lodashCompatLangIsObject = require('lodash-compat/lang/isObject');

var _lodashCompatLangIsObject2 = _interopRequireDefault(_lodashCompatLangIsObject);

var _lodashCompatLangIsArray = require('lodash-compat/lang/isArray');

var _lodashCompatLangIsArray2 = _interopRequireDefault(_lodashCompatLangIsArray);

var _lodashCompatFunctionMemoize = require('lodash-compat/function/memoize');

var _lodashCompatFunctionMemoize2 = _interopRequireDefault(_lodashCompatFunctionMemoize);

var _lodashCompatCollectionFilter = require('lodash-compat/collection/filter');

var _lodashCompatCollectionFilter2 = _interopRequireDefault(_lodashCompatCollectionFilter);

var _lodashCompatObjectKeys = require('lodash-compat/object/keys');

var _lodashCompatObjectKeys2 = _interopRequireDefault(_lodashCompatObjectKeys);

var _enums = require('./enums');

var _objectHelper = require('./object/helper');

var _utilsPath = require('./utils/path');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// getSubScheme
////////////////////////////////////////////////////////////////////////////////

function getSubScheme(scheme) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  path = (0, _utilsPath.normalizeMemoized)(path);

  path = path.replace(/\.(.)/g, '.properties.$1');
  path = path.replace(/\[\w*\]/g, '.items');

  return (0, _objectHelper.getValue)(scheme, path);
}

////////////////////////////////////////////////////////////////////////////////
// getRunValidationsForSubfields
////////////////////////////////////////////////////////////////////////////////

function getRunValidationsForSubfields(scheme, value) {
  if (scheme.type === _enums.Type.GROUP) return true;
  return value != null;
}

////////////////////////////////////////////////////////////////////////////////
// parent paths
////////////////////////////////////////////////////////////////////////////////

var getParentPaths = _utilsPath.getParentPaths;
exports.getParentPaths = getParentPaths;
var getParentPathsMemoized = (0, _lodashCompatFunctionMemoize2['default'])(_utilsPath.getParentPaths);

exports.getParentPathsMemoized = getParentPathsMemoized;
////////////////////////////////////////////////////////////////////////////////
// getParentPath
////////////////////////////////////////////////////////////////////////////////

function getParentPath(path) {
  if (path === '') return undefined;

  var parentPaths = getParentPathsMemoized(path);
  return parentPaths[parentPaths.length - 2];
}

var getParentPathMemoized = (0, _lodashCompatFunctionMemoize2['default'])(getParentPath);

exports.getParentPathMemoized = getParentPathMemoized;
////////////////////////////////////////////////////////////////////////////////
// getRunValidationsForPath
////////////////////////////////////////////////////////////////////////////////

function getRunValidationsForPath(rootScheme, rootValue, path) {
  if (path === '') return true;

  var parentPaths = getParentPathsMemoized(path);
  var parentPath = parentPaths[parentPaths.length - 2];

  if (parentPath == null) return true;

  var parentScheme = getSubScheme(rootScheme, parentPath);

  var parentValue = (0, _objectHelper.getAndEvaluateValue)(rootValue, parentPath);
  return getRunValidationsForSubfields(parentScheme, parentValue);
}

////////////////////////////////////////////////////////////////////////////////
// isSubfield
////////////////////////////////////////////////////////////////////////////////

function isSubfield(subfieldPath, fieldPath) {
  var pathLength = fieldPath.length;

  if ((0, _underscoreStringStartsWith2['default'])(subfieldPath, fieldPath)) {
    if (subfieldPath[pathLength] === '.' || subfieldPath[pathLength] === '[') return true;
  }

  return false;
}

var isSubfieldMemoized = (0, _lodashCompatFunctionMemoize2['default'])(isSubfield, function (a, b) {
  return a + '|' + b;
});

exports.isSubfieldMemoized = isSubfieldMemoized;
////////////////////////////////////////////////////////////////////////////////
// isSubfieldOrEqual
////////////////////////////////////////////////////////////////////////////////

function isSubfieldOrEqual(subfieldPath, fieldPath) {
  return isSubfield(subfieldPath, fieldPath) || subfieldPath === fieldPath;
}

var isSubfieldOrEqualMemoized = (0, _lodashCompatFunctionMemoize2['default'])(isSubfieldOrEqual, function (a, b) {
  return a + '|' + b;
});

exports.isSubfieldOrEqualMemoized = isSubfieldOrEqualMemoized;
////////////////////////////////////////////////////////////////////////////////
// extendFieldStateWithError
////////////////////////////////////////////////////////////////////////////////

function extendFieldStateWithError(fieldState, errorObject) {
  if (fieldState.errors == null) fieldState.errors = [];
  fieldState.errors.push(errorObject.message);
}

////////////////////////////////////////////////////////////////////////////////
// deleteFieldFromCache
////////////////////////////////////////////////////////////////////////////////

function deleteFieldFromCache(CACHE, path) {
  Object.keys(CACHE).forEach(function (key) {
    if (isSubfieldOrEqual(key, path)) delete CACHE[key];
  });
}

////////////////////////////////////////////////////////////////////////////////
// deleteFieldFromErrors
////////////////////////////////////////////////////////////////////////////////

function deleteFieldFromErrors(errors, path) {
  var newErrors = (0, _lodashCompatCollectionFilter2['default'])(errors, function (e) {
    return isSubfieldOrEqual(e.field, path) === false;
  });

  if (newErrors.length !== errors.length) errors.splice.apply(errors, [0, errors.length].concat(_toConsumableArray(newErrors)));
}

////////////////////////////////////////////////////////////////////////////////
// isValueEmpty
////////////////////////////////////////////////////////////////////////////////

var isValueEmpty = function isValueEmpty(value) {
  if (value == null) return true;

  if ((0, _lodashCompatLangIsArray2['default'])(value) || (0, _lodashCompatLangIsString2['default'])(value) || (0, _lodashCompatLangIsObject2['default'])(value) && !(0, _lodashCompatLangIsDate2['default'])(value)) return (0, _lodashCompatLangIsEmpty2['default'])(value);

  return false;
};

exports.isValueEmpty = isValueEmpty;
////////////////////////////////////////////////////////////////////////////////
// getRemoveEmptyValue
////////////////////////////////////////////////////////////////////////////////

var getRemoveEmptyValue = function getRemoveEmptyValue(fieldScheme, context) {
  return fieldScheme.removeEmpty || context.removeEmpty || false;
};

exports.getRemoveEmptyValue = getRemoveEmptyValue;
////////////////////////////////////////////////////////////////////////////////
// getInitial
////////////////////////////////////////////////////////////////////////////////

var getInitial = function getInitial(scheme) {

  if (scheme.hasOwnProperty('initial')) return scheme.initial;

  var result = undefined;

  if (scheme.type === _enums.Type.OBJECT || scheme.type === _enums.Type.GROUP) {

    result = {};
    var properties = scheme.properties || {};

    var propKeys = (0, _lodashCompatObjectKeys2['default'])(properties);
    for (var i = 0; i < propKeys.length; i++) {
      var k = propKeys[i];
      var v = properties[k];
      var subinitial = getInitial(v);
      if (subinitial != null) result[k] = subinitial;
    }
    if ((0, _lodashCompatLangIsEmpty2['default'])(result)) result = undefined;
  }

  return result;
};
exports.getInitial = getInitial;