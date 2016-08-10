////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _i18nLang = require('./i18n/lang');

var _lodashCompatLangIsRegExp = require('lodash-compat/lang/isRegExp');

var _lodashCompatLangIsRegExp2 = _interopRequireDefault(_lodashCompatLangIsRegExp);

var _lodashCompatLangIsNumber = require('lodash-compat/lang/isNumber');

var _lodashCompatLangIsNumber2 = _interopRequireDefault(_lodashCompatLangIsNumber);

var _lodashCompatCollectionContains = require('lodash-compat/collection/contains');

var _lodashCompatCollectionContains2 = _interopRequireDefault(_lodashCompatCollectionContains);

var _enums = require('./enums');

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

var validations = {

  //////////////////////////////////////////////////////////////////////////////
  // values
  //////////////////////////////////////////////////////////////////////////////

  values: function values(fieldAccessor, rule) {
    if (!(0, _lodashCompatCollectionContains2['default'])(rule, fieldAccessor())) {
      return (0, _i18nLang.getMessage)('INVALID_VALUE_ERROR');
    }

    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // regexp
  //////////////////////////////////////////////////////////////////////////////

  regexp: function regexp(fieldAccessor, rule) {
    if (!(0, _lodashCompatLangIsRegExp2['default'])(rule)) {
      rule = new RegExp(rule);
    }

    if (rule.test(fieldAccessor()) === false) {
      return (0, _i18nLang.getMessage)('INVALID_VALUE_ERROR');
    }

    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // length
  //////////////////////////////////////////////////////////////////////////////

  length: function length(fieldAccessor, rule) {
    var value = fieldAccessor();
    var length = value && value.length;
    if (rule.min != null && length < rule.min) {
      return (0, _i18nLang.getMessage)('LENGTH_MIN_ERROR', { length: rule.min });
    } else if (rule.max != null && length > rule.max) {
      return (0, _i18nLang.getMessage)('LENGTH_MAX_ERROR', { length: rule.max });
    } else if ((0, _lodashCompatLangIsNumber2['default'])(rule) && length !== rule) {
      return (0, _i18nLang.getMessage)('LENGTH_NE_ERROR', { length: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // lengthmin
  //////////////////////////////////////////////////////////////////////////////

  lengthmin: function lengthmin(fieldAccessor, rule) {
    var value = fieldAccessor();
    var length = value && value.length;
    if (length < rule) {
      return (0, _i18nLang.getMessage)('LENGTH_MIN_ERROR', { length: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // lengthmax
  //////////////////////////////////////////////////////////////////////////////

  lengthmax: function lengthmax(fieldAccessor, rule) {
    var value = fieldAccessor();
    var length = value && value.length;
    if (length > rule) {
      return (0, _i18nLang.getMessage)('LENGTH_MAX_ERROR', { length: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // min
  //////////////////////////////////////////////////////////////////////////////

  min: function min(fieldAccessor, rule) {
    if (fieldAccessor() < rule) {
      return (0, _i18nLang.getMessage)('MIN_ERROR', { value: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // max
  //////////////////////////////////////////////////////////////////////////////

  max: function max(fieldAccessor, rule) {
    if (fieldAccessor() > rule) {
      return (0, _i18nLang.getMessage)('MAX_ERROR', { value: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // ne
  //////////////////////////////////////////////////////////////////////////////

  ne: function ne(fieldAccessor, rule) {
    if (fieldAccessor() === rule) {
      return (0, _i18nLang.getMessage)('NE_ERROR', { value: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // gt
  //////////////////////////////////////////////////////////////////////////////

  gt: function gt(fieldAccessor, rule) {
    if (fieldAccessor() <= rule) {
      return (0, _i18nLang.getMessage)('GT_ERROR', { value: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // lt
  //////////////////////////////////////////////////////////////////////////////

  lt: function lt(fieldAccessor, rule) {
    if (fieldAccessor() >= rule) {
      return (0, _i18nLang.getMessage)('LT_ERROR', { value: rule });
    }
    return undefined;
  },

  //////////////////////////////////////////////////////////////////////////////
  // presence
  //////////////////////////////////////////////////////////////////////////////

  presence: function presence(fieldAccessor, rule) {
    var value = fieldAccessor();
    if (rule === _enums.Presence.REQUIRED && !(value != null)) {
      return (0, _i18nLang.getMessage)('PRESENCE_REQUIRED_ERROR');
    } else if (rule === _enums.Presence.ABSENT && value != null) {
      return (0, _i18nLang.getMessage)('PRESENCE_ABSENT_ERROR');
    }
    return undefined;
  }
};

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

exports['default'] = validations;
module.exports = exports['default'];