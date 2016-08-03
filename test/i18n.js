/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate, lang } from '../lib/index';
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
        lang('ru');
        validate(undefined, scheme);
      }, 'Ошибка валидации (значение не указано)');
      lang('en');

    });

  });

});
