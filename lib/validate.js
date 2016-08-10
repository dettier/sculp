////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isString from 'lodash-compat/lang/isString';
import isArray from 'lodash-compat/lang/isArray';
import isFunction from 'lodash-compat/lang/isFunction';
import keys from 'lodash-compat/object/keys';

import CASTS from './casts';
import CASTS_STRICT from './casts-strict';
import VALIDATIONS from './validations';

import { castArray, castObject, castPrimitive } from './cast';
import { getRuleValue, getRuleErrorMessage } from './rules';
import { getFieldAccessor } from './field-accessor';

import { TYPE, PRESENCE } from './enums';

import { getAndEvaluateValue } from './object/helper';
import { getMessage } from './i18n/lang';

import {
    getSubScheme,
    deleteFieldFromCache,
    deleteFieldFromErrors,
    extendFieldStateWithError
} from './helper';

const debug = require('debug')('sculp:validate');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// validation constants
////////////////////////////////////////////////////////////////////////////////

const VALIDATIONS_PROPERTY_NAME_PREFIX = '$';

export const CUSTOM_RULE_NAME = `${VALIDATIONS_PROPERTY_NAME_PREFIX}custom`;
export const PRESENCE_RULE_NAME = `${VALIDATIONS_PROPERTY_NAME_PREFIX}presence`;
export const VALUES_RULE_NAME = `${VALIDATIONS_PROPERTY_NAME_PREFIX}values`;

////////////////////////////////////////////////////////////////////////////////
// calculateAndValidateRule
////////////////////////////////////////////////////////////////////////////////

function calculateAndValidateRule (scheme, ruleName,
                                   res, path, onlyCalculate, context) {

  let nameWithoutPrefix;
  let validation;
  let ruleValue;

  if (ruleName === CUSTOM_RULE_NAME) {
    const customRuleFunction = scheme[CUSTOM_RULE_NAME];
    validation = customRuleFunction && customRuleFunction.value ||
                 customRuleFunction;
    ruleValue = undefined;
  } else {
    nameWithoutPrefix = ruleName.slice(VALIDATIONS_PROPERTY_NAME_PREFIX.length);
    validation = context.validations[nameWithoutPrefix];

    ruleValue = getRuleValue(scheme[ruleName], res, path, context);

    // for PRESENCE rule there are some checks
    if (ruleName === PRESENCE_RULE_NAME) {

      // for undefined array items presence is ABSENT
      if (path[path.length - 1] === ']' && res == null)
        ruleValue = PRESENCE.ABSENT;

      // default rule value for presence is OPTIONAL
      if (ruleValue == null)
        ruleValue = PRESENCE.OPTIONAL;

      // we don't want errors about value being present while
      // it should be absent, we just remove the value
      if (ruleValue === PRESENCE.ABSENT)
        res = undefined;
    }

    context.FIELD_STATE_CACHE[path][ruleName] = ruleValue;

    if (ruleValue == null)
      return res;
  }

  if (onlyCalculate)
    return res;

  if (isFunction(validation) === false) {
    if (typeof console !== 'undefined') {
      throw new Error(getMessage('UNKNOWN_VALIDATION', { name : nameWithoutPrefix }, true));
    }
    return res;
  }

  const fa = getFieldAccessor(res, path, context);

  debug('rule %s value for path "%s" is %j', ruleName, path, ruleValue);
  const result = validation(fa, ruleValue);
  debug('rule %s for path "%s" result %j', ruleName, path, result);

  // this means error
  if (isString(result)) {

    let message;
    if (ruleName !== CUSTOM_RULE_NAME)
      message = getRuleErrorMessage(scheme[ruleName], res, path, context);

    message = message || result;

    // increase error count
    const fieldState = context.FIELD_STATE_CACHE[path];
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    const errorObject = {
      rule : ruleName,
      message,
      field : path,
      name : getRuleValue(scheme.name, res, path, context),
      value : res
    };

    if (context.extendFieldStatesWithErrors === true)
      extendFieldStateWithError(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);
  }

  return res;
}

////////////////////////////////////////////////////////////////////////////////
// hasValidValue
////////////////////////////////////////////////////////////////////////////////

function hasValidValue (scheme, path, context) {
  if (scheme.hasOwnProperty('validWhenOptional') &&
      context.FIELD_STATE_CACHE[path][PRESENCE_RULE_NAME] !== PRESENCE.REQUIRED)
    return true;
  else if (scheme.hasOwnProperty('valid'))
    return true;
  return false;
}

////////////////////////////////////////////////////////////////////////////////
// getValidValue
////////////////////////////////////////////////////////////////////////////////

function getValidValue (scheme, path, context) {
  if (scheme.hasOwnProperty('validWhenOptional') &&
      context.FIELD_STATE_CACHE[path][PRESENCE_RULE_NAME] !== PRESENCE.REQUIRED)
    return scheme.validWhenOptional;
  else if (scheme.hasOwnProperty('valid'))
    return scheme.valid;

  return undefined;
}

////////////////////////////////////////////////////////////////////////////////
// checkIfValidReplacementPossible
////////////////////////////////////////////////////////////////////////////////

function checkIfValidReplacementPossible (scheme, res, path, context) {

  // check if "valid" value is defined
  if (hasValidValue(scheme, path, context) === false)
    return res;

  // removing field & subfield errors
  //clearErrorsForField(scheme, path, context);

  return getValidValue(scheme, path, context);
}

////////////////////////////////////////////////////////////////////////////////
// calculateAndValidateRules
////////////////////////////////////////////////////////////////////////////////

function calculateAndValidateRules (scheme, res, path, onlyCalculate, context) {

  const fieldState = context.FIELD_STATE_CACHE[path];

  // validating presence rule even if rule value is not defined
  res = calculateAndValidateRule(
      scheme, PRESENCE_RULE_NAME, res, path, onlyCalculate, context);
  const presenceRuleGotError = fieldState.errorsCount > 0;

  if (fieldState[PRESENCE_RULE_NAME] === PRESENCE.ABSENT) {
    res = undefined;
    //clearErrorsForField(scheme, path, context);
  }

  // validating all the rest rules only if
  // presence rule didn't return error and value is defined
  onlyCalculate = onlyCalculate || (res == null) || presenceRuleGotError;

  // validating $values rule
  if (scheme[VALUES_RULE_NAME] != null) {
    res = calculateAndValidateRule(
        scheme, VALUES_RULE_NAME, res, path, onlyCalculate, context);

    // this is true because we validate this rule
    // only if presence rule didn't return error
    const valuesRuleGotError = fieldState.errorsCount > 0;
    debug('valuesRuleGotError %s %s', path, valuesRuleGotError);

    if (context.fixFailedValuesValidation && valuesRuleGotError) {

      const validValues = fieldState[PRESENCE_RULE_NAME];
      if (validValues.length > 0) {
        res = fieldState[PRESENCE_RULE_NAME][0];
      }
    }
  }

  const ruleNames = keys(scheme);
  for (let i = 0; i < ruleNames.length; i++) {
    const ruleName = ruleNames[i];
    if (ruleName === PRESENCE_RULE_NAME)
      continue;
    if (ruleName === VALUES_RULE_NAME)
      continue;
    const prefix = ruleName.slice(0, VALIDATIONS_PROPERTY_NAME_PREFIX.length);
    if (prefix !== VALIDATIONS_PROPERTY_NAME_PREFIX)
      continue;
    res = calculateAndValidateRule(
        scheme, ruleName, res, path, onlyCalculate, context);
  }

  // check if valid replacement needed
  if (fieldState.errorsCountWithSubfields > 0)
    res = checkIfValidReplacementPossible(scheme, res, path, context);

  return res;
}

////////////////////////////////////////////////////////////////////////////////
// validateField
////////////////////////////////////////////////////////////////////////////////

export const validateField = (value, scheme, path, context) => {

  const { CACHE, FIELD_STATE_CACHE } = context;
  let {
      calculateTransformsAndComputes,
      runValidations
  } = context;

  //////////////////////////////////////////////////////////////////////////////
  // args default values
  //////////////////////////////////////////////////////////////////////////////

  if (path === undefined)
    path = '';
  if (calculateTransformsAndComputes === undefined)
    calculateTransformsAndComputes = true;
  if (runValidations === undefined)
    runValidations = true;

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

  let res = undefined;
  const fieldState = FIELD_STATE_CACHE[path] = {
    errorsCount : 0,
    errorsCountWithSubfields : 0
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

  if (scheme.type === TYPE.OBJECT) {
    res = castObject(value, scheme, path, context);
  } else if (scheme.type === TYPE.GROUP) {
    res = castObject(value, scheme, path, context);
  } else if (scheme.type === TYPE.ARRAY) {
    res = castArray(value, scheme, path, context);
  } else {
    if (value != null)
      res = castPrimitive(value, scheme, path, context);
  }

  //////////////////////////////////////////////////////////////////////////////
  // check if this field had cast error
  //////////////////////////////////////////////////////////////////////////////

  if (res === undefined && context.ERRORS_CACHE.length > 0 &&
      context.ERRORS_CACHE[context.ERRORS_CACHE.length - 1].field === path) {
    calculateTransformsAndComputes = false;
    runValidations = false;
  }

  //////////////////////////////////////////////////////////////////////////////
  // compute function
  //////////////////////////////////////////////////////////////////////////////

  if (calculateTransformsAndComputes) {

    let transforms;
    let computes;

    if (scheme.transform != null) {
      if (isArray(scheme.transform))
        transforms = scheme.transform;
      else
        transforms = [ scheme.transform ];
    }

    if (scheme.compute != null) {
      if (isArray(scheme.compute))
        computes = scheme.compute;
      else
        computes = [ scheme.compute ];
    }

    // removing initial value if needed
    if (context.removeInitial === true &&
        scheme.removeInitial === true &&
        scheme.hasOwnProperty('initial')) {
      computes = computes || [];
      computes.push(function (fa) {
        const _value = fa();
        return _value !== scheme.initial ? _value : undefined;
      });
    }

    let newRes = res;

    // calculate transforms
    const transformsLength = transforms && transforms.length || 0;
    for (let i = 0; i < transformsLength; i++) {
      newRes = transforms[i](newRes);
    }

    // calculate computes
    const computesLength = computes && computes.length || 0;
    for (let i = 0; i < computesLength; i++) {
      const fa = getFieldAccessor(newRes, path, context);
      newRes = computes[i](fa);
    }

    if (newRes !== res) {
      debug('re-validation needed after compute for path %s', path);
      debug('- value changed %j -> %j', res, newRes);

      // надо удалить вычисляемое поле перед
      // валидацией нового значения
      debug('- clearing cache and errors for %s', path);
      deleteFieldFromCache(CACHE, path);
      deleteFieldFromCache(FIELD_STATE_CACHE, path);
      deleteFieldFromErrors(context.ERRORS_CACHE, path);

      // validating new value
      debug('- running re-validation for %s', path);
      return validateField(newRes, scheme, path, {
        ...context,
        calculateTransformsAndComputes : false
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // fieldState basic info
  //////////////////////////////////////////////////////////////////////////////

  fieldState.path = path;
  if (scheme.type !== undefined)
    fieldState.type = scheme.type;
  if (scheme.meta !== undefined)
    fieldState.meta = scheme.meta;
  if (scheme.precision !== undefined)
    fieldState.precision = scheme.precision;

  fieldState.name = getRuleValue(scheme.name, res, path, context);

  //////////////////////////////////////////////////////////////////////////////
  // validating
  //////////////////////////////////////////////////////////////////////////////

  const dryRun = runValidations === false;
  const newRes = calculateAndValidateRules(scheme, res, path, dryRun, context);

  if (newRes !== res) {
    debug('re-validation needed after rules validation for path %s', path);
    debug('- value changed %j -> %j', res, newRes);

    // надо удалить вычисляемое поле перед
    // валидацией нового значения
    debug('- clearing cache and errors for %s', path);
    deleteFieldFromCache(CACHE, path);
    deleteFieldFromCache(FIELD_STATE_CACHE, path);
    deleteFieldFromErrors(context.ERRORS_CACHE, path);

    // validating new value
    debug('- running re-validation for %s', path);
    return validateField(newRes, scheme, path, {
      ...context,
      runValidations : false,
      calculateTransformsAndComputes : false
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // save to cache
  //////////////////////////////////////////////////////////////////////////////

  if (context.extendFieldStatesWithValues)
    fieldState.value = res;
  if (context.extendFieldStatesWithScheme)
    fieldState.scheme = scheme;

  CACHE[path] = res;

  return res;
};

////////////////////////////////////////////////////////////////////////////////
// cast
////////////////////////////////////////////////////////////////////////////////

export default (rootValue, rootScheme, path = '', options = {}) => {
  let _scheme;
  let _value;

  if (path === '') {
    _scheme = rootScheme;
    _value = rootValue;
  } else {
    _scheme = getSubScheme(rootScheme, path);
    _value = getAndEvaluateValue(rootValue, path);
  }

  const context = {
    CACHE : {},
    ERRORS_CACHE : {},
    FIELD_STATE_CACHE : {},
    ...options,
    lang : undefined,
    validations : {
      ...VALIDATIONS,
      ...options.validations
    },
    casts : {
      ...CASTS,
      ...options.casts
    },
    castsStrict : {
      ...CASTS_STRICT,
      ...options.castsStrict
    },
    rootValue,
    rootScheme
  };

  return validateField(_value, _scheme, path, context);
};
