////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import startsWith from 'underscore.string/startsWith';

import {
  memoize, filter, keys,
  isEmpty, isArray, isString, isDate, isObject
} from 'lodash-compat';

import { TYPE } from './enums';

import { getValue, getAndEvaluateValue } from './object/helper';
import {
  normalizeMemoized,
  getParentPaths as _getParentPaths
} from './utils/path';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// getSubScheme
////////////////////////////////////////////////////////////////////////////////

export function getSubScheme (scheme, path = '') {

  path = normalizeMemoized(path);

  path = path.replace(/\.(.)/g, '.properties.$1');
  path = path.replace(/\[\w*\]/g, '.items');

  return getValue(scheme, path);
}

////////////////////////////////////////////////////////////////////////////////
// getRunValidationsForSubfields
////////////////////////////////////////////////////////////////////////////////

export function getRunValidationsForSubfields (scheme, value) {
  if (scheme.type === TYPE.GROUP)
    return true;
  return value != null;
}

////////////////////////////////////////////////////////////////////////////////
// parent paths
////////////////////////////////////////////////////////////////////////////////

export const getParentPaths = _getParentPaths;
export const getParentPathsMemoized = memoize(_getParentPaths);

////////////////////////////////////////////////////////////////////////////////
// getParentPath
////////////////////////////////////////////////////////////////////////////////

export function getParentPath (path) {
  if (path === '')
    return undefined;

  const parentPaths = getParentPathsMemoized(path);
  return parentPaths[parentPaths.length - 2];
}

export const getParentPathMemoized = memoize(getParentPath);

////////////////////////////////////////////////////////////////////////////////
// getRunValidationsForPath
////////////////////////////////////////////////////////////////////////////////

export function getRunValidationsForPath (rootScheme, rootValue, path) {
  if (path === '')
    return true;

  const parentPaths = getParentPathsMemoized(path);
  const parentPath = parentPaths[parentPaths.length - 2];

  if (parentPath == null)
    return true;

  const parentScheme = getSubScheme(rootScheme, parentPath);

  const parentValue = getAndEvaluateValue(rootValue, parentPath);
  return getRunValidationsForSubfields(parentScheme, parentValue);
}

////////////////////////////////////////////////////////////////////////////////
// isSubfield
////////////////////////////////////////////////////////////////////////////////

export function isSubfield (subfieldPath, fieldPath) {
  const pathLength = fieldPath.length;

  if (startsWith(subfieldPath, fieldPath)) {
    if (subfieldPath[pathLength] === '.' ||
      subfieldPath[pathLength] === '[')
      return true;
  }

  return false;
}

export const isSubfieldMemoized = memoize(isSubfield, (a, b) => `${a}|${b}`);

////////////////////////////////////////////////////////////////////////////////
// isSubfieldOrEqual
////////////////////////////////////////////////////////////////////////////////

export function isSubfieldOrEqual (subfieldPath, fieldPath) {
  return isSubfield(subfieldPath, fieldPath) || subfieldPath === fieldPath;
}

export const isSubfieldOrEqualMemoized =
  memoize(isSubfieldOrEqual, (a, b) => `${a}|${b}`);

////////////////////////////////////////////////////////////////////////////////
// extendFieldStateWithError
////////////////////////////////////////////////////////////////////////////////

export function extendFieldStateWithError (fieldState, errorObject) {
  if (fieldState.errors == null)
    fieldState.errors = [];
  fieldState.errors.push(errorObject.message);
}

////////////////////////////////////////////////////////////////////////////////
// deleteFieldFromCache
////////////////////////////////////////////////////////////////////////////////

export function deleteFieldFromCache (CACHE, path) {
  Object.keys(CACHE).forEach((key) => {
    if (isSubfieldOrEqual(key, path))
      delete CACHE[key];
  });
}

////////////////////////////////////////////////////////////////////////////////
// deleteFieldFromErrors
////////////////////////////////////////////////////////////////////////////////

export function deleteFieldFromErrors (errors, path) {
  const newErrors = filter(errors, (e) => {
    return isSubfieldOrEqual(e.field, path) === false;
  });

  if (newErrors.length !== errors.length)
    errors.splice(0, errors.length, ...newErrors);
}

////////////////////////////////////////////////////////////////////////////////
// isValueEmpty
////////////////////////////////////////////////////////////////////////////////

export const isValueEmpty = (value) => {
  if (value == null)
    return true;

  if (isArray(value) || isString(value) ||
      (isObject(value) && !isDate(value)))
    return isEmpty(value);

  return false;
};

////////////////////////////////////////////////////////////////////////////////
// getRemoveEmptyValue
////////////////////////////////////////////////////////////////////////////////
// default value is false

export const getRemoveEmptyValue = (fieldScheme /*, fieldPath */) => {

  // removeEmpty, по умолчанию true кроме
  //корневого объекта (в этом случае false)
  /*
  let defaultRemoveEmpty;
  if (fieldPath.length === 0 &&
      (fieldScheme.type === TYPE.OBJECT || fieldScheme.type === TYPE.GROUP))
    defaultRemoveEmpty = false;
  else
    defaultRemoveEmpty = true;
  */

  const removeEmpty = fieldScheme.removeEmpty;
  return removeEmpty != null ? removeEmpty : false;
};

////////////////////////////////////////////////////////////////////////////////
// shouldBeRemovedAsEmpty
////////////////////////////////////////////////////////////////////////////////

export const shouldBeRemovedAsEmpty = (fieldValue, fieldScheme, fieldPath) => {
  return getRemoveEmptyValue(fieldScheme, fieldPath) && isValueEmpty(fieldValue);
};

////////////////////////////////////////////////////////////////////////////////
// getInitial
////////////////////////////////////////////////////////////////////////////////

export const getInitial = function (scheme) {

  if (scheme.hasOwnProperty('initial'))
    return scheme.initial;

  let result = undefined;

  if (scheme.type === TYPE.OBJECT || scheme.type === TYPE.GROUP) {

    result = {};
    const properties = scheme.properties || {};

    const propKeys = keys(properties);
    for (let i = 0; i < propKeys.length; i++) {
      const k = propKeys[i];
      const v = properties[k];
      const subinitial = getInitial(v);
      if (subinitial != null)
        result[k] = subinitial;
    }
    if (isEmpty(result))
      result = undefined;
  }

  return result;
};
