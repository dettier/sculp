////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import forOwn from 'lodash-compat/object/forOwn';
import each from 'lodash-compat/collection/each';
import omit from 'lodash-compat/object/omit';
import keys from 'lodash-compat/object/keys';
import filter from 'lodash-compat/collection/filter';
import memoize from 'lodash-compat/function/memoize';

import { Type } from './enums';

import _validate, { PRESENCE_RULE_NAME } from './validate';
import { setValue } from './object/helper';
import {
  getParentPathsMemoized,
  getSubSchema,
  getSubSchemaHandlingPseudoFields } from './helper';

import { setMessages } from './lang';
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

  constructor (value, schema, options = {}) {
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
    this._init(value, schema);
  }

  //////////////////////////////////////////////////////////////////////////////
  // _init
  //////////////////////////////////////////////////////////////////////////////

  _init (value, schema) {
    this.schema = schema;
    this.value = value;
    this.getSubSchema = memoize(this.getSubSchema);

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
    this._init(value, this.schema);
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
  // _getSchemaForPath
  //////////////////////////////////////////////////////////////////////////////

  getSubSchema (path) {
    return getSubSchema(this.schema, path);
  }

  // old function name
  getSubScheme (...args) {
    return this.getSubSchema(...args);
  }

  //////////////////////////////////////////////////////////////////////////////
  // _clearCacheForField
  //////////////////////////////////////////////////////////////////////////////

  _clearCacheForField (path, schema,
                       invalidateSubfields = true) {

    // if this path is not in cache
    if (this.CACHE.hasOwnProperty(path) === false)
      return;

    const val = this.CACHE[path];
    delete this.CACHE[path];

    // is this field have errors we should remove them from ERRORS_CACHE
    if (this.FIELDS_STATE_CACHE[path].errorsCount > 0) {
      const newErrors = filter(this.ERRORS_CACHE, (error) => error.field !== path);
      this.ERRORS_CACHE.splice(0, this.ERRORS_CACHE.length, ...newErrors);
    }

    delete this.FIELDS_STATE_CACHE[path];

    // clear dependencies
    each(this.dependencyTracker.getDependencies(path), (p) =>
      this._clearCacheForField(p));

    // clear parents
    each(getParentPathsMemoized(path), (p) =>
      this._clearCacheForField(p, false));

    // clear subfields
    if (invalidateSubfields) {
      if (schema == null)
        schema = getSubSchemaHandlingPseudoFields(this.schema, path);

      if (schema != null) {
        if (schema.type === Type.ARRAY) {
          // we need to invalidate pseudo-path for array item
          this._clearCacheForField(`${path}.items`, schema.items);
          // invalidating array items
          each(val, (v, i) => this._clearCacheForField(`${path}[${i}]`, schema.items));
        } else if (schema.type === Type.OBJECT || schema.type === Type.GROUP) {
          // invalidating object properties
          forOwn(schema.properties, (v, k) =>
            this._clearCacheForField(`${path}.${k}`, v));
        }
      }
    }

    this.dependencyTracker.clearDependencies(path);
  }

  //////////////////////////////////////////////////////////////////////////////
  // _clearCacheForFields
  //////////////////////////////////////////////////////////////////////////////

  _clearCacheForFields (fields) {
    each(fields, (path) =>
      this._clearCacheForField(path));
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

      this._clearCacheForFields(paths);

      debug('cache cleared %j', paths);
    }

    paths.forEach(path =>
      this.value = setValue(this.value, path, fields[path], true));
  }

  //////////////////////////////////////////////////////////////////////////////
  // tryValidate
  //////////////////////////////////////////////////////////////////////////////

  tryValidate () {
    let options = this.options;
    setMessages(this.options.messages);

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
      this.value, this.schema, '', {
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
  // getErrors
  //////////////////////////////////////////////////////////////////////////////

  getErrors (path = '') {
    if (path !== '' && this.options.extendFieldStatesWithErrors !== true)
      throw new Error('Use extendFieldStatesWithErrors option to get errors for specific fields');

    if (path === '')
      return this.tryValidate().errors;
    else
      return this.getFieldState(path).errors;
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
  // getSchemaValue
  //////////////////////////////////////////////////////////////////////////////

  getSchemaValue (path, prop) {
    const fieldState = this.getFieldState(path) || {};
    return fieldState[prop];
  }

  // old function name
  getSchemeValue (...args) {
    return this.getSchemaValue(...args);
  }

  //////////////////////////////////////////////////////////////////////////////
  // getFieldName
  //////////////////////////////////////////////////////////////////////////////

  getFieldName (path) {
    return this.getSchemaValue(path, 'name');
  }

  //////////////////////////////////////////////////////////////////////////////
  // getFieldPresence
  //////////////////////////////////////////////////////////////////////////////

  getFieldPresence (path) {
    return this.getSchemaValue(path, PRESENCE_RULE_NAME);
  }

}

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export default Sculp;
