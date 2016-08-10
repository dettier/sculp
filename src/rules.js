////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isObject from 'lodash-compat/lang/isObject';
import isFunction from 'lodash-compat/lang/isFunction';

import { getFieldAccessor } from './field-accessor';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// getRuleValue
////////////////////////////////////////////////////////////////////////////////

export function getRuleValue (ruleValue, res, path, context) {

  if (isFunction(ruleValue)) {
    const fa = getFieldAccessor(res, path, context);
    ruleValue = ruleValue(fa);
    return getRuleValue(ruleValue, res, path, context);
  } else if (isObject(ruleValue) && ruleValue.value != null) {
    return getRuleValue(ruleValue.value, res, path, context);
  }
  return ruleValue;
}

////////////////////////////////////////////////////////////////////////////////
// getRuleErrorMessage
////////////////////////////////////////////////////////////////////////////////

export const getRuleErrorMessage = (ruleValue, res, path, context) => {
  if (isFunction(ruleValue)) {
    const fa = getFieldAccessor(res, path, context);
    ruleValue = ruleValue(fa);
    return getRuleErrorMessage(ruleValue, res, path, context);
  } else if (isObject(ruleValue) && (ruleValue.message != null)) {
    return ruleValue.message;
  }
  return undefined;
};
