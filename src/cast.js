////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isNumber from 'lodash-compat/lang/isNumber';
import isObject from 'lodash-compat/lang/isObject';
import isArray from 'lodash-compat/lang/isArray';
import isFunction from 'lodash-compat/lang/isFunction';
import keys from 'lodash-compat/object/keys';

import { getMessage } from './i18n/lang';

import { CAST_ERROR, Type } from './enums';

import {
  getRemoveEmptyValue,
  deleteFieldFromCache,
  deleteFieldFromErrors,
  getRunValidationsForSubfields,
  extendFieldStateWithError
} from './helper';

import { getRuleValue } from './rules';
import { validateField } from './validate';

const debug = require('debug')('sculp');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

export function getWithPrecision (n, precision) {
  if ((precision != null) && precision >= 0) {
    const roundingMultiplier = Math.pow(10, precision);
    n = Math.floor(n * roundingMultiplier) / roundingMultiplier;
    if (isNaN(n)) { n = undefined; }
  }
  return n;
}

////////////////////////////////////////////////////////////////////////////////
// castPrimitive
////////////////////////////////////////////////////////////////////////////////

export function castPrimitive (value, scheme, path, context) {
  let casted;

  const type = scheme.type;

  if (type == null) {
    if (scheme.hasOwnProperty('type')) {
      // protection from misspellings: { type : Type.NUMBOR }
      throw new Error(getMessage('UNKNOWN_TYPE', { type }, true));
    } else
      return value;
  }

  const cast = context.strict ? context.castsStrict[type] : context.casts[type];

  if (isFunction(cast))
    casted = cast(value);
  else
    throw new Error(getMessage('UNKNOWN_TYPE', { type }, true));

  if (casted === CAST_ERROR) {

    debug('cast error for path %s', path);

    // change from CAST_ERROR to undefined
    casted = undefined;

    // increase error count
    const fieldState = context.FIELD_STATE_CACHE[path];
    fieldState.castError = true;
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    const errorObject = {
      field : path,
      message : getMessage('CAST_ERROR', { type : scheme.type }),
      name : getRuleValue(scheme.name, undefined, path, context),
      value
    };

    if (context.extendFieldStatesWithErrors === true)
      extendFieldStateWithError(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);

  } else {

    if (isNumber(casted) && isNumber(scheme.precision)) {
      casted = getWithPrecision(casted, scheme.precision);
    }
  }

  return casted;
}

////////////////////////////////////////////////////////////////////////////////
// castObject
////////////////////////////////////////////////////////////////////////////////

export function castObject (value, scheme, path, context) {

  const fieldState = context.FIELD_STATE_CACHE[path];

  if (value != null && isObject(value) === false) {
    // increase error count
    fieldState.castError = true;
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    const errorObject = {
      field : path,
      message : getMessage('CAST_ERROR', { type : scheme.type }),
      name : getRuleValue(scheme.name, undefined, path, context),
      value
    };

    if (context.extendFieldStatesWithErrors === true)
      extendFieldStateWithError(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);

    return undefined;
  }

  let { runValidations, calculateTransformsAndComputes } = context;
  if (runValidations === undefined)
    runValidations = true;
  if (calculateTransformsAndComputes === undefined)
    calculateTransformsAndComputes = true;

  let res = {};
  if (scheme.removeExtra === false)
    res = { ...value };
  else
    res = {};

  //let k;
  let fieldsCount = 0;
  const properties = scheme.properties || {};
  const propertiesKeys = keys(properties);

  for (let i = 0; i < propertiesKeys.length; i++) {
    const k = propertiesKeys[i];
    const fieldValue = value && value[k];
    const fieldScheme = properties[k];
    const fieldPath = `${path}.${k}`;

    const fieldRunValidations =
      runValidations &&
      getRunValidationsForSubfields(scheme, value);

    const fieldCalculateComputes =
        (calculateTransformsAndComputes === false) ? false :
            (scheme.type === Type.GROUP || value != null);

    const fieldRes = validateField(
      fieldValue, fieldScheme, fieldPath, {
        ...context,
        runValidations : fieldRunValidations,
        calculateTransformsAndComputes : fieldCalculateComputes
      });

    // sum error counts
    fieldState.errorsCountWithSubfields +=
        context.FIELD_STATE_CACHE[fieldPath].errorsCountWithSubfields;

    if (fieldRes != null) {
      res[k] = fieldRes;
      fieldsCount++;
    }
  }

  // if original value was not defined, return undefined
  if (value == null && scheme.type !== Type.GROUP)
    res = undefined;

  if (fieldsCount === 0 && getRemoveEmptyValue(scheme, context))
    res = undefined;

  return res;
}

////////////////////////////////////////////////////////////////////////////////
// castArray
////////////////////////////////////////////////////////////////////////////////

export function castArray (value, scheme, path, context) {

  const fieldState = context.FIELD_STATE_CACHE[path];

  if (value != null && isArray(value) === false) {
    // increase error count
    fieldState.castError = true;
    fieldState.errorsCount += 1;
    fieldState.errorsCountWithSubfields += 1;

    const errorObject = {
      field : path,
      message : getMessage('CAST_ERROR', { type : scheme.type }),
      name : getRuleValue(scheme.name, undefined, path, context),
      value
    };

    if (context.extendFieldStatesWithErrors === true)
      extendFieldStateWithError(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);

    return undefined;
  }

  let res = [];

  let { preserveEmptyArrayItems } = context;
  if (preserveEmptyArrayItems === undefined)
    preserveEmptyArrayItems = false;

  const itemScheme = scheme.items;

  // to add pseudo-path "path.items" into fieldState
  validateField(undefined, itemScheme, `${path}.items`, {
    ...context,
    runValidations : false,
    calculateTransformsAndComputes : false
  });

  // if original value was not defined, return undefined
  if (value == null) {
    res = value;
  } else {
    let skip = 0;
    for (let i = 0; i < value.length; i++) {
      const itemPath = `${path}[${i - skip}]`;
      const itemRes = validateField(value[i], itemScheme,
        itemPath, context);

      // is there an error validating this item?
      const itemFieldState = context.FIELD_STATE_CACHE[itemPath];
      const fieldHasErrors = itemFieldState.errorsCountWithSubfields > 0;

      // empty values are removed from array if they don't have
      // errors or preserveEmptyArrayItems option is true
      if (itemRes == null && fieldHasErrors === false &&
          preserveEmptyArrayItems === false) {
        deleteFieldFromCache(context.CACHE, itemPath);
        deleteFieldFromCache(context.FIELD_STATE_CACHE, itemPath);
        deleteFieldFromErrors(context.ERRORS_CACHE, itemPath);
        skip++;
      } else {
        res.push(itemRes);

        // sum error counts
        fieldState.errorsCountWithSubfields +=
            itemFieldState.errorsCountWithSubfields;
      }
    }
  }

  if (res && res.length === 0 && getRemoveEmptyValue(scheme, context))
    res = undefined;

  // extending with itemFieldState and itemsFieldStates
  if (context.extendArrayStatesWithItemStates) {
    const FIELD_STATE_CACHE = context.FIELD_STATE_CACHE;
    fieldState.itemFieldState = FIELD_STATE_CACHE[path + '.items'];
    if (res != null) {
      fieldState.itemsFieldStates = res.map((v, idx) =>
          FIELD_STATE_CACHE[`${path}[${idx}]`]);
    } else {
      fieldState.itemsFieldStates = [];
    }
  }

  return res;
}
