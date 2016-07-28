////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isNumber from 'lodash-compat/lang/isNumber';
import isFunction from 'lodash-compat/lang/isFunction';
import result from 'lodash-compat/object/result';
import memoize from 'lodash-compat/function/memoize';

import rtrim from 'underscore.string/rtrim';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// getFieldsPathArray
/////////////////////////////////////////////////////////////////////////////////

const getFieldsPathArray = function (path) {
  if (path[0] === '.' || path[0] === '[') {
    path = path.slice(1);
  }

  if (path === '') {
    return [];
  }

  const fields = path.split(/[\.\[]/);

  for (let idx = 0; idx < fields.length; idx++) {
    const field = fields[idx];
    if (field[field.length - 1] === ']') {
      fields[idx] = +(rtrim(field, ']'));
    }
  }

  return fields;
};

const getFieldsPathArrayMemoized = memoize(getFieldsPathArray);

export { getFieldsPathArray };

/////////////////////////////////////////////////////////////////////////////////
// hasGetValue
/////////////////////////////////////////////////////////////////////////////////

export function hasGetValue (object, path = '') {

  //fields = path.split(/[\.(\.\[)\[\]]/)
  const fields = getFieldsPathArrayMemoized(path);

  let prevObject = object;
  for (let idx = 0; idx < fields.length; idx++) {
    const field = fields[idx];
    if (!prevObject) {
      return { has : false };
    }

    if (idx === fields.length - 1) {
      const has = (prevObject != null) && prevObject.hasOwnProperty(field);
      if (!has) {
        return { has : false };
      } else {
        return {
          has : true,
          value : prevObject[field]
        };
      }
    } else {
      prevObject = prevObject && prevObject[field];
    }
  }

  // тут только если путь пустой оказался
  if (!(object != null)) {
    return { has : false };
  }

  return {
    has : true,
    value : object
  };
}

/////////////////////////////////////////////////////////////////////////////////
// hasValue
/////////////////////////////////////////////////////////////////////////////////

export function hasValue (object, path = '') {
  return hasGetValue(object, path).has;
}

/////////////////////////////////////////////////////////////////////////////////
// getValue
/////////////////////////////////////////////////////////////////////////////////

export function getValue (object, path = '') {

  //fields = path.split(/[\.(\.\[)\[\]]/)
  const fields = getFieldsPathArrayMemoized(path);

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    object = object && object[field];
  }

  return object;
}

/////////////////////////////////////////////////////////////////////////////////
// getAndEvaluateValue
/////////////////////////////////////////////////////////////////////////////////

export function getAndEvaluateValue (object, path = '') {

  //fields = path.split(/[\.(\.\[)\[\]]/)
  const fields = getFieldsPathArrayMemoized(path);

  if (isFunction(object)) {
    object = object();
  }

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (isFunction(object && object.get)) {
      object = object.get(field);
    } else {
      object = result(object, field);
    }
  }

  // для поддержки backbone
  if (isFunction(object && object.toJSON)) {
    object = object.toJSON();
  }

  return object;
}

/////////////////////////////////////////////////////////////////////////////////
// removeValue
/////////////////////////////////////////////////////////////////////////////////

export function removeValue (object, path = '') {
  return exports.setValue(object, path, undefined, true);
}

/////////////////////////////////////////////////////////////////////////////////
// setValue
/////////////////////////////////////////////////////////////////////////////////

export function setValue (object, path = '', newValue,
                          remove = false, options = {}) {

  if (path === '') {
    return newValue;
  }

  if (options.createObject == null) { options.createObject = () => ({}); }
  if (options.createArray == null) { options.createArray = () => []; }

  const fields = getFieldsPathArrayMemoized(path);

  // если устанавливаем undefined на undefined
  if (!(object != null) && !(newValue != null) && remove === true) {
    return object;
  }

  // если object === undefined
  if (fields.length > 0 && !(object != null)) {
    if (isNumber(fields[0])) {
      object = options.createArray();
    } else {
      object = options.createObject();
    }
  }

  let cursor = object;

  for (let idx = 0; idx < fields.length; idx++) {
    const field = fields[idx];
    if (field.length !== 0) {
      if (idx === fields.length - 1) {
        if (!(newValue != null) && remove === true) {
          delete cursor[field];
        } else {
          cursor[field] = newValue;
        }
        break;
      }

      if (!cursor[field]) {
        if (!(newValue != null) && remove === true) {
          break;
        }
        const nextField = fields[idx + 1];
        if (isNumber(nextField)) {
          cursor[field] = options.createArray();
        } else {
          cursor[field] = options.createObject();
        }
      }

      cursor = cursor[field];
    }
  }

  return object;
}
