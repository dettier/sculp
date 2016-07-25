////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import omit from 'lodash-compat/object/omit';
import keys from 'lodash-compat/object/keys';
import filter from 'lodash-compat/collection/filter';

import _validate, { PRESENCE_RULE_NAME } from './validate';
import { setValue } from './object/helper';
import {
  getInitial as _getInitial,
  isSubfield
} from './helper';

import DependencyTracker from './dependency-tracker';
import ValidationError from './error';

const debug = require('debug')('schemer');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

class Schemer {

  constructor (value, scheme, options = {}) {
    this.options = options;
    this.init(value, scheme);
  }

  init (value, scheme) {
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

  getValue () {
    return this.value;
  }

  setValue (value) {
    this.init(value, this.scheme);
  }

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

  setField (path, value) {
    this.setFields({
      [path] : value
    });
  }

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

  validate (path = '', options = {}) {
    if (this.dependencyTracker != null) {
      options = {
        dependencyTracker : this.dependencyTracker,
        ...options
      };
    }

    debug('validate %s', path);

    const { result, fromCache } = _validate(
      this.value, this.scheme, path, {
        ...this.options,
        ...options,
        CACHE : this.CACHE,
        ERRORS_CACHE : this.ERRORS_CACHE,
        FIELD_STATE_CACHE : this.FIELDS_STATE_CACHE
      });

    let res;
    if (fromCache) {
      res = this.lastResult;
    } else {
      res = {
        result,
        errors : [].concat(this.ERRORS_CACHE),
        fieldsState : { ...this.FIELDS_STATE_CACHE }
      };
      this.lastResult = res;
    }

    debug('validated %s', path);
    return res;
  }

  validateSync (path = '', options = {}) {
    const { result, errors } = this.validate(path, options);
    if (errors.length > 0)
      throw new ValidationError(errors);
    return result;
  }

  getRuleValue (path, rule) {
    const { fieldsState } = this.validate(path);

    const fieldState = fieldsState[path] || {};
    return fieldState[rule];
  }

  getFieldName (path) {
    return this.getRuleValue(path, 'name');
  }

  getFieldPresence (path) {
    return this.getRuleValue(path, PRESENCE_RULE_NAME);
  }

}

////////////////////////////////////////////////////////////////////////////////
// validate static
////////////////////////////////////////////////////////////////////////////////

function validate (value, scheme, path = '', options = {}) {
  const schemer = new Schemer(value, scheme, { disableDependencyTracking : true });
  return schemer.validate(path, options);
}

Schemer.validate = validate;

////////////////////////////////////////////////////////////////////////////////
// validateSync static
////////////////////////////////////////////////////////////////////////////////

function validateSync (value, scheme, path = '', options = {}) {
  const schemer = new Schemer(value, scheme, { disableDependencyTracking : true });
  return schemer.validateSync(path, options);
}

Schemer.validateSync = validateSync;

////////////////////////////////////////////////////////////////////////////////
// getRuleValue static
////////////////////////////////////////////////////////////////////////////////

function getRuleValue (scheme, value, path, rule) {
  const schemer = new Schemer(value, scheme, { disableDependencyTracking : true });
  return schemer.getRuleValue(path, rule);
}

Schemer.getRuleValue = getRuleValue;

////////////////////////////////////////////////////////////////////////////////
// getFieldName static
////////////////////////////////////////////////////////////////////////////////

function getFieldName (scheme, value, path) {
  const schemer = new Schemer(value, scheme, { disableDependencyTracking : true });
  return schemer.getFieldName(path);
}

Schemer.getFieldName = getFieldName;

////////////////////////////////////////////////////////////////////////////////
// getFieldPresence static
////////////////////////////////////////////////////////////////////////////////

function getFieldPresence (scheme, value, path) {
  const schemer = new Schemer(value, scheme, { disableDependencyTracking : true });
  return schemer.getFieldPresence(path);
}

Schemer.getFieldPresence = getFieldPresence;

////////////////////////////////////////////////////////////////////////////////
// getInitial static
////////////////////////////////////////////////////////////////////////////////

Schemer.getInitial = function (scheme) {
  return _getInitial(scheme);
};

////////////////////////////////////////////////////////////////////////////////
// ValidationError
////////////////////////////////////////////////////////////////////////////////

Schemer.ValidationError = ValidationError;

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export default Schemer;
