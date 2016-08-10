////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _bind = Function.prototype.bind;
var _slice = Array.prototype.slice;

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _errorPresenter = require('./error-presenter');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

var ValidationError = (function (_Error) {
  _inherits(ValidationError, _Error);

  function ValidationError() {
    var errors = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, ValidationError);

    _get(Object.getPrototypeOf(ValidationError.prototype), 'constructor', this).call(this);
    // защитимся от случая когда забываем написать new
    if (this instanceof ValidationError === false) {
      // eslint-disable-next-line prefer-rest-params
      return new (_bind.apply(ValidationError, [null].concat(_slice.call(arguments))))();
    }

    this.errors = errors;
    this.name = this.constructor.name;
    this.message = (0, _errorPresenter.getValidationErrorMessages)(this.errors)[0];

    // eslint-disable-next-line no-caller, prefer-rest-params
    //const ssf = arguments.callee;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    } else {
      this.stack = new Error().stack;
    }

    return this;
  }

  ////////////////////////////////////////////////////////////////////////////////
  // ValidationError
  ////////////////////////////////////////////////////////////////////////////////

  return ValidationError;
})(Error);

exports['default'] = ValidationError;
module.exports = exports['default'];