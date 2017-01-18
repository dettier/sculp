/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate } from '../src/index';
import { Type, Presence } from '../src/enums';

import ruMessages from '../src/i18n/languages/ru';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('i18n:', function () {

  describe('messages option:', function () {

    const schema = {
      type : Type.STRING,
      $presence : Presence.REQUIRED
    };

    it('should have english messages by default', function () {

      assert.throws(() =>
        validate(undefined, schema),
      'Validation failed (value is required)');

    });

    it('should have russian messages if provided', function () {

      assert.throws(() => {
        validate(undefined, schema, { messages : ruMessages });
      }, 'Ошибка валидации (значение не указано)');

    });

  });

});
