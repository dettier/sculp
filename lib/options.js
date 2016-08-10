////////////////////////////////////////////////////////////////////////////////
// DEFAULT_OPTIONS
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.setDefaultOptions = setDefaultOptions;
var DEFAULT_OPTIONS = {
  strict: false, // use strict casts or not
  extendFieldStatesWithScheme: false,
  extendFieldStatesWithValues: false,
  extendArrayStatesWithItemStates: false,
  extendFieldStatesWithErrors: false,
  fixFailedValuesValidation: false,
  calculateTransformsAndComputes: true,
  preserveEmptyArrayItems: false,
  removeEmpty: false,
  removeInitial: false,
  validations: {},
  casts: {},
  castsStrict: {},
  lang: 'en'
};

////////////////////////////////////////////////////////////////////////////////
// currentDefaultOptions
////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line import/no-mutable-exports
var currentDefaultOptions = DEFAULT_OPTIONS;

exports.currentDefaultOptions = currentDefaultOptions;
////////////////////////////////////////////////////////////////////////////////
// setDefaultOptions
////////////////////////////////////////////////////////////////////////////////

function setDefaultOptions(options) {
  exports.currentDefaultOptions = currentDefaultOptions = _extends({}, currentDefaultOptions, options);
}