////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isSubPath = isSubPath;
exports.normalize = normalize;
exports.collapse = collapse;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashCompatFunctionMemoize = require('lodash-compat/function/memoize');

var _lodashCompatFunctionMemoize2 = _interopRequireDefault(_lodashCompatFunctionMemoize);

var _underscoreStringStartsWith = require('underscore.string/startsWith');

var _underscoreStringStartsWith2 = _interopRequireDefault(_underscoreStringStartsWith);

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// isSubPath
/////////////////////////////////////////////////////////////////////////////////

function isSubPath(ofPath, subpath) {
  return subpath === ofPath || (0, _underscoreStringStartsWith2['default'])(subpath, ofPath + '.') || (0, _underscoreStringStartsWith2['default'])(subpath, ofPath + '[');
}

/////////////////////////////////////////////////////////////////////////////////
// getParentPaths
/////////////////////////////////////////////////////////////////////////////////

var getParentPathsV1 = function getParentPathsV1(path) {
  // positive lookahead чтобы не терялись delimiters
  var fields = path.split(/(?=\.|\.\[|\[\d+\])/);

  var curResult = '';
  var results = [''];
  for (var idx = 0; idx < fields.length; idx++) {
    var field = fields[idx];
    if (field.length > 0) {
      curResult += field;
      results.push(curResult);
    }
  }

  return results;
};

/////////////////////////////////////////////////////////////////////////////////
// getParentPaths2
/////////////////////////////////////////////////////////////////////////////////

/*
const getParentPathsV2 = function (path) {

  const results = [ '' ];
  for (let i = 0; i < path.length; i++) {
    const k = path[i];
    if ((k === '.' || k === '[') && i > 0) {
      results.push(path.slice(0, i));
    }
  }

  results.push(path);
  return results;
};
*/

/////////////////////////////////////////////////////////////////////////////////
// getParentPaths
/////////////////////////////////////////////////////////////////////////////////
// Для пути .a.b[3].d возвращает [ '', '.a', '.a.b', '.a.b[3]', '.a.b[3].d' ]
// По производительности одна фигня обе версии:
// http://jsperf.com/getparentpaths-v1-vs-v2

exports.getParentPaths = getParentPathsV1;

/////////////////////////////////////////////////////////////////////////////////
// normalize
/////////////////////////////////////////////////////////////////////////////////

// Функция удостоверяет что путь начинается либо с ".property",
// либо c "[index]", заканчивается без точки и нет подряд идущих точек

function normalize(path) {
  if (path == null) return undefined;

  path = path.trim();
  path = path.replace(/\.*$/, '');
  path = path.replace(/\.{2,}/g, '.');
  path = (path.length > 0 && path[0] !== '.' && path[0] !== '[' ? '.' : '') + path;
  return path;
}

var normalizeMemoized = (0, _lodashCompatFunctionMemoize2['default'])(normalize);

exports.normalizeMemoized = normalizeMemoized;
/////////////////////////////////////////////////////////////////////////////////
// collapse
/////////////////////////////////////////////////////////////////////////////////

function collapse(path) {
  if (path == null) return undefined;

  path = exports.normalize(path);
  path = path.replace(/\.\[/g, '[');
  path = path.replace(/^.*\^{2}/g, '');

  // удаляем значения типа photos.^ так как это возвращение на тот же уровень
  var re = /(\.+\w+|\[\d+\]|^)\.+\^/;
  while (re.test(path)) {
    path = path.replace(re, '');
  }

  return path;
}

var collapseMemoized = (0, _lodashCompatFunctionMemoize2['default'])(collapse);
exports.collapseMemoized = collapseMemoized;