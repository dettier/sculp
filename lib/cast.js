////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getWithPrecision = getWithPrecision;
exports.castPrimitive = castPrimitive;
exports.castObject = castObject;
exports.castArray = castArray;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatLangIsNumber = require('lodash-compat/lang/isNumber');

var _lodashCompatLangIsNumber2 = _interopRequireDefault(_lodashCompatLangIsNumber);

var _lodashCompatLangIsObject = require('lodash-compat/lang/isObject');

var _lodashCompatLangIsObject2 = _interopRequireDefault(_lodashCompatLangIsObject);

var _lodashCompatLangIsArray = require('lodash-compat/lang/isArray');

var _lodashCompatLangIsArray2 = _interopRequireDefault(_lodashCompatLangIsArray);

var _lodashCompatLangIsFunction = require('lodash-compat/lang/isFunction');

var _lodashCompatLangIsFunction2 = _interopRequireDefault(_lodashCompatLangIsFunction);

var _lodashCompatObjectKeys = require('lodash-compat/object/keys');

var _lodashCompatObjectKeys2 = _interopRequireDefault(_lodashCompatObjectKeys);

var _i18nLang = require('./i18n/lang');

var _enums = require('./enums');

var _helper = require('./helper');

var _rules = require('./rules');

var _validate = require('./validate');

var debug = require('debug')('sculp');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

function getWithPrecision(n, precision) {
  if (precision != null && precision >= 0) {
    var roundingMultiplier = Math.pow(10, precision);
    n = Math.floor(n * roundingMultiplier) / roundingMultiplier;
    if (isNaN(n)) {
      n = undefined;
    }
  }
  return n;
}

////////////////////////////////////////////////////////////////////////////////
// castPrimitive
////////////////////////////////////////////////////////////////////////////////

function castPrimitive(value, scheme, path, context) {
  var casted = undefined;

  var type = scheme.type;

  if (type == null) {
    if (scheme.hasOwnProperty('type')) {
      // protection from misspellings: { type : Type.NUMBOR }
      throw new Error((0, _i18nLang.getMessage)('UNKNOWN_TYPE', { type: type }, true));
    } else return value;
  }

  var cast = context.strict ? context.castsStrict[type] : context.casts[type];

  if ((0, _lodashCompatLangIsFunction2['default'])(cast)) casted = cast(value);else throw new Error((0, _i18nLang.getMessage)('UNKNOWN_TYPE', { type: type }, true));

  if (casted === _enums.CAST_ERROR) {

    debug('cast error for path %s', path);

    // change from CAST_ERROR to undefined
    casted = undefined;

    // increase error count
    var fieldState = context.FIELD_STATE_CACHE[path];
    fieldState.castError = true;
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    var errorObject = {
      field: path,
      message: (0, _i18nLang.getMessage)('CAST_ERROR', { type: scheme.type }),
      name: (0, _rules.getRuleValue)(scheme.name, undefined, path, context),
      value: value
    };

    if (context.extendFieldStatesWithErrors === true) (0, _helper.extendFieldStateWithError)(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);
  } else {

    if ((0, _lodashCompatLangIsNumber2['default'])(casted) && (0, _lodashCompatLangIsNumber2['default'])(scheme.precision)) {
      casted = getWithPrecision(casted, scheme.precision);
    }
  }

  return casted;
}

////////////////////////////////////////////////////////////////////////////////
// castObject
////////////////////////////////////////////////////////////////////////////////

function castObject(value, scheme, path, context) {

  var fieldState = context.FIELD_STATE_CACHE[path];

  if (value != null && (0, _lodashCompatLangIsObject2['default'])(value) === false) {
    // increase error count
    fieldState.castError = true;
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    var errorObject = {
      field: path,
      message: (0, _i18nLang.getMessage)('CAST_ERROR', { type: scheme.type }),
      name: (0, _rules.getRuleValue)(scheme.name, undefined, path, context),
      value: value
    };

    if (context.extendFieldStatesWithErrors === true) (0, _helper.extendFieldStateWithError)(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);

    return undefined;
  }

  var runValidations = context.runValidations;
  var calculateTransformsAndComputes = context.calculateTransformsAndComputes;

  if (runValidations === undefined) runValidations = true;
  if (calculateTransformsAndComputes === undefined) calculateTransformsAndComputes = true;

  var res = {};
  if (scheme.removeExtra === false) res = _extends({}, value);else res = {};

  //let k;
  var fieldsCount = 0;
  var properties = scheme.properties || {};
  var propertiesKeys = (0, _lodashCompatObjectKeys2['default'])(properties);

  for (var i = 0; i < propertiesKeys.length; i++) {
    var k = propertiesKeys[i];
    var fieldValue = value && value[k];
    var fieldScheme = properties[k];
    var fieldPath = path + '.' + k;

    var fieldRunValidations = runValidations && (0, _helper.getRunValidationsForSubfields)(scheme, value);

    var fieldCalculateComputes = calculateTransformsAndComputes === false ? false : scheme.type === _enums.Type.GROUP || value != null;

    var fieldRes = (0, _validate.validateField)(fieldValue, fieldScheme, fieldPath, _extends({}, context, {
      runValidations: fieldRunValidations,
      calculateTransformsAndComputes: fieldCalculateComputes
    }));

    // sum error counts
    fieldState.errorsCountWithSubfields += context.FIELD_STATE_CACHE[fieldPath].errorsCountWithSubfields;

    if (fieldRes != null) {
      res[k] = fieldRes;
      fieldsCount++;
    }
  }

  // if original value was not defined, return undefined
  if (value == null && scheme.type !== _enums.Type.GROUP) res = undefined;

  if (fieldsCount === 0 && (0, _helper.getRemoveEmptyValue)(scheme, context)) res = undefined;

  return res;
}

////////////////////////////////////////////////////////////////////////////////
// castArray
////////////////////////////////////////////////////////////////////////////////

function castArray(value, scheme, path, context) {

  var fieldState = context.FIELD_STATE_CACHE[path];

  if (value != null && (0, _lodashCompatLangIsArray2['default'])(value) === false) {
    // increase error count
    fieldState.castError = true;
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    var errorObject = {
      field: path,
      message: (0, _i18nLang.getMessage)('CAST_ERROR', { type: scheme.type }),
      name: (0, _rules.getRuleValue)(scheme.name, undefined, path, context),
      value: value
    };

    if (context.extendFieldStatesWithErrors === true) (0, _helper.extendFieldStateWithError)(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);

    return undefined;
  }

  var res = [];

  var preserveEmptyArrayItems = context.preserveEmptyArrayItems;

  if (preserveEmptyArrayItems === undefined) preserveEmptyArrayItems = false;

  var itemScheme = scheme.items;

  // чтобы добавить path.items в fieldState
  (0, _validate.validateField)(undefined, itemScheme, path + '.items', _extends({}, context, {
    runValidations: false,
    calculateTransformsAndComputes: false
  }));

  // if original value was not defined, return undefined
  if (value == null) {
    res = value;
  } else {
    var skip = 0;
    for (var i = 0; i < value.length; i++) {
      var itemPath = path + '[' + (i - skip) + ']';
      var itemRes = (0, _validate.validateField)(value[i], itemScheme, itemPath, context);

      // is there an error validating this item?
      var itemFieldState = context.FIELD_STATE_CACHE[itemPath];
      var fieldHasErrors = itemFieldState.errorsCountWithSubfields > 0;

      // empty values are removed from array if they don't have
      // errors or preserveEmptyArrayItems option is true
      if (itemRes == null && fieldHasErrors === false && preserveEmptyArrayItems === false) {
        (0, _helper.deleteFieldFromCache)(context.CACHE, itemPath);
        (0, _helper.deleteFieldFromCache)(context.FIELD_STATE_CACHE, itemPath);
        (0, _helper.deleteFieldFromErrors)(context.ERRORS_CACHE, itemPath);
        skip++;
      } else {
        res.push(itemRes);

        // sum error counts
        fieldState.errorsCountWithSubfields += itemFieldState.errorsCountWithSubfields;
      }
    }
  }

  if (res && res.length === 0 && (0, _helper.getRemoveEmptyValue)(scheme, context)) res = undefined;

  // extending with itemFieldState and itemsFieldStates
  if (context.extendArrayStatesWithItemStates) {
    (function () {
      var FIELD_STATE_CACHE = context.FIELD_STATE_CACHE;
      fieldState.itemFieldState = FIELD_STATE_CACHE[path + '.items'];
      if (res != null) {
        fieldState.itemsFieldStates = res.map(function (v, idx) {
          return FIELD_STATE_CACHE[path + '[' + idx + ']'];
        });
      } else {
        fieldState.itemsFieldStates = [];
      }
    })();
  }

  return res;
}