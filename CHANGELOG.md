# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## 3.0.0 (2017-01-18)
- **Breaking change** Fix #5. `lang` option changed to `messages` option.

## 2.1.0 (2016-12-09)
- Change fixFailedValuesValidation option logic. When $values validation fails this option will fix this by doing the following: clear field value for optinal fields or change value to first $values value for required fields.  

## 2.0.1 (2016-12-09)
- Fix fixFailedValuesValidation option.

## 2.0.0 (2016-09-05)
- **Breaking change** Fix #2. Rename `getSchemeValue` to `getSchemaValue` and `getSubScheme` to `getSubSchema`. Old functions are not removed in this version. 
- **Breaking change** Fix #4. Change fieldState errors field to contain error objects instead of messages.
- Add `sculp.getErrors(path)` method and tests
- Add CHANGELOG.md

## 1.0.2 (2016-08-12)
- Fix #1
- Change README.md

## 1.0.1 (2016-08-11)
- Minor fixes.
- Add README.md

## 1.0.0 (2016-08-11)
- Initial release
