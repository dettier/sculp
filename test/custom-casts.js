/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import isNaN from 'lodash-compat/lang/isNaN';
import isNumber from 'lodash-compat/lang/isNumber';
import { assert } from 'chai';

import { validate } from '../src/index';
import { CAST_ERROR, Presence } from '../src/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const INTEGER = 'INTEGER';

describe('Custom casts:', function () {

  const schema = {
    type : INTEGER,
    $presence : Presence.REQUIRED
  };

  it('should throw if custom cast is not registered', function () {
    assert.throws(() => validate(5, schema), 'Unknown type INTEGER');
  });

  it('should use custom cast if it\'s provided', function () {

    const options = {
      casts : {
        [INTEGER] (v) {
          v = v - 0;
          if (isNumber(v) && !isNaN(v) && v === Math.round(v))
            return v;
          return CAST_ERROR;
        }
      }
    };

    assert.equal(validate(5, schema, options), 5);
    assert.equal(validate('5', schema, options), 5);

    assert.throws(() => validate(5.5, schema, options),
      'сouldn\'t cast value to type INTEGER');
    assert.throws(() => validate('5.5', schema, options),
      'сouldn\'t cast value to type INTEGER');
  });

  it('should use custom strict cast if it\'s provided', function () {

    const options = {
      strict : true,
      castsStrict : {
        [INTEGER] (v) {
          if (isNumber(v) && v === Math.round(v))
            return v;
          return CAST_ERROR;
        }
      }
    };

    assert.equal(validate(5, schema, options), 5);

    assert.throws(() => validate(5.5, schema, options),
      'сouldn\'t cast value to type INTEGER');
    assert.throws(() => validate('5', schema, options),
      'сouldn\'t cast value to type INTEGER');
  });

});
