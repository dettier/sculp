////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashCompatLangIsArray = require('lodash-compat/lang/isArray');

var _lodashCompatLangIsArray2 = _interopRequireDefault(_lodashCompatLangIsArray);

var _lodashCompatArrayUnique = require('lodash-compat/array/unique');

var _lodashCompatArrayUnique2 = _interopRequireDefault(_lodashCompatArrayUnique);

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

var DependencyTracker = (function () {
  function DependencyTracker() {
    _classCallCheck(this, DependencyTracker);

    this.deps = {};
    this.depsRev = {};
  }

  ////////////////////////////////////////////////////////////////////////////////
  // export
  ////////////////////////////////////////////////////////////////////////////////

  _createClass(DependencyTracker, [{
    key: 'clearDependencies',
    value: function clearDependencies(field) {
      var _this = this;

      Object.keys(this.depsRev[field] || {}).forEach(function (f) {
        return delete _this.deps[f][field];
      });
      this.deps[field] = {};
    }
  }, {
    key: 'registerDependency',
    value: function registerDependency(field, dependOn) {
      var v = this.deps[dependOn];
      if (v == null) this.deps[dependOn] = v = {};
      v[field] = 1;

      v = this.depsRev[field];
      if (v == null) this.depsRev[field] = v = {};
      v[dependOn] = 1;
    }
  }, {
    key: '_addDependencies',
    value: function _addDependencies(field, result) {
      if (result.indexOf(field) >= 0) return;

      result.push(field);

      var deps = Object.keys(this.deps[field] || {});

      for (var i = 0; i < deps.length; i++) {
        this._addDependencies(deps[i], result);
      }
    }
  }, {
    key: 'getDependencies',
    value: function getDependencies(fieldOrFields) {
      var result = [];

      var fields = undefined;
      if ((0, _lodashCompatLangIsArray2['default'])(fieldOrFields)) fields = fieldOrFields;else fields = [fieldOrFields];

      for (var i = 0; i < fields.length; i++) {
        this._addDependencies(fields[i], result);
      }return (0, _lodashCompatArrayUnique2['default'])(result);
    }
  }]);

  return DependencyTracker;
})();

exports['default'] = DependencyTracker;
module.exports = exports['default'];