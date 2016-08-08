////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import {
  normalizeMemoized,
  collapseMemoized
} from './utils/path';

import { getValue, getAndEvaluateValue } from './object/helper';

import {
  getSubScheme,
  getParentPathMemoized,
  getRunValidationsForPath
} from './helper';

import { validateField } from './validate';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// getFieldAccessor
////////////////////////////////////////////////////////////////////////////////

export function getFieldAccessor (res, path, context) {

  return function (relativePath) {
    let result;

    if (relativePath === undefined)
      return res;

    let p = normalizeMemoized(relativePath);
    p = collapseMemoized(path + p);

    if (p === '' || p === path) {
      result = res;
    } else {
      // register dependency
      const { dependencyTracker } = context;
      if (dependencyTracker != null)
        dependencyTracker.registerDependency(path, p);

      const _scheme = getSubScheme(context.rootScheme, p);
      const _value = getAndEvaluateValue(context.rootValue, p);

      // should we run validations?
      const runValidations =
        context.runValidations &&
        getRunValidationsForPath(context.rootScheme, context.rootValue, p);

      const calculateTransformsAndComputes =
          context.calculateTransformsAndComputes === false ? false :
          getValue(context.rootValue, getParentPathMemoized(p)) != null;

      result = validateField(_value, _scheme, p, {
        ...context,
        calculateTransformsAndComputes,
        runValidations
      });
    }

    //debug('field accessor value for "%s" + "%s" is %j',
    //  path, relativePath, result);

    return result;
  };
}
