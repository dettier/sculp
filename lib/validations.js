////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import _ from 'lodash-compat';

import { PRESENCE } from './enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const validations = {

  match (fieldAccessor, rule) {
    if (!_.isRegExp(rule)) {
      rule = new RegExp(rule);
    }

    if (!rule.test(fieldAccessor())) {
      return 'Недопустимое значение';
    }

    return undefined;
  },

  values (fieldAccessor, rule) {
    if (!_.contains(rule, fieldAccessor())) {
      return 'Недопустимое значение';
    }

    return undefined;
  },

  regexp (fieldAccessor, rule) {
    if (rule.test(fieldAccessor()) === false) {
      return 'Недопустимое значение';
    }

    return undefined;
  },

  length (fieldAccessor, rule) {
    const value = fieldAccessor();
    const length = value && value.length;
    if ((rule.min != null) && length < rule.min) {
      return `Длина меньше ${rule.min}`;
    } else if ((rule.max != null) && length > rule.max) {
      return `Длина больше ${rule.max}`;
    } else if (_.isNumber(rule) && length !== rule) {
      return `Длина не равна ${rule}`;
    }
    return undefined;
  },

  lengthmin (fieldAccessor, rule) {
    const value = fieldAccessor();
    const length = value && value.length;
    if (length < rule) {
      return `Длина меньше ${rule}`;
    }
    return undefined;
  },

  lengthmax (fieldAccessor, rule) {
    const value = fieldAccessor();
    const length = value && value.length;
    if (length > rule) {
      return `Длина больше ${rule}`;
    }
    return undefined;
  },

  min (fieldAccessor, rule) {
    if (fieldAccessor() < rule) {
      return `Значение меньше ${rule}`;
    }
    return undefined;
  },

  max (fieldAccessor, rule) {
    if (fieldAccessor() > rule) {
      return `Значение больше ${rule}`;
    }
    return undefined;
  },

  ne (fieldAccessor, rule) {
    if (fieldAccessor() === rule) {
      return `Значение не может быть равно ${rule}`;
    }
    return undefined;
  },

  gt (fieldAccessor, rule) {
    if (fieldAccessor() <= rule) {
      return `Значение должно быть больше ${rule}`;
    }
    return undefined;
  },

  lt (fieldAccessor, rule) {
    if (fieldAccessor() >= rule) {
      return `Значение должно быть меньше ${rule}`;
    }
    return undefined;
  },

  geoJsonType (fieldAccessor, rule) {
    const value = fieldAccessor();
    const type = value && value.type;
    if (type !== rule) {
      return `Требуется значение типа ${rule}`;
    }
    return undefined;
  },

  geometry (fieldAccessor, rule) {
    const value = fieldAccessor();
    const type = value && value.type;
    const geometryType = value && value.geometry && value.type;
    if (type !== rule && geometryType !== rule) {
      return `Требуется геометрия ${rule}`;
    }
    return undefined;
  },

  presence (fieldAccessor, rule) {
    const value = fieldAccessor();
    if (rule === PRESENCE.REQUIRED && !(value != null)) {
      return 'Значение не указано';
    } else if (rule === PRESENCE.ABSENT && (value != null)) {
      return 'Значение должно отсутствовать';
    }
    return undefined;
  }
};

////////////////////////////////////////////////////////////////////////////////
// export
////////////////////////////////////////////////////////////////////////////////

export default validations;
