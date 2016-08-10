////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.hasGetValue = hasGetValue;
exports.hasValue = hasValue;
exports.getValue = getValue;
exports.getAndEvaluateValue = getAndEvaluateValue;
exports.removeValue = removeValue;
exports.setValue = setValue;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatLangIsNumber = require('lodash-compat/lang/isNumber');

var _lodashCompatLangIsNumber2 = _interopRequireDefault(_lodashCompatLangIsNumber);

var _lodashCompatLangIsFunction = require('lodash-compat/lang/isFunction');

var _lodashCompatLangIsFunction2 = _interopRequireDefault(_lodashCompatLangIsFunction);

var _lodashCompatObjectResult = require('lodash-compat/object/result');

var _lodashCompatObjectResult2 = _interopRequireDefault(_lodashCompatObjectResult);

var _lodashCompatFunctionMemoize = require('lodash-compat/function/memoize');

var _lodashCompatFunctionMemoize2 = _interopRequireDefault(_lodashCompatFunctionMemoize);

var _underscoreStringRtrim = require('underscore.string/rtrim');

var _underscoreStringRtrim2 = _interopRequireDefault(_underscoreStringRtrim);

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// getFieldsPathArray
/////////////////////////////////////////////////////////////////////////////////

var getFieldsPathArray = function getFieldsPathArray(path) {
  if (path[0] === '.' || path[0] === '[') {
    path = path.slice(1);
  }

  if (path === '') {
    return [];
  }

  var fields = path.split(/[\.\[]/);

  for (var idx = 0; idx < fields.length; idx++) {
    var field = fields[idx];
    if (field[field.length - 1] === ']') {
      fields[idx] = +(0, _underscoreStringRtrim2['default'])(field, ']');
    }
  }

  return fields;
};

var getFieldsPathArrayMemoized = (0, _lodashCompatFunctionMemoize2['default'])(getFieldsPathArray);

exports.getFieldsPathArray = getFieldsPathArray;

/////////////////////////////////////////////////////////////////////////////////
// hasGetValue
/////////////////////////////////////////////////////////////////////////////////

function hasGetValue(object) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  //fields = path.split(/[\.(\.\[)\[\]]/)
  var fields = getFieldsPathArrayMemoized(path);

  var prevObject = object;
  for (var idx = 0; idx < fields.length; idx++) {
    var field = fields[idx];
    if (!prevObject) {
      return { has: false };
    }

    if (idx === fields.length - 1) {
      var has = prevObject != null && prevObject.hasOwnProperty(field);
      if (!has) {
        return { has: false };
      } else {
        return {
          has: true,
          value: prevObject[field]
        };
      }
    } else {
      prevObject = prevObject && prevObject[field];
    }
  }

  // тут только если путь пустой оказался
  if (!(object != null)) {
    return { has: false };
  }

  return {
    has: true,
    value: object
  };
}

/////////////////////////////////////////////////////////////////////////////////
// hasValue
/////////////////////////////////////////////////////////////////////////////////

function hasValue(object) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  return hasGetValue(object, path).has;
}

/////////////////////////////////////////////////////////////////////////////////
// getValue
/////////////////////////////////////////////////////////////////////////////////

function getValue(object) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  //fields = path.split(/[\.(\.\[)\[\]]/)
  var fields = getFieldsPathArrayMemoized(path);

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    object = object && object[field];
  }

  return object;
}

/////////////////////////////////////////////////////////////////////////////////
// getAndEvaluateValue
/////////////////////////////////////////////////////////////////////////////////

function getAndEvaluateValue(object) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  //fields = path.split(/[\.(\.\[)\[\]]/)
  var fields = getFieldsPathArrayMemoized(path);

  if ((0, _lodashCompatLangIsFunction2['default'])(object)) {
    object = object();
  }

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if ((0, _lodashCompatLangIsFunction2['default'])(object && object.get)) {
      object = object.get(field);
    } else {
      object = (0, _lodashCompatObjectResult2['default'])(object, field);
    }
  }

  // для поддержки backbone
  if ((0, _lodashCompatLangIsFunction2['default'])(object && object.toJSON)) {
    object = object.toJSON();
  }

  return object;
}

/////////////////////////////////////////////////////////////////////////////////
// removeValue
/////////////////////////////////////////////////////////////////////////////////

function removeValue(object) {
  var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  return exports.setValue(object, path, undefined, true);
}

/////////////////////////////////////////////////////////////////////////////////
// setValue
/////////////////////////////////////////////////////////////////////////////////

function setValue(object, path, newValue) {
  if (path === undefined) path = '';
  var remove = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
  var options = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

  if (path === '') {
    return newValue;
  }

  if (options.createObject == null) {
    options.createObject = function () {
      return {};
    };
  }
  if (options.createArray == null) {
    options.createArray = function () {
      return [];
    };
  }

  var fields = getFieldsPathArrayMemoized(path);

  // если устанавливаем undefined на undefined
  if (!(object != null) && !(newValue != null) && remove === true) {
    return object;
  }

  // если object === undefined
  if (fields.length > 0 && !(object != null)) {
    if ((0, _lodashCompatLangIsNumber2['default'])(fields[0])) {
      object = options.createArray();
    } else {
      object = options.createObject();
    }
  }

  var cursor = object;

  for (var idx = 0; idx < fields.length; idx++) {
    var field = fields[idx];
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
        var nextField = fields[idx + 1];
        if ((0, _lodashCompatLangIsNumber2['default'])(nextField)) {
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