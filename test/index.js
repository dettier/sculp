/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import chai from 'chai';
const assert = chai.assert;

import { validate } from '../lib/index';
import { TYPE, PRESENCE } from '../lib/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////


describe('Sculp:', function () {

  describe('validate:', function () {

    it('should throw if type is set but undefined', function () {
      const scheme = { type : TYPE.STRING111 };
      assert.throws(() => validate('111', scheme), 'Unknown type');
    });

    it('should validate primitive values', function () {
      let scheme;
      let result;

      scheme = { type : TYPE.STRING };
      result = validate('aaabbbccc', scheme);
      assert.equal(result, 'aaabbbccc');

      scheme = { type : TYPE.NUMBER, precision : 2 };
      result = validate('7.4444444', scheme);
      assert.equal(result, 7.44);

      scheme = { type : TYPE.BOOLEAN };
      result = validate('true', scheme);
      assert.equal(result, true);
    });

    it('should validate array', function () {
      const scheme = {
        type : TYPE.ARRAY,
        items : { type : TYPE.NUMBER }
      };
      const result = validate(['3', 4, '5'], scheme);
      assert.deepEqual(result, [ 3, 4, 5 ]);
    });

    it('should throw error when couldn\'t validate array', function () {
      const scheme = {
        type : TYPE.ARRAY,
        items : { type : TYPE.NUMBER }
      };

      assert.throws(function () {
        validate({ a : '2' }, scheme);
      }, 'Validation failed (сouldn\'t cast value to type ARRAY)');
    });

    it('should validate object', function () {
      const scheme = {
        type : TYPE.OBJECT,
        properties : {
          key1 : { type : TYPE.NUMBER },
          key2 : { type : TYPE.STRING }
        }
      };
      const result = validate({ key1 : '-1', key2 : 'a' }, scheme);
      assert.deepEqual(result, { key1 : -1, key2 : 'a' });
    });

    it('should validate group', function () {
      const scheme = {
        type : TYPE.GROUP,
        properties : {
          key1 : { type : TYPE.NUMBER },
          key2 : { type : TYPE.STRING }
        }
      };
      const result = validate({ key1 : '-1', key2 : 'a' }, scheme);
      assert.deepEqual(result, { key1 : -1, key2 : 'a' });

      const result2 = validate({}, scheme);
      assert.deepEqual(result2, {});
    });

  });

  describe('validate: validating array items', function () {

    it('should throw error when items are of wrong type', function () {
      const scheme = {
        type : TYPE.ARRAY,
        items : {
          type : TYPE.NUMBER
        }
      };
      assert.throws(function () {
        validate([ {} ], scheme);
      }, 'Validation failed for field "[0]" (сouldn\'t cast value to type NUMBER)');
      assert.throws(function () {
        validate([ [] ], scheme);
      }, 'Validation failed for field "[0]" (сouldn\'t cast value to type NUMBER)');
    });

  });


  describe('validate: failed validations & valid values', function () {

    it('should change value to valid for primitive values', function () {
      const scheme = {
        type : TYPE.OBJECT,
        properties : {
          key : {
            type : TYPE.NUMBER,
            $gt : 5,
            valid : 10
          }
        }
      };
      const result = validate({ key : 3 }, scheme);
      assert.deepEqual(result, { key : 10 });
    });

    it('should change value to valid for objects if subfield validation failed', function () {
      const scheme = {
        type : TYPE.OBJECT,
        valid : undefined,
        properties : {
          key : {
            type : TYPE.NUMBER,
            $gt : 5
          }
        }
      };
      const result = validate({ key : 3 }, scheme);
      assert.deepEqual(result, undefined);
    });

  });

  it('undefined value should remain undefined', function () {
    const scheme = {
      type : TYPE.OBJECT,
      properties : {
        key : {
          type : TYPE.NUMBER
        }
      }
    };
    const result = validate(undefined, scheme);
    assert.deepEqual(result, undefined);
  });

  describe('validate: calculating computes', function () {

    it('should not calculate computes for undefined parent value', function () {

      const scheme = {
        type : TYPE.OBJECT,
        properties : {
          key : {
            type : TYPE.NUMBER,
            compute : () => 9
          }
        }
      };
      const result = validate(undefined, scheme);
      assert.deepEqual(result, undefined);

    });

  });

  it('failed validation for absent fields does not matter', function () {

    const scheme = {
      type : TYPE.OBJECT,
      properties : {
        a : { type : TYPE.NUMBER },
        b : {
          type : TYPE.OBJECT,
          properties : {
            c : {
              type : TYPE.NUMBER,
              $gt : 10
            }
          }
        }
      }
    };

    const value = { a : 5, b : { c : 1 } };

    // this should fail as "c" value < 10
    assert.throws(() =>
      validate(value, scheme));

    scheme.properties.b.$presence = PRESENCE.ABSENT;
    const result = validate(value, scheme);
    assert.deepEqual(result, { a : 5 });
  });

  describe('valid values', function () {

    it('valid values: should change failed field value to valid', function () {
      const scheme = {
        type: TYPE.OBJECT,
        valid : { a: '1' },
        $presence: PRESENCE.REQUIRED,
        removeEmpty : true,
        properties: {
          a: { type : TYPE.STRING },
          b: { type : TYPE.STRING }
        }
      };

      const value = { c : 'a' };
      const result = validate(value, scheme);
      assert.deepEqual(result, { a : '1' });
    });

    it('valid value should also be validated', function () {
      const scheme = {
        type: TYPE.OBJECT,
        valid : { a: 1, b : 2 },
        $presence: PRESENCE.REQUIRED,
        removeEmpty : true,
        properties: {
          a: { type : TYPE.STRING },
          b: { type : TYPE.STRING }
        }
      };

      const value = { c : 'a' };
      const result = validate(value, scheme);
      assert.deepEqual(result, { a: '1', b : '2' });
    });

  });

  it('should remove initial item values if such option provided', function () {
    const scheme = {
      type: TYPE.OBJECT,
      properties: {
        a : {
          type : TYPE.NUMBER,
          removeInitial : true,
          initial : 1
        },
        b : {
          type : TYPE.NUMBER
        }
      }
    };

    const value = { a : 1, b : 2 };
    const result = validate(value, scheme, { removeInitial : true });
    assert.deepEqual(result, { b : 2 });
  });

  it('undefined array items are removed from array', function () {
    const scheme = {
      type: TYPE.ARRAY,
      $presence: PRESENCE.REQUIRED,
      items: {
        type : TYPE.NUMBER,
        $presence : PRESENCE.REQUIRED
      }
    };

    const value = [ 1, undefined, 2];
    const result = validate(value, scheme);
    assert.deepEqual(result, [ 1, 2 ]);
  });

  it('changing array item to undefined removes it from array', function () {
    const scheme = {
      type: TYPE.ARRAY,
      $presence: PRESENCE.REQUIRED,
      items: {
        type : TYPE.NUMBER,
        $presence : PRESENCE.REQUIRED,
        compute : () => undefined
      }
    };

    const value = [ 1, undefined, 2];
    const result = validate(value, scheme);
    assert.deepEqual(result, []);
  });

});
