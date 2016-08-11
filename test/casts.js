/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import CASTS from '../src/casts';
import { Type, CAST_ERROR } from '../src/enums';

const { STRING, STRING_NET, NUMBER, DATE, BOOLEAN, FUNCTION } = Type;

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('casts:', function () {

  describe('STRING:', function () {

    it('should cast to string if it is possible', function () {
      assert.equal(CASTS[STRING]('string '), 'string ');
      // eslint-disable-next-line no-new-wrappers
      assert.equal(CASTS[STRING](new String('string')), 'string');
      assert.equal(CASTS[STRING](3.2), '3.2');
      assert.equal(CASTS[STRING](true), 'true');
    });

    it('should return error object if unable to cast', function () {
      assert.strictEqual(CASTS[STRING](undefined), CAST_ERROR);
      assert.strictEqual(CASTS[STRING]({}), CAST_ERROR);
      assert.strictEqual(CASTS[STRING]([]), CAST_ERROR);
    });

  });

  describe('STRING_NET:', function () {

    it('should return undefined is string is empty or whitespace-only', function () {
      assert.equal(CASTS[STRING_NET](''), undefined);
      assert.equal(CASTS[STRING_NET](' '), undefined);
      assert.equal(CASTS[STRING_NET]('\t'), undefined);
    });

    it('should cast to string if it is possible', function () {
      assert.equal(CASTS[STRING_NET]('string '), 'string');
      // eslint-disable-next-line no-new-wrappers
      assert.equal(CASTS[STRING_NET](new String(' string')), 'string');
      assert.equal(CASTS[STRING_NET](3.2), '3.2');
      assert.equal(CASTS[STRING_NET](true), 'true');
    });

    it('should return error object if unable to cast', function () {
      assert.strictEqual(CASTS[STRING_NET](undefined), CAST_ERROR);
      assert.strictEqual(CASTS[STRING_NET]({}), CAST_ERROR);
      assert.strictEqual(CASTS[STRING_NET]([]), CAST_ERROR);
    });

  });


  describe('NUMBER:', function () {

    it('should cast to number if it is possible', function () {
      assert.equal(CASTS[NUMBER](' 3.2 '), 3.2);
      assert.equal(CASTS[NUMBER](3.2), 3.2);
    });

    it('should return error object if unable to cast', function () {
      assert.strictEqual(CASTS[NUMBER](undefined), CAST_ERROR);
      assert.strictEqual(CASTS[NUMBER]([]), CAST_ERROR);
      assert.strictEqual(CASTS[NUMBER]({}), CAST_ERROR);
      assert.strictEqual(CASTS[NUMBER]('fdsa32'), CAST_ERROR);
    });

  });


  describe('DATE:', function () {

    it('should cast to date if it is possible', function () {
      assert.deepEqual(CASTS[DATE](-366580080000), new Date(-366580080000));
      assert.deepEqual(CASTS[DATE](' -366580080000 '), new Date(-366580080000));
      assert.deepEqual(CASTS[DATE](' 21 May 1958 10:12 GMT+0600').getTime(),
                       new Date(-366580080000).getTime());
      assert.instanceOf(CASTS[DATE]('2112/3/23 '), Date);
    });

    it('should return error object if unable to cast', function () {
      assert.strictEqual(CASTS[DATE](undefined), CAST_ERROR);
      assert.strictEqual(CASTS[DATE]([]), CAST_ERROR);
      assert.strictEqual(CASTS[DATE]({}), CAST_ERROR);
      assert.strictEqual(CASTS[DATE]('21May195810:12'), CAST_ERROR);
      assert.strictEqual(CASTS[DATE]('2sf2/3/23'), CAST_ERROR);
    });

  });


  describe('FUNCTION:', function () {

    it('should return value if value is a function', function () {
      const f = () => {};
      assert.strictEqual(CASTS[FUNCTION](f), f);
    });

    it('should return error object if value is not a function', function () {
      assert.strictEqual(CASTS[FUNCTION](undefined), CAST_ERROR);
      assert.strictEqual(CASTS[FUNCTION]([]), CAST_ERROR);
      assert.strictEqual(CASTS[FUNCTION]({}), CAST_ERROR);
      assert.strictEqual(CASTS[FUNCTION]('21May195810:12'), CAST_ERROR);
      assert.strictEqual(CASTS[FUNCTION](15), CAST_ERROR);
    });

  });


  describe('BOOLEAN:', function () {

    it('should cast to boolean if it is possible', function () {
      assert.equal(CASTS[BOOLEAN](true), true);
      assert.equal(CASTS[BOOLEAN]('true'), true);
      assert.equal(CASTS[BOOLEAN](' TrUe  '), true);
      assert.equal(CASTS[BOOLEAN]('t '), true);
      assert.equal(CASTS[BOOLEAN]('1'), true);
      assert.equal(CASTS[BOOLEAN](1), true);
      assert.equal(CASTS[BOOLEAN](false), false);
      assert.equal(CASTS[BOOLEAN]('false'), false);
      assert.equal(CASTS[BOOLEAN](' fAlSe  '), false);
      assert.equal(CASTS[BOOLEAN]('f'), false);
      assert.equal(CASTS[BOOLEAN]('0'), false);
      assert.equal(CASTS[BOOLEAN](0), false);
    });

    it('should return error object if unable to cast', function () {
      assert.strictEqual(CASTS[BOOLEAN](undefined), CAST_ERROR);
      assert.strictEqual(CASTS[BOOLEAN](45), CAST_ERROR);
      assert.strictEqual(CASTS[BOOLEAN]([]), CAST_ERROR);
      assert.strictEqual(CASTS[BOOLEAN]({}), CAST_ERROR);
      assert.strictEqual(CASTS[BOOLEAN]('fdsa32'), CAST_ERROR);
    });

  });

});
