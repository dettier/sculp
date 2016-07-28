////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isString from 'lodash-compat/lang/isString';
import isObject from 'lodash-compat/lang/isObject';
import isArray from 'lodash-compat/lang/isArray';
import isFunction from 'lodash-compat/lang/isFunction';
import keys from 'lodash-compat/object/keys';

import { CAST_ERROR, TYPE } from './enums';

import {
  getRemoveEmptyValue,
  deleteFieldFromCache,
  deleteFieldFromErrors,
  getRunValidationsForSubfields,
  extendFieldStateWithError
} from './helper';

import { getRuleValue } from './rules';
import { validateField } from './validate';

import CASTS from './casts';

const debug = require('debug')('sculp');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

export const DEFAULT_PRECISION = 10;

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

  if (isString(value))
    value = value.trim();

  const type = scheme.type;

  if (type == null)
    return value;

  const cast = CASTS[type];

  if (isFunction(cast))
    casted = cast(value);

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
      message : 'Не удалось привести значение к требуемому типу',
      name : getRuleValue(scheme.name, undefined, path, context),
      value
    };

    if (context.extendFieldStatesWithErrors === true)
      extendFieldStateWithError(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);

  } else {

    if (type === TYPE.NUMBER) {
      const precision = scheme.precision;
      const prec = precision != null ? precision : DEFAULT_PRECISION;
      casted = getWithPrecision(casted, prec);
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
      message : 'Не удалось привести значение к требуемому типу',
      name : getRuleValue(scheme.name, undefined, path, context),
      value
    };

    if (context.extendFieldStatesWithErrors === true)
      extendFieldStateWithError(fieldState, errorObject);

    context.ERRORS_CACHE.push(errorObject);

    return undefined;
  }

  let { runValidations, calculateComputes } = context;
  if (runValidations === undefined)
    runValidations = true;
  if (calculateComputes === undefined)
    calculateComputes = true;

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
        (calculateComputes === false) ? false :
            (scheme.type === TYPE.GROUP || value != null);

    const fieldRes = validateField(
      fieldValue, fieldScheme, fieldPath, {
        ...context,
        runValidations : fieldRunValidations,
        calculateComputes : fieldCalculateComputes
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
  if (value == null && scheme.type !== TYPE.GROUP)
    res = undefined;

  if (fieldsCount === 0 && getRemoveEmptyValue(scheme, path))
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
      message : 'Не удалось привести значение к требуемому типу',
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

  // чтобы добавить path.items в fieldState
  validateField(undefined, itemScheme, `${path}.items`, {
    ...context,
    runValidations : false,
    calculateComputes : false
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

  if (res && res.length === 0 && getRemoveEmptyValue(scheme, path))
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
