////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatLangIsString = require('lodash-compat/lang/isString');

var _lodashCompatLangIsString2 = _interopRequireDefault(_lodashCompatLangIsString);

var _lodashCompatLangIsArray = require('lodash-compat/lang/isArray');

var _lodashCompatLangIsArray2 = _interopRequireDefault(_lodashCompatLangIsArray);

var _lodashCompatLangIsFunction = require('lodash-compat/lang/isFunction');

var _lodashCompatLangIsFunction2 = _interopRequireDefault(_lodashCompatLangIsFunction);

var _lodashCompatObjectKeys = require('lodash-compat/object/keys');

var _lodashCompatObjectKeys2 = _interopRequireDefault(_lodashCompatObjectKeys);

var _casts = require('./casts');

var _casts2 = _interopRequireDefault(_casts);

var _castsStrict = require('./casts-strict');

var _castsStrict2 = _interopRequireDefault(_castsStrict);

var _validations = require('./validations');

var _validations2 = _interopRequireDefault(_validations);

var _cast = require('./cast');

var _rules = require('./rules');

var _fieldAccessor = require('./field-accessor');

var _enums = require('./enums');

var _objectHelper = require('./object/helper');

var _i18nLang = require('./i18n/lang');

var _helper = require('./helper');

var debug = require('debug')('sculp:validate');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// validation constants
////////////////////////////////////////////////////////////////////////////////

var VALIDATIONS_PROPERTY_NAME_PREFIX = '$';

var CUSTOM_RULE_NAME = VALIDATIONS_PROPERTY_NAME_PREFIX + 'custom';
exports.CUSTOM_RULE_NAME = CUSTOM_RULE_NAME;
var PRESENCE_RULE_NAME = VALIDATIONS_PROPERTY_NAME_PREFIX + 'presence';
exports.PRESENCE_RULE_NAME = PRESENCE_RULE_NAME;
var VALUES_RULE_NAME = VALIDATIONS_PROPERTY_NAME_PREFIX + 'values';

exports.VALUES_RULE_NAME = VALUES_RULE_NAME;
////////////////////////////////////////////////////////////////////////////////
// calculateAndValidateRule
////////////////////////////////////////////////////////////////////////////////

function calculateAndValidateRule(scheme, ruleName, res, path, onlyCalculate, context) {

  var nameWithoutPrefix = undefined;
  var validation = undefined;
  var ruleValue = undefined;

  if (ruleName === CUSTOM_RULE_NAME) {
    var customRuleFunction = scheme[CUSTOM_RULE_NAME];
    validation = customRuleFunction && customRuleFunction.value || customRuleFunction;
    ruleValue = undefined;
  } else {
    nameWithoutPrefix = ruleName.slice(VALIDATIONS_PROPERTY_NAME_PREFIX.length);
    validation = context.validations[nameWithoutPrefix];

    ruleValue = (0, _rules.getRuleValue)(scheme[ruleName], res, path, context);

    // for Presence rule there are some checks
    if (ruleName === PRESENCE_RULE_NAME) {

      // for undefined array items presence is ABSENT
      if (path[path.length - 1] === ']' && res == null) ruleValue = _enums.Presence.ABSENT;

      // default rule value for presence is OPTIONAL
      if (ruleValue == null) ruleValue = _enums.Presence.OPTIONAL;

      // we don't want errors about value being present while
      // it should be absent, we just remove the value
      if (ruleValue === _enums.Presence.ABSENT) res = undefined;
    }

    context.FIELD_STATE_CACHE[path][ruleName] = ruleValue;

    if (ruleValue == null) return res;
  }

  if (onlyCalculate) return res;

  if ((0, _lodashCompatLangIsFunction2['default'])(validation) === false) {
    if (typeof console !== 'undefined') {
      throw new Error((0, _i18nLang.getMessage)('UNKNOWN_VALIDATION', { name: nameWithoutPrefix }, true));
    }
    return res;
  }

  var fa = (0, _fieldAccessor.getFieldAccessor)(res, path, context);

  debug('rule %s value for path "%s" is %j', ruleName, path, ruleValue);
  var result = validation(fa, ruleValue);
  debug('rule %s for path "%s" result %j', ruleName, path, result);

  // this means error
  if ((0, _lodashCompatLangIsString2['default'])(result)) {

    var message = undefined;
    if (ruleName !== CUSTOM_RULE_NAME) message = (0, _rules.getRuleErrorMessage)(scheme[ruleName], res, path, context);

    message = message || result;

    // increase error count
    var fieldState = context.FIELD_STATE_CACHE[path];
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    var errorObject = {
      rule: ruleName,
      message: message,
      field: path,
      name: (0, _rules.getRuleValue)(scheme.name, res, path, context),
      value: res
    };

    if (context.extendFieldStatesWithErrors === true) (0, _helper.extendFieldStateWithError)(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);
  }

  return res;
}

////////////////////////////////////////////////////////////////////////////////
// hasValidValue
////////////////////////////////////////////////////////////////////////////////

function hasValidValue(scheme, path, context) {
  if (scheme.hasOwnProperty('validWhenOptional') && context.FIELD_STATE_CACHE[path][PRESENCE_RULE_NAME] !== _enums.Presence.REQUIRED) return true;else if (scheme.hasOwnProperty('valid')) return true;
  return false;
}

////////////////////////////////////////////////////////////////////////////////
// getValidValue
////////////////////////////////////////////////////////////////////////////////

function getValidValue(scheme, path, context) {
  if (scheme.hasOwnProperty('validWhenOptional') && context.FIELD_STATE_CACHE[path][PRESENCE_RULE_NAME] !== _enums.Presence.REQUIRED) return scheme.validWhenOptional;else if (scheme.hasOwnProperty('valid')) return scheme.valid;

  return undefined;
}

////////////////////////////////////////////////////////////////////////////////
// checkIfValidReplacementPossible
////////////////////////////////////////////////////////////////////////////////

function checkIfValidReplacementPossible(scheme, res, path, context) {

  // check if "valid" value is defined
  if (hasValidValue(scheme, path, context) === false) return res;

  // removing field & subfield errors
  //clearErrorsForField(scheme, path, context);

  return getValidValue(scheme, path, context);
}

////////////////////////////////////////////////////////////////////////////////
// calculateAndValidateRules
////////////////////////////////////////////////////////////////////////////////

function calculateAndValidateRules(scheme, res, path, onlyCalculate, context) {

  var fieldState = context.FIELD_STATE_CACHE[path];

  // validating presence rule even if rule value is not defined
  res = calculateAndValidateRule(scheme, PRESENCE_RULE_NAME, res, path, onlyCalculate, context);
  var presenceRuleGotError = fieldState.errorsCount > 0;

  if (fieldState[PRESENCE_RULE_NAME] === _enums.Presence.ABSENT) {
    res = undefined;
    //clearErrorsForField(scheme, path, context);
  }

  // validating all the rest rules only if
  // presence rule didn't return error and value is defined
  onlyCalculate = onlyCalculate || res == null || presenceRuleGotError;

  // validating $values rule
  if (scheme[VALUES_RULE_NAME] != null) {
    res = calculateAndValidateRule(scheme, VALUES_RULE_NAME, res, path, onlyCalculate, context);

    // this is true because we validate this rule
    // only if presence rule didn't return error
    var valuesRuleGotError = fieldState.errorsCount > 0;
    debug('valuesRuleGotError %s %s', path, valuesRuleGotError);

    if (context.fixFailedValuesValidation && valuesRuleGotError) {

      var validValues = fieldState[PRESENCE_RULE_NAME];
      if (validValues.length > 0) {
        res = fieldState[PRESENCE_RULE_NAME][0];
      }
    }
  }

  var ruleNames = (0, _lodashCompatObjectKeys2['default'])(scheme);
  for (var i = 0; i < ruleNames.length; i++) {
    var ruleName = ruleNames[i];
    if (ruleName === PRESENCE_RULE_NAME) continue;
    if (ruleName === VALUES_RULE_NAME) continue;
    var prefix = ruleName.slice(0, VALIDATIONS_PROPERTY_NAME_PREFIX.length);
    if (prefix !== VALIDATIONS_PROPERTY_NAME_PREFIX) continue;
    res = calculateAndValidateRule(scheme, ruleName, res, path, onlyCalculate, context);
  }

  // check if valid replacement needed
  if (fieldState.errorsCountWithSubfields > 0) res = checkIfValidReplacementPossible(scheme, res, path, context);

  return res;
}

////////////////////////////////////////////////////////////////////////////////
// validateField
////////////////////////////////////////////////////////////////////////////////

var validateField = function validateField(_x3, _x4, _x5, _x6) {
  var _again = true;

  _function: while (_again) {
    var value = _x3,
        scheme = _x4,
        path = _x5,
        context = _x6;
    _again = false;
    var CACHE = context.CACHE;
    var FIELD_STATE_CACHE = context.FIELD_STATE_CACHE;
    var calculateTransformsAndComputes = context.calculateTransformsAndComputes;
    var runValidations = context.runValidations;

    //////////////////////////////////////////////////////////////////////////////
    // args default values
    //////////////////////////////////////////////////////////////////////////////

    if (path === undefined) path = '';
    if (calculateTransformsAndComputes === undefined) calculateTransformsAndComputes = true;
    if (runValidations === undefined) runValidations = true;

    debug('validating value for path "%s" type %s', path, scheme && scheme.type);

    //////////////////////////////////////////////////////////////////////////////
    // checking cache
    //////////////////////////////////////////////////////////////////////////////
    // just return value if it's already validated

    if (CACHE.hasOwnProperty(path)) {
      debug('validation cache hit for path "%s"', path);
      // TODO надо добавить инфу в errors
      return CACHE[path];
    }

    //////////////////////////////////////////////////////////////////////////////
    // initial values for result and fieldState
    //////////////////////////////////////////////////////////////////////////////
    // we start with an undefined value as a result
    // and empty object as field state

    var res = undefined;
    var fieldState = FIELD_STATE_CACHE[path] = {
      errorsCount: 0,
      errorsCountWithSubfields: 0
    };

    //////////////////////////////////////////////////////////////////////////////
    // checking field scheme to be defined
    //////////////////////////////////////////////////////////////////////////////

    if (scheme == null) {
      if (typeof console !== 'undefined') {
        // eslint-disable-next-line no-console
        console && console.warn('Scheme not defined for path %s', path);
      }
      scheme = {};
    }

    //////////////////////////////////////////////////////////////////////////////
    // calculating field
    //////////////////////////////////////////////////////////////////////////////

    if (scheme.type === _enums.Type.OBJECT) {
      res = (0, _cast.castObject)(value, scheme, path, context);
    } else if (scheme.type === _enums.Type.GROUP) {
      res = (0, _cast.castObject)(value, scheme, path, context);
    } else if (scheme.type === _enums.Type.ARRAY) {
      res = (0, _cast.castArray)(value, scheme, path, context);
    } else {
      if (value != null) res = (0, _cast.castPrimitive)(value, scheme, path, context);
    }

    //////////////////////////////////////////////////////////////////////////////
    // check if this field had cast error
    //////////////////////////////////////////////////////////////////////////////

    if (res === undefined && context.ERRORS_CACHE.length > 0 && context.ERRORS_CACHE[context.ERRORS_CACHE.length - 1].field === path) {
      calculateTransformsAndComputes = false;
      runValidations = false;
    }

    //////////////////////////////////////////////////////////////////////////////
    // compute function
    //////////////////////////////////////////////////////////////////////////////

    if (calculateTransformsAndComputes) {

      var transforms = undefined;
      var computes = undefined;

      if (scheme.transform != null) {
        if ((0, _lodashCompatLangIsArray2['default'])(scheme.transform)) transforms = scheme.transform;else transforms = [scheme.transform];
      }

      if (scheme.compute != null) {
        if ((0, _lodashCompatLangIsArray2['default'])(scheme.compute)) computes = scheme.compute;else computes = [scheme.compute];
      }

      // removing initial value if needed
      if (context.removeInitial === true && scheme.removeInitial === true && scheme.hasOwnProperty('initial')) {
        computes = computes || [];
        computes.push(function (fa) {
          var _value = fa();
          return _value !== scheme.initial ? _value : undefined;
        });
      }

      var _newRes = res;

      // calculate transforms
      var transformsLength = transforms && transforms.length || 0;
      for (var i = 0; i < transformsLength; i++) {
        _newRes = transforms[i](_newRes);
      }

      // calculate computes
      var computesLength = computes && computes.length || 0;
      for (var i = 0; i < computesLength; i++) {
        var fa = (0, _fieldAccessor.getFieldAccessor)(_newRes, path, context);
        _newRes = computes[i](fa);
      }

      if (_newRes !== res) {
        debug('re-validation needed after compute for path %s', path);
        debug('- value changed %j -> %j', res, _newRes);

        // надо удалить вычисляемое поле перед
        // валидацией нового значения
        debug('- clearing cache and errors for %s', path);
        (0, _helper.deleteFieldFromCache)(CACHE, path);
        (0, _helper.deleteFieldFromCache)(FIELD_STATE_CACHE, path);
        (0, _helper.deleteFieldFromErrors)(context.ERRORS_CACHE, path);

        // validating new value
        debug('- running re-validation for %s', path);
        _x3 = _newRes;
        _x4 = scheme;
        _x5 = path;
        _x6 = _extends({}, context, {
          calculateTransformsAndComputes: false
        });
        _again = true;
        CACHE = FIELD_STATE_CACHE = calculateTransformsAndComputes = runValidations = res = fieldState = transforms = computes = _newRes = transformsLength = i = computesLength = i = fa = undefined;
        continue _function;
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // fieldState basic info
    //////////////////////////////////////////////////////////////////////////////

    fieldState.path = path;
    if (scheme.type !== undefined) fieldState.type = scheme.type;
    if (scheme.meta !== undefined) fieldState.meta = scheme.meta;
    if (scheme.precision !== undefined) fieldState.precision = scheme.precision;

    fieldState.name = (0, _rules.getRuleValue)(scheme.name, res, path, context);

    //////////////////////////////////////////////////////////////////////////////
    // validating
    //////////////////////////////////////////////////////////////////////////////

    var dryRun = runValidations === false;
    var newRes = calculateAndValidateRules(scheme, res, path, dryRun, context);

    if (newRes !== res) {
      debug('re-validation needed after rules validation for path %s', path);
      debug('- value changed %j -> %j', res, newRes);

      // надо удалить вычисляемое поле перед
      // валидацией нового значения
      debug('- clearing cache and errors for %s', path);
      (0, _helper.deleteFieldFromCache)(CACHE, path);
      (0, _helper.deleteFieldFromCache)(FIELD_STATE_CACHE, path);
      (0, _helper.deleteFieldFromErrors)(context.ERRORS_CACHE, path);

      // validating new value
      debug('- running re-validation for %s', path);
      _x3 = newRes;
      _x4 = scheme;
      _x5 = path;
      _x6 = _extends({}, context, {
        runValidations: false,
        calculateTransformsAndComputes: false
      });
      _again = true;
      CACHE = FIELD_STATE_CACHE = calculateTransformsAndComputes = runValidations = res = fieldState = transforms = computes = _newRes = transformsLength = i = computesLength = i = fa = dryRun = newRes = undefined;
      continue _function;
    }

    //////////////////////////////////////////////////////////////////////////////
    // save to cache
    //////////////////////////////////////////////////////////////////////////////

    if (context.extendFieldStatesWithValues) fieldState.value = res;
    if (context.extendFieldStatesWithScheme) fieldState.scheme = scheme;

    CACHE[path] = res;

    return res;
  }
};

exports.validateField = validateField;
////////////////////////////////////////////////////////////////////////////////
// cast
////////////////////////////////////////////////////////////////////////////////

exports['default'] = function (rootValue, rootScheme) {
  var path = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];
  var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var _scheme = undefined;
  var _value = undefined;

  if (path === '') {
    _scheme = rootScheme;
    _value = rootValue;
  } else {
    _scheme = (0, _helper.getSubScheme)(rootScheme, path);
    _value = (0, _objectHelper.getAndEvaluateValue)(rootValue, path);
  }

  var context = _extends({
    CACHE: {},
    ERRORS_CACHE: {},
    FIELD_STATE_CACHE: {}
  }, options, {
    lang: undefined,
    validations: _extends({}, _validations2['default'], options.validations),
    casts: _extends({}, _casts2['default'], options.casts),
    castsStrict: _extends({}, _castsStrict2['default'], options.castsStrict),
    rootValue: rootValue,
    rootScheme: rootScheme
  });

  return validateField(_value, _scheme, path, context);
};