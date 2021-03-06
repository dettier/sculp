# sculp [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Most functional javascript object validation library

## Description

Sculp is a library that will help you cast and/or validate input data according to your schema. Typical applications include form management, validating object before saving to DB, casting HTTP request parameters to proper types, and many more.

Compared to other object validation libraries Sculp provides unique features such as conditional validation rules, incremental validation and object structure reuse.  

## TOC
* [Features](#features)
* [Installation](#installation)
* [Example](#example)
* [Schema structure](#schema-structure)
* [API](#api)
    * [Static functions](#static-functions)
        + [`validate()`](#validate)
        + [`tryValidate()`](#tryvalidate)
        + [`getSchemaValue()`](#getschemavalue-getfieldname-getfieldpresence)
        + [`getFieldName()`](#getschemavalue-getfieldname-getfieldpresence)
        + [`getFieldPresence()`](#getschemavalue-getfieldname-getfieldpresence)
        + [`getInitial()`](#getinitial)
        + [`getSubSchema()`](#getsubschema)
        + [`setDefaultOptions()`](#setdefaultoptions)
    * [Sculp class](#sculp-class)
        + [`constructor()`](#constructor)
        + [`validate()`](#validate-1)
        + [`tryValidate()`](#tryvalidate-1)
        + [`getValue()`](#getvalue)
        + [`setValue()`](#setvalue)
        + [`setField()`](#setfield-setfields)
        + [`setFields()`](#setfield-setfields)
        + [`getFieldState()`](#getfieldstate)
        + [`getSchemaValue()`](#getschemavalue-getfieldname-getfieldpresence-1)
        + [`getFieldName()`](#getschemavalue-getfieldname-getfieldpresence-1)
        + [`getFieldPresence()`](#getschemavalue-getfieldname-getfieldpresence-1)
    * [Field accessor functions](#field-accessor-functions)
    * [Options](#options)
* [Custom types and validations](#custom-types-and-validations)
* [Field state object](#field-state-object)

## Features
* **Declarative schema**. Schemas are simple objects, with a very easy-to-read structure. This means you can reuse them, clone them, extend them, and do with them whatever you want.
* **Support for custom types and validation rules**. Any crazy rules you need. Array should be of odd length and its items should start with an underscore? No problem.
* **Conditional rules**. Some field is present only if some checkbox field is on? No problem.
* **Fast incremental validation**. You need to validate some gigantic form on the fly while user is editing it? Incremental validation ensures that only necessary fields and validation rules are recalculated.
* **Object structure reuse**. To find out if your objects or validation rules have changed after last update by user, all you need is strict comparison. This makes this library very React-friendly.

## Installation

```sh
$ npm install --save sculp
```

## Example

```js
import { validate, Type, Presence } from 'sculp';

const schema = {
  type : Type.OBJECT,
  properties : {
    name : {
      type : Type.STRING,
      $lengthmin : 1
      $presence : Presence.REQUIRED
    },
    gender : {
      type : Type.STRING_NET,
      transform : (v) => v && v.toLowerCase(),
      $values : [ 'male', 'female' ]
    },
    age : {
      type : Type.NUMBER,
      $min : 0
    },
    isAdult : {
      type : Type.BOOLEAN,
      compute : (fieldAccessor) =>
        fieldAccessor('^.age') >= 18
    }
  }
}

const result = validate({ name : 'John', gender : ' MALE ', age : '21' }, schema);
  // returns { name : 'John', gender : 'male', age : 21, isAdult : true }

const result = validate({ age : -5 }, schema);
  // throws sculp.ValidationError with errors array

```

This example schema defines the following constraints:

* `name` property
    * should be string
    * should be not empty (minimum length is 1)
    * should be defined
* `gender` property
    * should be string
    * will be trimmed and converted to lowercase
    * should be one of 2 values ("male", "female")
* `age` property
    * should be not negative
* `isAdult` property
    * boolean computed value


## Schema structure

Schemas are plain javascript objects that can have following definition properties:

### `type`
The type of a value. Should be string value.
If type is not defined is defaults to `Type.ANY_VALUE`.
There are 11 available types and you can define your own new types through defining custom casts.
Predefined types available under `Type` enumeration:
```js
import { Type } from 'sculp';
```

List of available types:

* `Type.STRING` String type.
* `Type.STRING_NET` String-not-empty-and-trimmed type. The same as Type.STRING but value gets trimmed and removed if it is an empty string.
* `Type.NUMBER` Number type.
* `Type.BOOLEAN` Boolean type.
* `Type.FUNCTION` Function type.
* `Type.DATE` Date type.
* `Type.OBJECT` Object type. For this type you need to provide schemas for all properties using `properties` field.
* `Type.GROUP` The same as `Type.OBJECT` but this type represents an object as just a group of fields and not as some entity. The difference is the validation of properties for `undefined` values. For `Type.GROUP` properties are validated and for `Type.OBJECT` they are not.  
* `Type.ARRAY` Array type. For this type you need to provide schema for array item using `items` field.
* `Type.ANY_VALUE` Value of any type.
* `Type.ANY_OBJECT` Object with any properties. No `properties` field needed.

### `name`
The name of a value/field. Should be string or function returning string.

### `meta`
Any additional information that you want to attach to this value/field.

### `precision`
Can be defined for `Type.NUMBER`. Truncates the value to specified precision. 

### `valid`
If any validation (other than type validation) fails on this field, value will be replaced by `valid` value if it is defined.

### `initial`
Provide initial value. You can get initial value for whole schema with `getInitial(schema)` function.

### `removeEmpty`
Used for `Type.ARRAY`, `Type.OBJECT` and `Type.GROUP` only. Overrides `removeEmpty` option for this value/field.
If `removeEmpty` is true empty objects and arrays are removed.
Default value is `false`.

### `properties`
Used for `Type.OBJECT` and `Type.GROUP` only.
The value should be an object that provides schemas for available properties in the form of `{ prop1 : prop1Schema, prop2 : prop2Schema, ... }`.

### `items`
Used for `Type.ARRAY` only. The value should be a schema for array items.

### `transform`
A function or array of functions to transform value (e.g. convert string to lowercase).
Those functions take current value as an argument and should return transformed value.

### `compute`
A function of array of functions to compute value (e.g. set object field value to some value derived on the values of other fields).
Those functions take [field accessor function](#field-accessor-functions) as an argument and should return computed value.

### `$...` validation rule properties
All schema properties that start with `$` are validation rules. There are several predefined validations, and you can provide your custom validations using options or defining `$custom` validation.
Any validation rule expects some rule value that value will be validated against. For example for `$values` rule value is expected to be an array of possible values (`{ $values : [ 1, 2, 3 ] }`).
The value `$...` property should be a rule value or a function computing rule value.

Example:
```js
const schema = {
  type : Type.OBJECT,
  properties : {
    string : {  
      type : Type.STRING,
      $lengthmin : 5,
      $presence : {
        value : Presence.REQUIRED,
        message : '"String" property is required!'
      }      
    },
    longerString : {
      type : Type.STRING,
      $lengthmin : (fa) => {
        const stringPropValue = fa('^.string') || '';
        return stringPropValue.length + 1;
      }
    }  
  }
}
```

Available validations:

* `$presence` Validates value presence. Available rule values are `Presence.REQUIRED`, `Presence.OPTIONAL` and `Presence.ABSENT`.
* `$values` Validates that value is one of provided values. Rule value should be an array.
* `$regexp` Validates that value matches regular expression. Rule value should be a string or RegExp.
* `$length` Validates length of a value. Can be used for strings and arrays. Rule value is a number for exact length or an object with `min` and/or `max` properties for providing min and max limits (e.g. `$length : { min : 1, max : 10 }`). 
* `$lengthmin` Validates that value.length >= rule value. Can be used for strings and arrays.
* `$lengthmax` Validates that value.length <= rule value. Can be used for strings and arrays.
* `$ne` Validates that value !== rule value.
* `$min` Validates that number value >= rule value.
* `$max` Validates that number value <= rule value.
* `$gt` Validates that number value > rule value.
* `$lt` Validates that number value < rule value.

### `$custom` custom validation rule
The `$custom` property value should be a function that returns error message string when validation fails and `undefined` otherwise.
Function takes [field accessor function](#field-accessor-functions) as a first argument.

Example:
```js
const schema = {
  type : Type.STRING,
  $custom : (fa) => {
    const value = fa() || '';
    return value[0] == 'A' ? undefined : 'String should start with an A letter'
  }
}
```


## API

* [Static functions](#static-functions)
    + [`validate()`](#validate)
    + [`tryValidate()`](#tryvalidate)
    + [`getSchemaValue()`](#getschemavalue-getfieldname-getfieldpresence)
    + [`getFieldName()`](#getschemavalue-getfieldname-getfieldpresence)
    + [`getFieldPresence()`](#getschemavalue-getfieldname-getfieldpresence)
    + [`getInitial()`](#getinitial)
    + [`getSubSchema()`](#getsubschema)
    + [`setDefaultOptions()`](#setdefaultoptions)
* [Sculp class](#sculp-class)
    + [`constructor()`](#constructor)
    + [`validate()`](#validate-1)
    + [`tryValidate()`](#tryvalidate-1)
    + [`getValue()`](#getvalue)
    + [`setValue()`](#setvalue)
    + [`setField()`](#setfield-setfields)
    + [`setFields()`](#setfield-setfields)
    + [`getFieldState()`](#getfieldstate)
    + [`getSchemaValue()`](#getschemavalue-getfieldname-getfieldpresence-1)
    + [`getFieldName()`](#getschemavalue-getfieldname-getfieldpresence-1)
    + [`getFieldPresence()`](#getschemavalue-getfieldname-getfieldpresence-1)
* [Field accessor functions](#field-accessor-functions)
* [Options](#options)
    
### Static functions

### `validate()`
```js
validate(value: any, schema: object, ?options: object): any
```

Validates `value` with `schema` and returns validated value or throws `ValidationError` when validation fails. Takes [options](#options) as an optional argument.

Example:
```js
validate('valid str', { type : Type.STRING, $length : 9 }, { strict : true });
  // returns string 'valid str'

validate('invalid str', { type : Type.STRING, $length : 9 }, { strict : true });
  // throws ValidationError
```

### `tryValidate()`
```js
tryValidate(value: any, schema: object, ?options: object): object
```

Not throwing version of `validate`.
Validates `value` with `schema` and returns object with `result`, `errors` and `fieldsState` fields. Takes [options](#options) as an optional argument.

### `getSchemaValue()`, `getFieldName()`, `getFieldPresence()`
```js
getSchemaValue(value: any, schema: object, path: string, property: string): any
getFieldName(value: any, schema: object, path: string): string
getFieldPresence(value: any, schema: object, path: string): string
```

TODO : write description
The use of this functions is discouraged.

### `getInitial()`
```js
getInitial(schema: object): any
```

Get initial value for schema. Constructed from `initial` property values of schema.

### `getSubSchema()`
```js
getSubSchema(schema: object, path: string): object
```

Get sub-schema for schema.

Example:
```js
getSubSchema(schema, '.some.nested.field'); // returns schema for subfield 'some.nested.field'
```


### `setDefaultOptions()`
```js
setDefaultOptions(options: object): undefined
```

Sets application-wide default [options](#options) for `validate` and `tryValidate` methods as well as `Sculp` constructor.

Example:
```js
setDefaultOptions({
  strict : true,
  casts : { ... },
  messages : russianLangMessages
});
```

### Sculp class

### `constructor()`
```js
Sculp(value: any, schema: object, ?options: object): undefined
```

Constructs new `Sculp` instance.
Sculp instance allows you to perform fast incremental validations on your value when it changes. Takes [options](#options) as an optional argument.

Example:
```js
const value = { ... };
const sculp =  new Sculp(value, schema);
sculp.validate(); // returns validation result for value
sculp.setField('.some.deep.nested.field', newValue); // mutates some field of value object
sculp.validate(); // returns validation result for current value
```

### `validate()`
```js
Sculp.prototype.validate(): any
```

The same as static `validate` but runs validation on current value using `schema` and `options` provided to Sculp constructor.
Returns validated value or throws `ValidationError` when validation fails.

Example:
```js
const sculp =  new Sculp({ field : 1 }, schema);
sculp.setField('.field', 2); // mutates field of value object
sculp.validate(); // returns validation result for current value
```

### `tryValidate()`
```js
Sculp.prototype.tryValidate(): object
```

The same as static `tryValidate` but runs validation on current value using `schema` and `options` provided to Sculp constructor.
Returns object with `result`, `errors` and `fieldsState` fields.

Example:
```js
const sculp =  new Sculp({ field : 1 }, schema);
sculp.setField('.field', 2); // mutates field of value object
sculp.tryValidate(); // returns object with validation result and errors
```

### `getValue()`
```js
Sculp.prototype.getValue(): any
```

Returns current value.

Example:
```js
const sculp =  new Sculp({ field : 1 }, schema);
sculp.setField('.field', 2);
sculp.getValue(); // returns { field : 2 }
```

### `setValue()`
```js
Sculp.prototype.setValue(newValue: any): undefined
```

Replaces current value and clears all internal Sculp instance caches.

Example:
```js
const sculp =  new Sculp({ field : 1 }, schema);
sculp.validate(); // returns validation result for { field : 1 }
sculp.setValue({ newField : 2 }); // replaces
sculp.validate(); // returns validation result for { newField : 2 }
```

### `setField()`, `setFields()`
```js
Sculp.prototype.setField(path: string, value: any): undefined
Sculp.prototype.setFields(values: object): undefined
```

Mutates current value according to provided parameters.
`setField` mutates one field, `setFields` can mutate several fields at once.
*Note that `path` parameter and `values` keys for mutating fields must start with a dot (i.e. `'.field'` and `{ '.field' : newValue }`).*

Example:
```js
const sculp =  new Sculp({ list : [ {} ] }, schema);
sculp.setField('.list[0].a', 1);
sculp.setFields({ '.list[0].b' : 2, '.list[0].c' : 3 });
sculp.getValue(); // returns { list : [ { a : 1, b : 2, c : 3 } ] }
```

### `getFieldState()`
```js
Sculp.prototype.getFieldState(path: string): object
```

Returns field state object for path `path` of current value.
See [Field state object](#field-state-object).

### `getSchemaValue()`, `getFieldName()`, `getFieldPresence()`
```js
Sculp.prototype.getSchemaValue(path: string, property: string): any
Sculp.prototype.getFieldName(path: string): string
Sculp.prototype.getFieldPresence(path: string): string
```

When you need to get value of some schema definition property or validation rule you can use `getSchemaValue` method. Useful to get values of conditional rules. For example, if you have conditional `$presence` rule for some field you can get current presence with `getSchemaValue(path, '$presence')`.

Example:
```js
const sculp =  new Sculp(value, schema);
sculp.getSchemaValue('.someField', '$values');
sculp.getFieldName('.someField'); // the same as sculp.getSchemaValue('.someField', 'name');
sculp.getFieldPresence('.someField'); // the same as sculp.getSchemaValue('.someField', '$presence');
```

### Field Accessor Functions
Field accessor is a function that is passed to rule value functions and `compute` functions. Field accessor allows you to access other field values.

Field accessor usage:
```js
fieldAccessor(); // returns value of current field
fieldAccessor('.prop'); // returns field 'prop' of current field
fieldAccessor('^.prop'); // returns field 'prop' of parent value
fieldAccessor('^^.prop'); // returns field 'prop' of root value
```

Examples:
```js
const schema = {
  type : Type.OBJECT,
  properties : {
    a : { type : Type.STRING },
    b : {
      type : Type.OBJECT,
      properties : {
        c : {
          compute : (fa) => 'prefix' + fa() // returns value of this field            
        },
        d : {
          compute : (fa) => fa('^^.a') // returns field 'a'            
        },
        e : {
          compute : (fa) => fa('^.c') // returns field 'b.c'            
        }
      }
    }
  }
}
```

### Options
These options can be provided to `validate`, `tryValidate` static functions and `Sculp` constructor.
If you need to set options application-wide use `setDefaultOptions` function.

#### `messages`
For i18n purposes you can provide your custom strings to use as error messages.
Only English and Russian message strings are provided with the library right now.
Default value is an object with English language error messages.

Example:
```
import russianMessages from 'sculp/lib/i18n/ru';
validate(value, schema, { messages : ruMessages });
// or
setDefaultOptions({ messages : ruMessages });
```

#### `strict`
By default Sculp will try to cast value to required type. For example it will return 42 when validating string '42' with { type : Type.NUMBER } schema.
If you don't want Sculp to try to cast values to required types you can set `strict` option to `true`.
Default value is `false`. 
 
#### `casts` and `castsStrict`
Option for providing casts for custom types. See [Custom types and validations](#custom-types-and-validations).

#### `validations`
Option for providing custom validations. See [Custom types and validations](#custom-types-and-validations).

## Custom types and validations

Custom types are provided with `casts` and `castsStrict` options.
You should provide a cast function for each custom type. If value is not of your custom type your cast function should return special CAST_ERROR value.
`casts` option is used for `strict = false` (default value) validations and `castsStrict` is used when `strict = true`.

Custom validations are provided with `validations` option. Validation function takes field accessor as first argument and validation rule value as second. Validation function should return error message string when validation fails and `undefined` otherwise.

Example:
```js
import { validate } from 'sculp';
import { CAST_ERROR } from 'sculp/lib/enums';

const options = {
  casts : {
    'INTEGER' : (v) => {
      if (isNumber(v) && v === Math.round(v))
        return v;
      return CAST_ERROR;
    }
  },
  validations : {
    'divisible' : (fa, ruleValue) => {
      if (value && value % ruleValue !== 0)
        return `value is not divisible by ${ruleValue}`;
    }      
  }
};

const schema = {
  type : 'INTEGER',
  $divisible : 3
}

validate(9, schema, options);
```

## Field state object

*TODO: document.*

## Roadmap
* Partial validation support
* Computed schemas support
* Passing context
* Add popular validation rules

## License

MIT © [dettier]()


[npm-image]: https://badge.fury.io/js/sculp.svg
[npm-url]: https://npmjs.org/package/sculp
[travis-image]: https://travis-ci.org/dettier/sculp.svg?branch=master
[travis-url]: https://travis-ci.org/dettier/sculp
[daviddm-image]: https://david-dm.org/dettier/sculp.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/dettier/sculp
[coveralls-image]: https://coveralls.io/repos/dettier/sculp/badge.svg
[coveralls-url]: https://coveralls.io/r/dettier/sculp
