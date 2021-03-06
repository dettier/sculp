/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import chai from 'chai';
const assert = chai.assert;

import { validate } from '../src/index';
import { Type, Presence } from '../src/enums';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////


describe('Sculp:', function () {

  describe('validate:', function () {

    it('should throw if type is set but undefined', function () {
      const schema = { type : Type.STRING111 };
      assert.throws(() => validate('111', schema), 'Unknown type');
    });

    it('should validate primitive values', function () {
      let schema;
      let result;

      schema = { type : Type.STRING };
      result = validate('aaabbbccc', schema);
      assert.equal(result, 'aaabbbccc');

      schema = { type : Type.NUMBER, precision : 2 };
      result = validate('7.4444444', schema);
      assert.equal(result, 7.44);

      schema = { type : Type.BOOLEAN };
      result = validate('true', schema);
      assert.equal(result, true);
    });

    it('should validate array', function () {
      const schema = {
        type : Type.ARRAY,
        items : { type : Type.NUMBER }
      };
      const result = validate(['3', 4, '5'], schema);
      assert.deepEqual(result, [ 3, 4, 5 ]);
    });

    it('should throw error when couldn\'t validate array', function () {
      const schema = {
        type : Type.ARRAY,
        items : { type : Type.NUMBER }
      };

      assert.throws(function () {
        validate({ a : '2' }, schema);
      }, 'Validation failed (сouldn\'t cast value to type ARRAY)');
    });

    it('should validate object', function () {
      const schema = {
        type : Type.OBJECT,
        properties : {
          key1 : { type : Type.NUMBER },
          key2 : { type : Type.STRING }
        }
      };
      const result = validate({ key1 : '-1', key2 : 'a' }, schema);
      assert.deepEqual(result, { key1 : -1, key2 : 'a' });
    });

    it('should validate group', function () {
      const schema = {
        type : Type.GROUP,
        properties : {
          key1 : { type : Type.NUMBER },
          key2 : { type : Type.STRING }
        }
      };
      const result = validate({ key1 : '-1', key2 : 'a' }, schema);
      assert.deepEqual(result, { key1 : -1, key2 : 'a' });

      const result2 = validate({}, schema);
      assert.deepEqual(result2, {});
    });

  });

  describe('validate: validating array items', function () {

    it('should throw error when items are of wrong type', function () {
      const schema = {
        type : Type.ARRAY,
        items : {
          type : Type.NUMBER
        }
      };
      assert.throws(function () {
        validate([ {} ], schema);
      }, 'Validation failed for field "[0]" (сouldn\'t cast value to type NUMBER)');
      assert.throws(function () {
        validate([ [] ], schema);
      }, 'Validation failed for field "[0]" (сouldn\'t cast value to type NUMBER)');
    });

  });


  describe('validate: failed validations & valid values', function () {

    it('should change value to valid for primitive values', function () {
      const schema = {
        type : Type.OBJECT,
        properties : {
          key : {
            type : Type.NUMBER,
            $gt : 5,
            valid : 10
          }
        }
      };
      const result = validate({ key : 3 }, schema);
      assert.deepEqual(result, { key : 10 });
    });

    it('should change value to valid for objects if subfield validation failed', function () {
      const schema = {
        type : Type.OBJECT,
        valid : undefined,
        properties : {
          key : {
            type : Type.NUMBER,
            $gt : 5
          }
        }
      };
      const result = validate({ key : 3 }, schema);
      assert.deepEqual(result, undefined);
    });

  });

  it('undefined value should remain undefined', function () {
    const schema = {
      type : Type.OBJECT,
      properties : {
        key : {
          type : Type.NUMBER
        }
      }
    };
    const result = validate(undefined, schema);
    assert.deepEqual(result, undefined);
  });

  describe('validate: calculating computes', function () {

    it('should not calculate computes for undefined parent value', function () {

      const schema = {
        type : Type.OBJECT,
        properties : {
          key : {
            type : Type.NUMBER,
            compute : () => 9
          }
        }
      };
      const result = validate(undefined, schema);
      assert.deepEqual(result, undefined);

    });

  });

  it('failed validation for absent fields does not matter', function () {

    const schema = {
      type : Type.OBJECT,
      properties : {
        a : { type : Type.NUMBER },
        b : {
          type : Type.OBJECT,
          properties : {
            c : {
              type : Type.NUMBER,
              $gt : 10
            }
          }
        }
      }
    };

    const value = { a : 5, b : { c : 1 } };

    // this should fail as "c" value < 10
    assert.throws(() =>
      validate(value, schema));

    schema.properties.b.$presence = Presence.ABSENT;
    const result = validate(value, schema);
    assert.deepEqual(result, { a : 5 });
  });

  describe('valid values', function () {

    it('valid values: should change failed field value to valid', function () {
      const schema = {
        type: Type.OBJECT,
        valid : { a: '1' },
        $presence: Presence.REQUIRED,
        removeEmpty : true,
        properties: {
          a: { type : Type.STRING },
          b: { type : Type.STRING }
        }
      };

      const value = { c : 'a' };
      const result = validate(value, schema);
      assert.deepEqual(result, { a : '1' });
    });

    it('valid value should also be validated', function () {
      const schema = {
        type: Type.OBJECT,
        valid : { a: 1, b : 2 },
        $presence: Presence.REQUIRED,
        removeEmpty : true,
        properties: {
          a: { type : Type.STRING },
          b: { type : Type.STRING }
        }
      };

      const value = { c : 'a' };
      const result = validate(value, schema);
      assert.deepEqual(result, { a: '1', b : '2' });
    });

  });

  it('should remove initial item values if such option provided', function () {
    const schema = {
      type: Type.OBJECT,
      properties: {
        a : {
          type : Type.NUMBER,
          removeInitial : true,
          initial : 1
        },
        b : {
          type : Type.NUMBER
        }
      }
    };

    const value = { a : 1, b : 2 };
    const result = validate(value, schema, { removeInitial : true });
    assert.deepEqual(result, { b : 2 });
  });

  it('undefined array items are removed from array', function () {
    const schema = {
      type: Type.ARRAY,
      $presence: Presence.REQUIRED,
      items: {
        type : Type.NUMBER,
        $presence : Presence.REQUIRED
      }
    };

    const value = [ 1, undefined, 2];
    const result = validate(value, schema);
    assert.deepEqual(result, [ 1, 2 ]);
  });

  it('changing array item to undefined removes it from array', function () {
    const schema = {
      type: Type.ARRAY,
      $presence: Presence.REQUIRED,
      items: {
        type : Type.NUMBER,
        $presence : Presence.REQUIRED,
        compute : () => undefined
      }
    };

    const value = [ 1, undefined, 2];
    const result = validate(value, schema);
    assert.deepEqual(result, []);
  });

});
