/* eslint-env mocha */
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { Sculp, Type, Presence } from '../src/index';

const { OPTIONAL, ABSENT } = Presence;

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('Results caching and reuse:', function () {

  const scheme = {
    type : Type.OBJECT,
    $presence : Presence.REQUIRED,
    properties : {
      name : { type : Type.STRING },
      age : { type : Type.NUMBER },
      married : { type : Type.BOOLEAN },
      spouse : {
        type : Type.OBJECT,
        $presence : (fa) => fa('^^.married') === true ? OPTIONAL : ABSENT,
        properties : {
          name : { type : Type.STRING },
          age : { type : Type.NUMBER }
        }
      },
      spouseName : {
        type : Type.STRING,
        compute : (fa) => fa('^^.spouse.name')
      },
      children : {
        type : Type.ARRAY,
        items : { type : Type.STRING }
      }
    }
  };

  beforeEach(function () {
    this.value = {
      name : 'John',
      age : 25,
      married : true,
      spouse : {
        name : 'Anna',
        age : 20
      },
      children : [ 'Bill' ]
    };
  });

  it('should return the same object on re-validation', function () {
    const sculp = new Sculp(this.value, scheme);

    const result = sculp.validate();
    assert.strictEqual(sculp.validate(), result);

    sculp.setField('.age', result.age);

    assert.strictEqual(sculp.validate(), result);
  });

  it('should return new object on re-validation after field change', function () {
    const sculp = new Sculp(this.value, scheme);

    const result = sculp.validate();
    sculp.setField('.age', result.age + 1);

    assert.notStrictEqual(sculp.validate(), result);
  });

  it('should reuse the same subfield value after field change that subfield does not depend on',
  function () {
    const sculp = new Sculp(this.value, scheme);

    const result = sculp.validate();
    sculp.setField('.age', result.age + 1);

    assert.notStrictEqual(sculp.validate(), result);
    assert.strictEqual(sculp.validate().spouse, result.spouse);
  });

  it('should not reuse subfield value after field change that subfield depends on',
  function () {
    const sculp = new Sculp(this.value, scheme);

    const result = sculp.validate();
    sculp.setField('.married', false);
    sculp.setField('.married', true);

    assert.deepEqual(sculp.validate().spouse, result.spouse);
    assert.notStrictEqual(sculp.validate().spouse, result.spouse);
  });

  it('should clear internal cache for fields if their dependencies change', function () {

    delete this.value.spouse.age;
    const sculp = new Sculp(this.value, scheme);
    sculp.validate();

    assert.equal(sculp.CACHE['.spouseName'], 'Anna');
    assert.property(sculp.CACHE, '.spouse');
    assert.property(sculp.CACHE, '.spouseName');
    assert.property(sculp.CACHE, '.spouse.age');
    assert.property(sculp.CACHE, '.children');
    assert.property(sculp.CACHE, '.children[0]');
    assert.property(sculp.CACHE, '.children.items');

    sculp.setField('.married', false);

    assert.notProperty(sculp.CACHE, '.spouse');
    assert.notProperty(sculp.CACHE, '.spouseName');
    assert.notProperty(sculp.CACHE, '.spouse.age');

    sculp.setField('.children', []);

    assert.notProperty(sculp.CACHE, '.children');
    assert.notProperty(sculp.CACHE, '.children[0]');
    assert.notProperty(sculp.CACHE, '.children.items');

  });

});
