/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';
import startsWith from 'underscore.string/startsWith';

import { validate } from '../src/index';
import { Type } from '../src/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Custom validations:', function () {

  const scheme = {
    type : Type.STRING,
    $startsWith : 'AB'
  };

  it('should throw if custom validation is not registered', function () {
    assert.throws(() => validate(5, scheme), 'Unknown validation startsWith');
  });

  it('should use custom validation if it\'s provided', function () {

    const options = {
      validations : {
        startsWith (fa, ruleValue) {
          if (startsWith(fa() || '', ruleValue) === false)
            return `value should start with ${ruleValue}`;
          return undefined;
        }
      }
    };

    assert.equal(validate('ABab', scheme, options), 'ABab');
    assert.throws(() => validate('CDcd', scheme, options), 'value should start with AB');
  });

});
