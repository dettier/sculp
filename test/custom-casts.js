/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate } from '../src/index';
import { Presence } from '../src/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const MY_CUSTOM_TYPE = 'MY_CUSTOM_TYPE';

describe('Custom casts:', function () {

  const scheme = {
    type : MY_CUSTOM_TYPE,
    $presence : Presence.REQUIRED
  };

  it('should throw if custom cast is not registered', function () {
    assert.throws(() => validate(5, scheme), 'Unknown type MY_CUSTOM_TYPE');
  });

  it('should use custom cast if it\'s provided', function () {

    const options = {
      casts : {
        [MY_CUSTOM_TYPE] (v) {
          return v + 1;
        }
      }
    };

    const result = validate(5, scheme, options);
    assert.equal(result, 6);
  });

  it('should use custom strict cast if it\'s provided', function () {

    const options = {
      strict : true,
      castsStrict : {
        [MY_CUSTOM_TYPE] (v) {
          return v + 1;
        }
      }
    };

    const result = validate(5, scheme, options);
    assert.equal(result, 6);
  });

});
