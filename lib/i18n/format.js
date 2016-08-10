////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _underscoreStringCapitalize = require('underscore.string/capitalize');

var _underscoreStringCapitalize2 = _interopRequireDefault(_underscoreStringCapitalize);

var _lodashCompatStringTemplate = require('lodash-compat/string/template');

var _lodashCompatStringTemplate2 = _interopRequireDefault(_lodashCompatStringTemplate);

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

function format(string, data) {
  var _capitalize = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  var str = (0, _lodashCompatStringTemplate2['default'])(string)(data);
  return _capitalize ? (0, _underscoreStringCapitalize2['default'])(str) : str;
}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

exports['default'] = format;
module.exports = exports['default'];