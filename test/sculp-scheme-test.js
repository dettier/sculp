/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';
import scheme from './sculp-scheme';

import { validate, validateSync, ValidationError, PRESENCE } from '../lib/index';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Basic validation tests with example scheme', function () {

  it('Empty value passes validation', function () {
    assert.isUndefined(validateSync(undefined, scheme));
  });

  it('Correct value passes validation', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      agreedToTerms : true
    };

    const result = validateSync(value, scheme);
    assert.deepEqual(result, {
      ...value,
      fullname : 'John Smith'
    });
  });

  it('Should throw if not agreed to terms', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      agreedToTerms : false
    };

    assert.throws(() => validateSync(value, scheme), ValidationError);
  });

  it('Mailing address should be absent if main address is empty', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      mailingAddress : 'Moscow',
      agreedToTerms : true
    };

    const { result, fieldsState } = validate(value, scheme);

    assert.deepEqual(result, {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      agreedToTerms : true
    });
    assert.equal(fieldsState['.mailingAddress'].$presence, PRESENCE.ABSENT);
  });

  it('Mailing address should be present if main address is defined', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      address : 'Moscow',
      mailingAddress : 'New York City',
      agreedToTerms : true
    };

    const { result, fieldsState } = validate(value, scheme);

    assert.deepEqual(result, {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      address : 'Moscow',
      mailingAddress : 'New York City',
      agreedToTerms : true
    });
    assert.equal(fieldsState['.mailingAddress'].$presence, PRESENCE.OPTIONAL);
  });

});
