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

import { Type, Presence } from './enums';

import { getAndEvaluateValue } from './object/helper';
import { getMessage } from './i18n/lang';

import {
    getSubSchema,
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

function calculateAndValidateRule (schema, ruleName,
                                   res, path, onlyCalculate, context) {

  let nameWithoutPrefix;
  let validation;
  let ruleValue;

  if (ruleName === CUSTOM_RULE_NAME) {
    const customRuleFunction = schema[CUSTOM_RULE_NAME];
    validation = customRuleFunction && customRuleFunction.value ||
                 customRuleFunction;
    ruleValue = undefined;
  } else {
    nameWithoutPrefix = ruleName.slice(VALIDATIONS_PROPERTY_NAME_PREFIX.length);
    validation = context.validations[nameWithoutPrefix];

    ruleValue = getRuleValue(schema[ruleName], res, path, context);

    // for Presence rule there are some checks
    if (ruleName === PRESENCE_RULE_NAME) {

      // for undefined array items presence is ABSENT
      if (path[path.length - 1] === ']' && res == null)
        ruleValue = Presence.ABSENT;

      // default rule value for presence is OPTIONAL
      if (ruleValue == null)
        ruleValue = Presence.OPTIONAL;

      // we don't want errors about value being present while
      // it should be absent, we just remove the value
      if (ruleValue === Presence.ABSENT)
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
      message = getRuleErrorMessage(schema[ruleName], res, path, context);

    message = message || result;

    // increase error count
    const fieldState = context.FIELD_STATE_CACHE[path];
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    const errorObject = {
      rule : ruleName,
      message,
      field : path,
      name : getRuleValue(schema.name, res, path, context),
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

function hasValidValue (schema, path, context) {
  if (schema.hasOwnProperty('validWhenOptional') &&
      context.FIELD_STATE_CACHE[path][PRESENCE_RULE_NAME] !== Presence.REQUIRED)
    return true;
  else if (schema.hasOwnProperty('valid'))
    return true;
  return false;
}

////////////////////////////////////////////////////////////////////////////////
// getValidValue
////////////////////////////////////////////////////////////////////////////////

function getValidValue (schema, path, context) {
  if (schema.hasOwnProperty('validWhenOptional') &&
      context.FIELD_STATE_CACHE[path][PRESENCE_RULE_NAME] !== Presence.REQUIRED)
    return schema.validWhenOptional;
  else if (schema.hasOwnProperty('valid'))
    return schema.valid;

  return undefined;
}

////////////////////////////////////////////////////////////////////////////////
// checkIfValidReplacementPossible
////////////////////////////////////////////////////////////////////////////////

function checkIfValidReplacementPossible (schema, res, path, context) {

  // check if "valid" value is defined
  if (hasValidValue(schema, path, context) === false)
    return res;

  // removing field & subfield errors
  //clearErrorsForField(schema, path, context);

  return getValidValue(schema, path, context);
}

////////////////////////////////////////////////////////////////////////////////
// calculateAndValidateRules
////////////////////////////////////////////////////////////////////////////////

function calculateAndValidateRules (schema, res, path, onlyCalculate, context) {

  const fieldState = context.FIELD_STATE_CACHE[path];

  // validating presence rule even if rule value is not defined
  res = calculateAndValidateRule(
      schema, PRESENCE_RULE_NAME, res, path, onlyCalculate, context);
  const presenceRuleGotError = fieldState.errorsCount > 0;

  if (fieldState[PRESENCE_RULE_NAME] === Presence.ABSENT) {
    res = undefined;
    //clearErrorsForField(schema, path, context);
  }

  // validating all the rest rules only if
  // presence rule didn't return error and value is defined
  onlyCalculate = onlyCalculate || (res == null) || presenceRuleGotError;

  // validating $values rule
  if (schema[VALUES_RULE_NAME] != null) {
    res = calculateAndValidateRule(
        schema, VALUES_RULE_NAME, res, path, onlyCalculate, context);

    // this is true because we validate this rule
    // only if presence rule didn't return error
    const valuesRuleGotError = fieldState.errorsCount > 0;
    debug('valuesRuleGotError %s %s', path, valuesRuleGotError);

    if (context.fixFailedValuesValidation && valuesRuleGotError) {

      const validValues = fieldState[VALUES_RULE_NAME];
      if (validValues.length > 0) {
        res = fieldState[VALUES_RULE_NAME][0];
      }
    }
  }

  const ruleNames = keys(schema);
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
        schema, ruleName, res, path, onlyCalculate, context);
  }

  // check if valid replacement needed
  if (fieldState.errorsCountWithSubfields > 0)
    res = checkIfValidReplacementPossible(schema, res, path, context);

  return res;
}

////////////////////////////////////////////////////////////////////////////////
// validateField
////////////////////////////////////////////////////////////////////////////////

export const validateField = (value, schema, path, context) => {

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

  debug('validating value for path "%s" type %s', path, schema && schema.type);

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
  // checking field schema to be defined
  //////////////////////////////////////////////////////////////////////////////

  if (schema == null) {
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console && console.warn('Schema not defined for path %s', path);
    }
    schema = {};
  }

  //////////////////////////////////////////////////////////////////////////////
  // calculating field
  //////////////////////////////////////////////////////////////////////////////

  if (schema.type === Type.OBJECT) {
    res = castObject(value, schema, path, context);
  } else if (schema.type === Type.GROUP) {
    res = castObject(value, schema, path, context);
  } else if (schema.type === Type.ARRAY) {
    res = castArray(value, schema, path, context);
  } else {
    if (value != null)
      res = castPrimitive(value, schema, path, context);
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

    if (schema.transform != null) {
      if (isArray(schema.transform))
        transforms = schema.transform;
      else
        transforms = [ schema.transform ];
    }

    if (schema.compute != null) {
      if (isArray(schema.compute))
        computes = schema.compute;
      else
        computes = [ schema.compute ];
    }

    // removing initial value if needed
    if (context.removeInitial === true &&
        schema.removeInitial === true &&
        schema.hasOwnProperty('initial')) {
      computes = computes || [];
      computes.push(function (fa) {
        const _value = fa();
        return _value !== schema.initial ? _value : undefined;
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
      return validateField(newRes, schema, path, {
        ...context,
        calculateTransformsAndComputes : false
      });
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  // fieldState basic info
  //////////////////////////////////////////////////////////////////////////////

  fieldState.path = path;
  if (schema.type !== undefined)
    fieldState.type = schema.type;
  if (schema.meta !== undefined)
    fieldState.meta = schema.meta;
  if (schema.precision !== undefined)
    fieldState.precision = schema.precision;

  fieldState.name = getRuleValue(schema.name, res, path, context);

  //////////////////////////////////////////////////////////////////////////////
  // validating
  //////////////////////////////////////////////////////////////////////////////

  const dryRun = runValidations === false;
  const newRes = calculateAndValidateRules(schema, res, path, dryRun, context);

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
    return validateField(newRes, schema, path, {
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
  if (context.extendFieldStatesWithSchema)
    fieldState.schema = schema;

  CACHE[path] = res;

  return res;
};

////////////////////////////////////////////////////////////////////////////////
// cast
////////////////////////////////////////////////////////////////////////////////

export default (rootValue, rootSchema, path = '', options = {}) => {
  let _schema;
  let _value;

  if (path === '') {
    _schema = rootSchema;
    _value = rootValue;
  } else {
    _schema = getSubSchema(rootSchema, path);
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
    rootSchema
  };

  return validateField(_value, _schema, path, context);
};
