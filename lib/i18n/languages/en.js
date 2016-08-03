
const messages = {
  UNKNOWN_TYPE : 'unknown type ${type}',
  CAST_ERROR : 'сouldn\'t cast value to type',
  INVALID_VALUE_ERROR : 'invalid value',
  LENGTH_MIN_ERROR : 'length must be at least ${length} characters long',
  LENGTH_MAX_ERROR : 'length must be less than or equal to ${length} characters long',
  LENGTH_NE_ERROR : 'length must be ${length} characters long',
  MIN_ERROR : 'value must be at least ${value}',
  MAX_ERROR : 'value must be less than or equal to ${value}',
  NE_ERROR : 'value must be not equal to ${value}',
  GT_ERROR : 'value must be greater than ${value}',
  LT_ERROR : 'value must be less than ${value}',
  PRESENCE_REQUIRED_ERROR : 'value is required',
  PRESENCE_ABSENT_ERROR : 'value must be absent',

  VALIDATION_ERROR : 'validation failed',
  VALIDATION_ERROR_WITH_MESSAGE : 'validation failed (${message})',
  FIELD_VALIDATION_ERROR : 'validation failed for field "${path}"',
  FIELD_VALIDATION_ERROR_WITH_MESSAGE : 'validation failed for field "${path}" (${message})'
};

export default messages;
