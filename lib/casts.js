////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isNumber from 'lodash-compat/lang/isNumber';
import isBoolean from 'lodash-compat/lang/isBoolean';
import isDate from 'lodash-compat/lang/isDate';
import isString from 'lodash-compat/lang/isString';
import isObject from 'lodash-compat/lang/isObject';
import isArray from 'lodash-compat/lang/isArray';

import { TYPE, CAST_ERROR } from './enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// CASTS
////////////////////////////////////////////////////////////////////////////////

const CASTS = {

  // STRING ORIGINAL
  [TYPE.STRING_ORG] (v) {
    if (isString(v) || isNumber(v) || isBoolean(v) || isDate())
      return v.toString();

    return CAST_ERROR;
  },

  // STRING NOT EMPTY TRIMMED
  [TYPE.STRING] (v) {
    let res = CASTS[TYPE.STRING_ORG](v);

    if (res === CAST_ERROR)
      return res;

    if (isString(res)) {
      res = res.trim();
      if (res === '')
        res = undefined;
    }
    return res;
  },

  [TYPE.NUMBER] (v) {
    if (isNumber(v)) {
      if (isNaN(v))
        return CAST_ERROR;
      return v;
    }
    if (isString(v))
      return CASTS[TYPE.NUMBER](+v);

    return CAST_ERROR;
  },

  [TYPE.DATE] (v) {
    if (isDate(v))
      return v;

    if (isString(v)) {
      const n = +v;
      if (isNaN(n) === false)
        v = n;
      else
        v = Date.parse(v);
    }

    if (isNumber(v) && isNaN(v) === false) {
      return new Date(v);
    }

    return CAST_ERROR;
  },

  [TYPE.BOOLEAN] (v) {
    if (isBoolean(v))
      return v;

    const isValueString = isString(v);
    if (isValueString || isNumber(v)) {
      if (isValueString)
        v = v.trim().toLowerCase();

      if (v === 'true' || v === 't' || v === '1' || v === 1)
        return true;

      if (v === 'false' || v === 'f' || v === '0' || v === '' || v === 0)
        return false;
    }

    return CAST_ERROR;
  },

  [TYPE.ANY_VALUE] (v) {
    return v;
  },

  [TYPE.ANY_OBJECT] (v) {
    if (isObject(v) && !isArray(v))
      return v;
    return CAST_ERROR;
  }

};

export default CASTS;
