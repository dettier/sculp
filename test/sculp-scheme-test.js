/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';
import scheme from './sculp-scheme';

import { tryValidate, validate, ValidationError, Presence } from '../lib/index';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Basic validation tests with example scheme', function () {

  it('empty value passes validation', function () {
    assert.isUndefined(validate(undefined, scheme));
  });

  it('correct value passes validation', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      agreedToTerms : true
    };

    const result = validate(value, scheme);
    assert.deepEqual(result, {
      ...value,
      fullname : 'John Smith'
    });
  });

  it('should throw if not agreed to terms', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      agreedToTerms : false
    };

    assert.throws(() => validate(value, scheme), ValidationError);
  });

  it('mailing address should be absent if main address is empty', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      mailingAddress : 'Moscow',
      agreedToTerms : true
    };

    const { result, fieldsState } = tryValidate(value, scheme);

    assert.deepEqual(result, {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      agreedToTerms : true
    });
    assert.equal(fieldsState['.mailingAddress'].$presence, Presence.ABSENT);
  });

  it('mailing address should be present if main address is defined', function () {
    const value = {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      address : 'Moscow',
      mailingAddress : 'New York City',
      agreedToTerms : true
    };

    const { result, fieldsState } = tryValidate(value, scheme);

    assert.deepEqual(result, {
      firstname : 'John',
      lastname : 'Smith',
      fullname : 'John Smith',
      address : 'Moscow',
      mailingAddress : 'New York City',
      agreedToTerms : true
    });
    assert.equal(fieldsState['.mailingAddress'].$presence, Presence.OPTIONAL);
  });

});
