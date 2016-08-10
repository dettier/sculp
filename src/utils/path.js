////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import memoize from 'lodash-compat/function/memoize';
import startsWith from 'underscore.string/startsWith';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// isSubPath
/////////////////////////////////////////////////////////////////////////////////

export function isSubPath (ofPath, subpath) {
  return subpath === ofPath ||
    startsWith(subpath, ofPath + '.') ||
    startsWith(subpath, ofPath + '[');
}

/////////////////////////////////////////////////////////////////////////////////
// getParentPaths
/////////////////////////////////////////////////////////////////////////////////

const getParentPathsV1 = function (path) {
  // positive lookahead чтобы не терялись delimiters
  const fields = path.split(/(?=\.|\.\[|\[\d+\])/);

  let curResult = '';
  const results = [''];
  for (let idx = 0; idx < fields.length; idx++) {
    const field = fields[idx];
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

export { getParentPathsV1 as getParentPaths };

/////////////////////////////////////////////////////////////////////////////////
// normalize
/////////////////////////////////////////////////////////////////////////////////

// Функция удостоверяет что путь начинается либо с ".property",
// либо c "[index]", заканчивается без точки и нет подряд идущих точек

export function normalize (path) {
  if (path == null)
    return undefined;

  path = path.trim();
  path = path.replace(/\.*$/, '');
  path = path.replace(/\.{2,}/g, '.');
  path = (path.length > 0 && path[0] !== '.' && path[0] !== '[' ? '.' : '') + path;
  return path;
}

export const normalizeMemoized = memoize(normalize);

/////////////////////////////////////////////////////////////////////////////////
// collapse
/////////////////////////////////////////////////////////////////////////////////

export function collapse (path) {
  if (path == null)
    return undefined;

  path = exports.normalize(path);
  path = path.replace(/\.\[/g, '[');
  path = path.replace(/^.*\^{2}/g, '');

  // удаляем значения типа photos.^ так как это возвращение на тот же уровень
  const re = /(\.+\w+|\[\d+\]|^)\.+\^/;
  while (re.test(path)) {
    path = path.replace(re, '');
  }

  return path;
}

export const collapseMemoized = memoize(collapse);

