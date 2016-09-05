/* eslint-env mocha*/
////////////////////////////////////////////////////////////////////////////////
// REQUIRES : BEGIN
////////////////////////////////////////////////////////////////////////////////

import { assert } from 'chai';

import { Type } from '../src/index';
import { getSubSchema, getSubSchemaHandlingPseudoFields } from '../src/helper';

////////////////////////////////////////////////////////////////////////////////
// REQUIRES : END
////////////////////////////////////////////////////////////////////////////////

describe('helper', function () {

  const schema = {
    type : Type.OBJECT,
    properties : {
      strProp : { type : Type.STRING },
      arrayProp : {
        type : Type.ARRAY,
        items : { type : Type.STRING }
      }
    }
  };

  describe('getSubSchema:', function () {

    it('should return root schema', function () {
      assert.strictEqual(getSubSchema(schema, ''), schema);
    });

    it('should return subfield schemas', function () {
      assert.strictEqual(getSubSchema(schema, '.strProp'),
        schema.properties.strProp);
      assert.strictEqual(getSubSchema(schema, '.arrayProp'),
        schema.properties.arrayProp);
      assert.strictEqual(getSubSchema(schema, '.arrayProp[0]'),
        schema.properties.arrayProp.items);
      assert.strictEqual(getSubSchema(schema, '.arrayProp[100]'),
        schema.properties.arrayProp.items);
      assert.strictEqual(getSubSchema(schema, '.arrayProp.items'),
        undefined);
    });

  });

  describe('getSubSchemaHandlingPseudoFields:', function () {

    it('should return root schema', function () {
      assert.strictEqual(getSubSchemaHandlingPseudoFields(schema, ''), schema);
    });

    it('should return subfield schemas', function () {
      assert.strictEqual(getSubSchemaHandlingPseudoFields(schema, '.strProp'),
        schema.properties.strProp);
      assert.strictEqual(getSubSchemaHandlingPseudoFields(schema, '.arrayProp'),
        schema.properties.arrayProp);
      assert.strictEqual(getSubSchemaHandlingPseudoFields(schema, '.arrayProp[0]'),
        schema.properties.arrayProp.items);
      assert.strictEqual(getSubSchemaHandlingPseudoFields(schema, '.arrayProp[100]'),
        schema.properties.arrayProp.items);
      assert.strictEqual(getSubSchemaHandlingPseudoFields(schema, '.arrayProp.items'),
        schema.properties.arrayProp.items);
      assert.strictEqual(getSubSchemaHandlingPseudoFields(schema, '.arrayProp.item'),
        undefined);
    });

  });

});
