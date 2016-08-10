/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate } from '../lib/index';
import { Type, Presence } from '../lib/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('i18n:', function () {

  describe('lang:', function () {

    const scheme = {
      type : Type.STRING,
      $presence : Presence.REQUIRED
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
