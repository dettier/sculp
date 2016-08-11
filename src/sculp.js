////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isObject from 'lodash-compat/lang/isObject';
import isArray from 'lodash-compat/lang/isArray';
import forOwn from 'lodash-compat/object/forOwn';
import each from 'lodash-compat/collection/each';
import omit from 'lodash-compat/object/omit';
import keys from 'lodash-compat/object/keys';
import filter from 'lodash-compat/collection/filter';

import _validate, { PRESENCE_RULE_NAME } from './validate';
import { setValue } from './object/helper';
import { getParentPathsMemoized } from './helper';

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
      validations : {
        ...currentDefaultOptions.validations,
        ...options.validations
      },
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
  // setField
  //////////////////////////////////////////////////////////////////////////////

  setField (path, value) {
    this.setFields({
      [path] : value
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // _getNecessaryChangesComparingWithCache
  //////////////////////////////////////////////////////////////////////////////
  /**
   * Filters changes object removing paths which new values are
   * equal to current values.
   * @param {Object} fieldChanges changes with new values
   */
  _getNecessaryChangesComparingWithCache (fieldChanges) {
    return omit(fieldChanges, (value, key) => {
      return this.CACHE.hasOwnProperty(key) && value === this.CACHE[key];
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // _getFieldsToInvalidateForField
  //////////////////////////////////////////////////////////////////////////////

  _getFieldsToInvalidateForField (field, result, invalidateSubfields = true) {

    // already done
    if (result[field] === 1)
      return;

    result[field] = 1;

    // dependencies
    each(this.dependencyTracker.getDependencies(field), (path) =>
      this._getFieldsToInvalidateForField(path, result));

    // parents
    each(getParentPathsMemoized(field), (path) =>
      this._getFieldsToInvalidateForField(path, result, false));

    // subfields
    if (invalidateSubfields) {
      const val = this.CACHE[field];
      if (isArray(val)) {
        each(val, (v, i) =>
          this._getFieldsToInvalidateForField(`${field}[${i}]`, result));
      } else if (isObject(val)) {
        forOwn(val, (v, k) =>
          this._getFieldsToInvalidateForField(`${field}.${k}`, result));
      }
    }

  }

  //////////////////////////////////////////////////////////////////////////////
  // _clearCacheForFields
  //////////////////////////////////////////////////////////////////////////////

  _clearCacheForFields (fields) {
    each(fields, (path) => {
      // if this path is not in cache
      if (this.CACHE.hasOwnProperty(path) === false)
        return;

      delete this.CACHE[path];

      // is this field have errors we should remove them from ERRORS_CACHE
      if (this.FIELDS_STATE_CACHE[path].errorsCount > 0) {
        const newErrors = filter(this.ERRORS_CACHE, (error) => error.field !== path);
        this.ERRORS_CACHE.splice(0, this.ERRORS_CACHE.length, ...newErrors);
      }

      delete this.FIELDS_STATE_CACHE[path];
      this.dependencyTracker.clearDependencies(path);
    });
  }

  //////////////////////////////////////////////////////////////////////////////
  // _getFieldsToInvalidate
  //////////////////////////////////////////////////////////////////////////////

  _getFieldsToInvalidate (changes) {
    const result = {};
    const paths = keys(changes);
    each(paths, (p) =>
      this._getFieldsToInvalidateForField(p, result));
    return keys(result);
  }

  //////////////////////////////////////////////////////////////////////////////
  // setFields
  //////////////////////////////////////////////////////////////////////////////

  setFields (fields) {
    fields = this._getNecessaryChangesComparingWithCache(fields);

    const paths = keys(fields);

    if (this.dependencyTracker == null) {
      this.CACHE = {};
      this.ERRORS_CACHE = {};
      this.FIELDS_STATE_CACHE = {};
    } else {
      debug('clearing cache');

      const fieldsToInvalidate = this._getFieldsToInvalidate(fields);
      this._clearCacheForFields(fieldsToInvalidate);

      debug('cache cleared %j', fieldsToInvalidate);
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

  getSchemeValue (path, prop) {
    const fieldState = this.getFieldState(path) || {};
    return fieldState[prop];
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
