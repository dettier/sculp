/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate, Type, Presence } from '../lib/index';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Validation rules:', function () {

  it('should validate $values rule', function () {
    const scheme = {
      type : Type.NUMBER,
      $values : [ -1, 0, 1 ]
    };
    assert.doesNotThrow(() => validate(0, scheme));
    assert.doesNotThrow(() => validate('-1', scheme));
    assert.throws(() => validate(2, scheme), 'invalid value');
  });

  it('should validate $regexp rule', function () {
    const scheme = {
      type : Type.STRING,
      $regexp : '^\\d\\d\\d$'
    };
    assert.doesNotThrow(() => validate(100, scheme));
    assert.doesNotThrow(() => validate('999', scheme));
    assert.throws(() => validate('99', scheme), 'invalid value');
    assert.throws(() => validate('w999', scheme), 'invalid value');
    assert.throws(() => validate('1999', scheme), 'invalid value');
  });

  it('should validate $lengthmin rule', function () {
    const scheme = {
      type : Type.STRING,
      $lengthmin : 5
    };
    assert.doesNotThrow(() => validate('01570', scheme));
    assert.doesNotThrow(() => validate('string', scheme));
    assert.throws(() => validate('nope', scheme), 'length must be at least 5');
  });

  it('should validate $lengthmax rule', function () {
    const scheme = {
      type : Type.STRING,
      $lengthmax : 4
    };
    assert.doesNotThrow(() => validate('cool', scheme));
    assert.throws(() => validate('sculp', scheme), 'length must be less than or equal to 4');
  });

  it('should validate $length rule', function () {
    const scheme = {
      type : Type.STRING,
      $length : 4
    };
    assert.doesNotThrow(() => validate('cool', scheme));
    assert.throws(() => validate('sculp', scheme), 'length must be exactly 4');
  });

  it('should validate $ne rule', function () {
    const scheme = {
      type : Type.STRING,
      $ne : 'sculp'
    };
    assert.doesNotThrow(() => validate('cool', scheme));
    assert.throws(() => validate('sculp', scheme), 'value must be not equal to sculp');
  });

  it('should validate $min rule', function () {
    const scheme = {
      type : Type.NUMBER,
      $min : 0
    };
    assert.doesNotThrow(() => validate(0, scheme));
    assert.doesNotThrow(() => validate(1, scheme));
    assert.throws(() => validate(-1, scheme), 'value must be at least 0');
  });

  it('should validate $max rule', function () {
    const scheme = {
      type : Type.NUMBER,
      $max : 0
    };
    assert.doesNotThrow(() => validate(0, scheme));
    assert.doesNotThrow(() => validate(-1, scheme));
    assert.throws(() => validate(1, scheme), 'value must be less than or equal to 0');
  });

  it('should validate $gt rule', function () {
    const scheme = {
      type : Type.NUMBER,
      $gt : 0
    };
    assert.doesNotThrow(() => validate(1, scheme));
    assert.throws(() => validate(0, scheme), 'value must be greater than 0');
    assert.throws(() => validate(-1, scheme), 'value must be greater than 0');
  });

  it('should validate $lt rule', function () {
    const scheme = {
      type : Type.NUMBER,
      $lt : 0
    };
    assert.doesNotThrow(() => validate(-1, scheme));
    assert.throws(() => validate(0, scheme), 'value must be less than 0');
    assert.throws(() => validate(1, scheme), 'value must be less than 0');
  });

  it('should validate $presence rule (REQUIRED)', function () {
    const scheme = {
      type : Type.NUMBER,
      $presence : Presence.REQUIRED
    };
    assert.doesNotThrow(() => validate(-1, scheme));
    assert.throws(() => validate(undefined, scheme), 'value is required');
  });

  it('should validate $presence rule (ABSENT): should remove value and not throw',
  function () {
    const scheme = {
      type : Type.NUMBER,
      $presence : Presence.ABSENT
    };
    assert.doesNotThrow(() => validate(undefined, scheme));
    assert.deepEqual(validate(1, scheme), undefined);
  });

});
