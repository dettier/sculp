////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import omit from 'lodash-compat/object/omit';
import keys from 'lodash-compat/object/keys';
import filter from 'lodash-compat/collection/filter';

import _validate, { PRESENCE_RULE_NAME } from './validate';
import { setValue } from './object/helper';
import { isSubfield } from './helper';

import { setLanguage } from './i18n/lang';
import { currentDefaultOptions } from './options';

import DependencyTracker from './dependency-tracker';
import ValidationError from './error';

const debug = require('debug')('sculp');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

class Sculp {

  //////////////////////////////////////////////////////////////////////////////
  // constructor
  //////////////////////////////////////////////////////////////////////////////

  constructor (value, scheme, options = {}) {
    this.options = {
      ...currentDefaultOptions,
      ...options,
      casts : {
        ...currentDefaultOptions.casts,
        ...options.casts
      },
      castsStrict : {
        ...currentDefaultOptions.castsStrict,
        ...options.castsStrict
      }
    };
    this._init(value, scheme);
  }

  //////////////////////////////////////////////////////////////////////////////
  // _init
  //////////////////////////////////////////////////////////////////////////////

  _init (value, scheme) {
    this.scheme = scheme;
    this.value = value;

    if (this.options.disableDependencyTracking !== true)
      this.dependencyTracker = new DependencyTracker();
    else
      delete this.dependencyTracker;

    this.CACHE = {};
    this.ERRORS_CACHE = [];
    this.FIELDS_STATE_CACHE = {};
  }

  //////////////////////////////////////////////////////////////////////////////
  // getValue
  //////////////////////////////////////////////////////////////////////////////

  getValue () {
    return this.value;
  }

  //////////////////////////////////////////////////////////////////////////////
  // setValue
  //////////////////////////////////////////////////////////////////////////////

  setValue (value) {
    this._init(value, this.scheme);
  }

  //////////////////////////////////////////////////////////////////////////////
  // _clearCacheOnFieldsChange
  //////////////////////////////////////////////////////////////////////////////

  _clearCacheOnFieldsChange (fieldsChanged) {
    fieldsChanged.forEach((p) => {
      const allPaths = Object.keys(this.CACHE);
      for (let i = 0; i < allPaths.length; i++) {
        const key = allPaths[i];
        if (key === p || isSubfield(key, p) || isSubfield(p, key)) {
          delete this.CACHE[key];
          // если в этом поле были ошибки, мы должны удалить их из ERRORS_CACHE
          if (this.FIELDS_STATE_CACHE[key].errorsCount > 0) {
            const newErrors = filter(this.ERRORS_CACHE, (error) => error.field !== key);
            this.ERRORS_CACHE.splice(0, this.ERRORS_CACHE.length, ...newErrors);
          }
          delete this.FIELDS_STATE_CACHE[key];
          this.dependencyTracker.clearDependencies(key);
        }
      }
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // setField
  //////////////////////////////////////////////////////////////////////////////

  setField (path, value) {
    this.setFields({
      [path] : value
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // getNecessaryChangesComparingWithCache
  //////////////////////////////////////////////////////////////////////////////
  /**
   * Функция из объекта с новыми значениями полей уберает все
   * значения, которые равны текущим значениям. Возвращает новый объект.
   * @param {Object} fieldChanges новые значения полей
   */
  getNecessaryChangesComparingWithCache (fieldChanges) {
    return omit(fieldChanges, (value, key) => {
      return this.CACHE.hasOwnProperty(key) && value === this.CACHE[key];
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // setFields
  //////////////////////////////////////////////////////////////////////////////

  setFields (fields) {
    fields = this.getNecessaryChangesComparingWithCache(fields);

    const paths = keys(fields);

    if (this.dependencyTracker == null) {
      this.CACHE = {};
      this.ERRORS_CACHE = {};
      this.FIELDS_STATE_CACHE = {};
    } else {
      debug('clearing cache');

      const deps = this.dependencyTracker.getDependencies(paths);

      paths.forEach(path => {
        if (deps.indexOf(path) === -1)
          deps.push(path);
      });

      this._clearCacheOnFieldsChange(deps);

      debug('cache cleared %j', deps);
    }

    paths.forEach(path =>
      this.value = setValue(this.value, path, fields[path], true));
  }

  //////////////////////////////////////////////////////////////////////////////
  // tryValidate
  //////////////////////////////////////////////////////////////////////////////

  tryValidate () {
    let options = this.options;
    setLanguage(this.options.lang);

    // this means that there were no changes since last validation
    if (this.CACHE.hasOwnProperty(''))
      return this.lastResult;

    if (this.dependencyTracker != null) {
      options = {
        dependencyTracker : this.dependencyTracker,
        ...options
      };
    }

    debug('tryValidate');

    const result = _validate(
      this.value, this.scheme, '', {
        ...options,
        CACHE : this.CACHE,
        ERRORS_CACHE : this.ERRORS_CACHE,
        FIELD_STATE_CACHE : this.FIELDS_STATE_CACHE
      });

    const res = {
      result,
      errors : [].concat(this.ERRORS_CACHE),
      fieldsState : { ...this.FIELDS_STATE_CACHE }
    };

    this.lastResult = res;

    debug('validated');
    return res;
  }

  //////////////////////////////////////////////////////////////////////////////
  // validate
  //////////////////////////////////////////////////////////////////////////////

  validate () {
    const { result, errors } = this.tryValidate();
    if (errors.length > 0)
      throw new ValidationError(errors);
    return result;
  }

  //////////////////////////////////////////////////////////////////////////////
  // getFieldState
  //////////////////////////////////////////////////////////////////////////////

  getFieldState (path = '') {
    const { fieldsState } = this.tryValidate();
    if (path.length > 0 && path[0] !== '.')
      path = '.' + path;
    return fieldsState[path];
  }

  //////////////////////////////////////////////////////////////////////////////
  // getSchemeValue
  //////////////////////////////////////////////////////////////////////////////

  getSchemeValue (path, rule) {
    const fieldState = this.getFieldState(path) || {};
    return fieldState[rule];
  }

  //////////////////////////////////////////////////////////////////////////////
  // getFieldName
  //////////////////////////////////////////////////////////////////////////////

  getFieldName (path) {
    return this.getSchemeValue(path, 'name');
  }

  //////////////////////////////////////////////////////////////////////////////
  // getFieldPresence
  //////////////////////////////////////////////////////////////////////////////

  getFieldPresence (path) {
    return this.getSchemeValue(path, PRESENCE_RULE_NAME);
  }

}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export default Sculp;
