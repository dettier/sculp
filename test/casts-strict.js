/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { validate, TYPE } from '../lib/index';
const { STRING, STRING_NET, NUMBER, DATE, BOOLEAN, FUNCTION } = TYPE;

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

const options = { strict : true };

describe('casts:', function () {

  describe('STRING:', function () {

    const scheme = { type : STRING };

    it('should validate string value', function () {
      assert.equal(validate('string ', scheme, options), 'string ');
      // eslint-disable-next-line no-new-wrappers
      assert.equal(validate(new String('string'), scheme, options), 'string');
    });

    it('should return error object if value is not a string', function () {
      assert.throws(() => validate(2, scheme, options), 'сouldn\'t cast value to type STRING');
      assert.throws(() => validate(true, scheme, options), 'сouldn\'t cast value to type STRING');
      assert.throws(() => validate({}, scheme, options), 'сouldn\'t cast value to type STRING');
      assert.throws(() => validate([], scheme, options), 'сouldn\'t cast value to type STRING');
    });

  });

  describe('STRING_NET:', function () {

    const scheme = { type : STRING_NET };

    it('should return undefined is string is empty or whitespace-only', function () {
      assert.equal(validate('', scheme, options), undefined);
      assert.equal(validate(' ', scheme, options), undefined);
      assert.equal(validate('\t', scheme, options), undefined);
    });

    it('should validate string value', function () {
      assert.equal(validate('string ', scheme, options), 'string');
      // eslint-disable-next-line no-new-wrappers
      assert.equal(validate(new String(' string'), scheme, options), 'string');
    });

    it('should return error object if value is not a string', function () {
      assert.throws(() => validate(2, scheme, options),
        'сouldn\'t cast value to type STRING_NET');
      assert.throws(() => validate(true, scheme, options),
        'сouldn\'t cast value to type STRING_NET');
      assert.throws(() => validate({}, scheme, options),
        'сouldn\'t cast value to type STRING_NET');
      assert.throws(() => validate([], scheme, options),
        'сouldn\'t cast value to type STRING_NET');
    });

  });


  describe('NUMBER:', function () {

    const scheme = { type : NUMBER };

    it('should validate number value', function () {
      assert.equal(validate(4, scheme, options), 4);
      // eslint-disable-next-line no-new-wrappers
      assert.equal(validate(new Number(12), scheme, options), 12);
    });

    it('should return error object if value is not a number', function () {
      assert.throws(() => validate('2', scheme, options),
        'сouldn\'t cast value to type NUMBER');
      assert.throws(() => validate(true, scheme, options),
        'сouldn\'t cast value to type NUMBER');
      assert.throws(() => validate({}, scheme, options),
        'сouldn\'t cast value to type NUMBER');
      assert.throws(() => validate([], scheme, options),
        'сouldn\'t cast value to type NUMBER');
    });

  });


  describe('DATE:', function () {

    const scheme = { type : DATE };

    it('should validate date value', function () {
      const date = new Date();
      assert.deepEqual(validate(date, scheme, options), date);
    });

    it('should return error object if value is not a date', function () {
      assert.throws(() => validate('2', scheme, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate(2, scheme, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate(true, scheme, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate({}, scheme, options),
        'сouldn\'t cast value to type DATE');
      assert.throws(() => validate([], scheme, options),
        'сouldn\'t cast value to type DATE');
    });

  });


  describe('FUNCTION:', function () {

    const scheme = { type : FUNCTION };

    it('should validate function value', function () {
      const f = function () {};
      assert.strictEqual(validate(f, scheme, options), f);
    });

    it('should return error object if value is not a function', function () {
      assert.throws(() => validate('2', scheme, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate(2, scheme, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate(true, scheme, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate({}, scheme, options),
        'сouldn\'t cast value to type FUNCTION');
      assert.throws(() => validate([], scheme, options),
        'сouldn\'t cast value to type FUNCTION');
    });

  });


  describe('BOOLEAN:', function () {

    const scheme = { type : BOOLEAN };

    it('should validate boolean value', function () {
      assert.strictEqual(validate(true, scheme, options), true);
      assert.strictEqual(validate(false, scheme, options), false);
    });

    it('should return error object if value is not a boolean', function () {
      assert.throws(() => validate('2', scheme, options),
        'сouldn\'t cast value to type BOOLEAN');
      assert.throws(() => validate(1, scheme, options),
        'сouldn\'t cast value to type BOOLEAN');
      assert.throws(() => validate({}, scheme, options),
        'сouldn\'t cast value to type BOOLEAN');
      assert.throws(() => validate([], scheme, options),
        'сouldn\'t cast value to type BOOLEAN');
    });

  });

});
