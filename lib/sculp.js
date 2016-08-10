////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashCompatObjectOmit = require('lodash-compat/object/omit');

var _lodashCompatObjectOmit2 = _interopRequireDefault(_lodashCompatObjectOmit);

var _lodashCompatObjectKeys = require('lodash-compat/object/keys');

var _lodashCompatObjectKeys2 = _interopRequireDefault(_lodashCompatObjectKeys);

var _lodashCompatCollectionFilter = require('lodash-compat/collection/filter');

var _lodashCompatCollectionFilter2 = _interopRequireDefault(_lodashCompatCollectionFilter);

var _validate2 = require('./validate');

var _validate3 = _interopRequireDefault(_validate2);

var _objectHelper = require('./object/helper');

var _helper = require('./helper');

var _i18nLang = require('./i18n/lang');

var _options = require('./options');

var _dependencyTracker = require('./dependency-tracker');

var _dependencyTracker2 = _interopRequireDefault(_dependencyTracker);

var _error = require('./error');

var _error2 = _interopRequireDefault(_error);

var debug = require('debug')('sculp');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

var Sculp = (function () {

  //////////////////////////////////////////////////////////////////////////////
  // constructor
  //////////////////////////////////////////////////////////////////////////////

  function Sculp(value, scheme) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, Sculp);

    this.options = _extends({}, _options.currentDefaultOptions, options, {
      validations: _extends({}, _options.currentDefaultOptions.validations, options.validations),
      casts: _extends({}, _options.currentDefaultOptions.casts, options.casts),
      castsStrict: _extends({}, _options.currentDefaultOptions.castsStrict, options.castsStrict)
    });
    this._init(value, scheme);
  }

  ////////////////////////////////////////////////////////////////////////////////
  // export
  ////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////
  // _init
  //////////////////////////////////////////////////////////////////////////////

  _createClass(Sculp, [{
    key: '_init',
    value: function _init(value, scheme) {
      this.scheme = scheme;
      this.value = value;

      if (this.options.disableDependencyTracking !== true) this.dependencyTracker = new _dependencyTracker2['default']();else delete this.dependencyTracker;

      this.CACHE = {};
      this.ERRORS_CACHE = [];
      this.FIELDS_STATE_CACHE = {};
    }

    //////////////////////////////////////////////////////////////////////////////
    // getValue
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getValue',
    value: function getValue() {
      return this.value;
    }

    //////////////////////////////////////////////////////////////////////////////
    // setValue
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'setValue',
    value: function setValue(value) {
      this._init(value, this.scheme);
    }

    //////////////////////////////////////////////////////////////////////////////
    // _clearCacheOnFieldsChange
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: '_clearCacheOnFieldsChange',
    value: function _clearCacheOnFieldsChange(fieldsChanged) {
      var _this = this;

      fieldsChanged.forEach(function (p) {
        var allPaths = Object.keys(_this.CACHE);

        var _loop = function (i) {
          var key = allPaths[i];
          if (key === p || (0, _helper.isSubfield)(key, p) || (0, _helper.isSubfield)(p, key)) {
            delete _this.CACHE[key];
            // если в этом поле были ошибки, мы должны удалить их из ERRORS_CACHE
            if (_this.FIELDS_STATE_CACHE[key].errorsCount > 0) {
              var _ERRORS_CACHE;

              var newErrors = (0, _lodashCompatCollectionFilter2['default'])(_this.ERRORS_CACHE, function (error) {
                return error.field !== key;
              });
              (_ERRORS_CACHE = _this.ERRORS_CACHE).splice.apply(_ERRORS_CACHE, [0, _this.ERRORS_CACHE.length].concat(_toConsumableArray(newErrors)));
            }
            delete _this.FIELDS_STATE_CACHE[key];
            _this.dependencyTracker.clearDependencies(key);
          }
        };

        for (var i = 0; i < allPaths.length; i++) {
          _loop(i);
        }
      });
    }

    //////////////////////////////////////////////////////////////////////////////
    // setField
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'setField',
    value: function setField(path, value) {
      this.setFields(_defineProperty({}, path, value));
    }

    //////////////////////////////////////////////////////////////////////////////
    // getNecessaryChangesComparingWithCache
    //////////////////////////////////////////////////////////////////////////////
    /**
     * Функция из объекта с новыми значениями полей уберает все
     * значения, которые равны текущим значениям. Возвращает новый объект.
     * @param {Object} fieldChanges новые значения полей
     */
  }, {
    key: 'getNecessaryChangesComparingWithCache',
    value: function getNecessaryChangesComparingWithCache(fieldChanges) {
      var _this2 = this;

      return (0, _lodashCompatObjectOmit2['default'])(fieldChanges, function (value, key) {
        return _this2.CACHE.hasOwnProperty(key) && value === _this2.CACHE[key];
      });
    }

    //////////////////////////////////////////////////////////////////////////////
    // setFields
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'setFields',
    value: function setFields(fields) {
      var _this3 = this;

      fields = this.getNecessaryChangesComparingWithCache(fields);

      var paths = (0, _lodashCompatObjectKeys2['default'])(fields);

      if (this.dependencyTracker == null) {
        this.CACHE = {};
        this.ERRORS_CACHE = {};
        this.FIELDS_STATE_CACHE = {};
      } else {
        (function () {
          debug('clearing cache');

          var deps = _this3.dependencyTracker.getDependencies(paths);

          paths.forEach(function (path) {
            if (deps.indexOf(path) === -1) deps.push(path);
          });

          _this3._clearCacheOnFieldsChange(deps);

          debug('cache cleared %j', deps);
        })();
      }

      paths.forEach(function (path) {
        return _this3.value = (0, _objectHelper.setValue)(_this3.value, path, fields[path], true);
      });
    }

    //////////////////////////////////////////////////////////////////////////////
    // tryValidate
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'tryValidate',
    value: function tryValidate() {
      var options = this.options;
      (0, _i18nLang.setLanguage)(this.options.lang);

      // this means that there were no changes since last validation
      if (this.CACHE.hasOwnProperty('')) return this.lastResult;

      if (this.dependencyTracker != null) {
        options = _extends({
          dependencyTracker: this.dependencyTracker
        }, options);
      }

      debug('tryValidate');

      var result = (0, _validate3['default'])(this.value, this.scheme, '', _extends({}, options, {
        CACHE: this.CACHE,
        ERRORS_CACHE: this.ERRORS_CACHE,
        FIELD_STATE_CACHE: this.FIELDS_STATE_CACHE
      }));

      var res = {
        result: result,
        errors: [].concat(this.ERRORS_CACHE),
        fieldsState: _extends({}, this.FIELDS_STATE_CACHE)
      };

      this.lastResult = res;

      debug('validated');
      return res;
    }

    //////////////////////////////////////////////////////////////////////////////
    // validate
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'validate',
    value: function validate() {
      var _tryValidate = this.tryValidate();

      var result = _tryValidate.result;
      var errors = _tryValidate.errors;

      if (errors.length > 0) throw new _error2['default'](errors);
      return result;
    }

    //////////////////////////////////////////////////////////////////////////////
    // getFieldState
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getFieldState',
    value: function getFieldState() {
      var path = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      var _tryValidate2 = this.tryValidate();

      var fieldsState = _tryValidate2.fieldsState;

      if (path.length > 0 && path[0] !== '.') path = '.' + path;
      return fieldsState[path];
    }

    //////////////////////////////////////////////////////////////////////////////
    // getSchemeValue
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getSchemeValue',
    value: function getSchemeValue(path, prop) {
      var fieldState = this.getFieldState(path) || {};
      return fieldState[prop];
    }

    //////////////////////////////////////////////////////////////////////////////
    // getFieldName
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getFieldName',
    value: function getFieldName(path) {
      return this.getSchemeValue(path, 'name');
    }

    //////////////////////////////////////////////////////////////////////////////
    // getFieldPresence
    //////////////////////////////////////////////////////////////////////////////

  }, {
    key: 'getFieldPresence',
    value: function getFieldPresence(path) {
      return this.getSchemeValue(path, _validate2.PRESENCE_RULE_NAME);
    }
  }]);

  return Sculp;
})();

exports['default'] = Sculp;
module.exports = exports['default'];