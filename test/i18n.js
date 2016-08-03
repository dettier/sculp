/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate } from '../lib/index';
import { TYPE, PRESENCE } from '../lib/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('i18n:', function () {

  describe('lang:', function () {

    const scheme = {
      type : TYPE.STRING,
      $presence : PRESENCE.REQUIRED
    };

    it('should have english messages by default', function () {

      assert.throws(() =>
        validate(undefined, scheme),
      'Validation failed (value is required)');

    });

    it('should have russian messages if language changed', function () {

      assert.throws(() => {
        validate(undefined, scheme, { lang : 'ru' });
      }, 'Ошибка валидации (значение не указано)');

    });

  });

});
