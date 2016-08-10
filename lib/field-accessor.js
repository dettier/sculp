////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getFieldAccessor = getFieldAccessor;

var _utilsPath = require('./utils/path');

var _objectHelper = require('./object/helper');

var _helper = require('./helper');

var _validate = require('./validate');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// getFieldAccessor
////////////////////////////////////////////////////////////////////////////////

function getFieldAccessor(res, path, context) {

  return function (relativePath) {
    var result = undefined;

    if (relativePath === undefined) return res;

    var p = (0, _utilsPath.normalizeMemoized)(relativePath);
    p = (0, _utilsPath.collapseMemoized)(path + p);

    if (p === '' || p === path) {
      result = res;
    } else {
      // register dependency
      var dependencyTracker = context.dependencyTracker;

      if (dependencyTracker != null) dependencyTracker.registerDependency(path, p);

      var _scheme = (0, _helper.getSubScheme)(context.rootScheme, p);
      var _value = (0, _objectHelper.getAndEvaluateValue)(context.rootValue, p);

      // should we run validations?
      var runValidations = context.runValidations && (0, _helper.getRunValidationsForPath)(context.rootScheme, context.rootValue, p);

      var calculateTransformsAndComputes = context.calculateTransformsAndComputes === false ? false : (0, _objectHelper.getValue)(context.rootValue, (0, _helper.getParentPathMemoized)(p)) != null;

      result = (0, _validate.validateField)(_value, _scheme, p, _extends({}, context, {
        calculateTransformsAndComputes: calculateTransformsAndComputes,
        runValidations: runValidations
      }));
    }

    //debug('field accessor value for "%s" + "%s" is %j',
    //  path, relativePath, result);

    return result;
  };
}