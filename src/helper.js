////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import startsWith from 'underscore.string/startsWith';
import endsWith from 'underscore.string/endsWith';

import isEmpty from 'lodash-compat/lang/isEmpty';
import isString from 'lodash-compat/lang/isString';
import isDate from 'lodash-compat/lang/isDate';
import isObject from 'lodash-compat/lang/isObject';
import isArray from 'lodash-compat/lang/isArray';
import memoize from 'lodash-compat/function/memoize';
import filter from 'lodash-compat/collection/filter';
import keys from 'lodash-compat/object/keys';

import { Type } from './enums';

import { getValue, getAndEvaluateValue } from './object/helper';
import {
  normalizeMemoized,
  getParentPaths as _getParentPaths
} from './utils/path';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

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
// getSubSchema
////////////////////////////////////////////////////////////////////////////////

export function getSubSchema (schema, path = '') {

  path = normalizeMemoized(path);

  path = path.replace(/\.(.)/g, '.properties.$1');
  path = path.replace(/\[\w*\]/g, '.items');

  return getValue(schema, path);
}

////////////////////////////////////////////////////////////////////////////////
// getSubSchemaHandlingPseudoFields
////////////////////////////////////////////////////////////////////////////////

export function getSubSchemaHandlingPseudoFields (schema, path = '') {

  const res = getSubSchema(schema, path);

  if (res != null)
    return res;

  // path might reference pseudo-path for array item ".array.items"
  if (path === 'items' || endsWith(path, '.items')) {
    const parentPath = getParentPathMemoized(path);
    const parentSchema = getSubSchema(schema, parentPath);
    if (parentSchema && parentSchema.type === Type.ARRAY) {
      return parentSchema.items;
    }
  }

  return undefined;
}

////////////////////////////////////////////////////////////////////////////////
// getRunValidationsForSubfields
////////////////////////////////////////////////////////////////////////////////

export function getRunValidationsForSubfields (schema, value) {
  if (schema.type === Type.GROUP)
    return true;
  return value != null;
}

////////////////////////////////////////////////////////////////////////////////
// getRunValidationsForPath
////////////////////////////////////////////////////////////////////////////////

export function getRunValidationsForPath (rootSchema, rootValue, path) {
  if (path === '')
    return true;

  const parentPaths = getParentPathsMemoized(path);
  const parentPath = parentPaths[parentPaths.length - 2];

  if (parentPath == null)
    return true;

  const parentSchema = getSubSchema(rootSchema, parentPath);

  const parentValue = getAndEvaluateValue(rootValue, parentPath);
  return getRunValidationsForSubfields(parentSchema, parentValue);
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
  fieldState.errors.push(errorObject);
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

export const getRemoveEmptyValue = (fieldSchema, context) => {
  return fieldSchema.removeEmpty || context.removeEmpty || false;
};

////////////////////////////////////////////////////////////////////////////////
// getInitial
////////////////////////////////////////////////////////////////////////////////

export const getInitial = function (schema) {

  if (schema.hasOwnProperty('initial'))
    return schema.initial;

  let result = undefined;

  if (schema.type === Type.OBJECT || schema.type === Type.GROUP) {

    result = {};
    const properties = schema.properties || {};

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
