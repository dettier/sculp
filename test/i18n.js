/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate } from '../src/index';
import { Type, Presence } from '../src/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('i18n:', function () {

  describe('lang:', function () {

    const schema = {
      type : Type.STRING,
      $presence : Presence.REQUIRED
    };

    it('should have english messages by default', function () {

      assert.throws(() =>
        validate(undefined, schema),
      'Validation failed (value is required)');

    });

    it('should have russian messages if language changed', function () {

      assert.throws(() => {
        validate(undefined, schema, { lang : 'ru' });
      }, 'Ошибка валидации (значение не указано)');

    });

  });

});
