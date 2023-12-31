# @aux4/validator
Command-line interface (CLI) to validate JSON data.

![npm](https://img.shields.io/npm/v/@aux4/validator)

## Install

```bash
npm install --global @aux4/validator
```

## Usage

config.yaml
```yaml
config:
  person:
    name:
      rule: required
    age:
      rule: required|integer|min:18
```

```bash
$ cat data.json | aux4-validator --config person 2> invalid.json 1> valid.json
```
### Output

It generates two output the `invalid` files in the **stderr** and the `valid` files in the **stdout**.

### Exit Code

In case of error the exit code is `40`. The parameter `--ignore` will always return `0`.

### Parameters

```
  validate   validate json input
               - configFile Configuration file.
                 It automatically reads config.yaml, config.yml, config.json.
               - config Configuration name
               - lang [en] Validator language
               - raw [false] Raw configuration
               - stream [false] Stream input
               - ignore [false] Ignore errors (always exit code 0)
               - silent [false] Does not output anything
               - onlyValid [false] Output only valid data
               - onlyInvalid [false] Output only invalid data
```

### Validation Rules

#### Available Rules ([validatorjs](https://www.npmjs.com/package/validatorjs))

Validation rules do not have an implicit 'required'. If a field is undefined or an empty string, it will pass validation. If you want a validation to fail for undefined or '', use the required rule.

#### accepted
The field under validation must be yes, on, 1 or true. This is useful for validating "Terms of Service" acceptance.

#### after:date
The field under validation must be after the given date.

#### after_or_equal:date
The field unter validation must be after or equal to the given field

#### alpha
The field under validation must be entirely alphabetic characters.

#### alpha_dash
The field under validation may have alpha-numeric characters, as well as dashes and underscores.

#### alpha_num
The field under validation must be entirely alpha-numeric characters.

#### array
The field under validation must be an array.

#### before:date
The field under validation must be before the given date.

#### before_or_equal:date
The field under validation must be before or equal to the given date.

#### between:min,max
The field under validation must have a size between the given min and max. Strings, numerics, and files are evaluated in the same fashion as the size rule.

#### boolean
The field under validation must be a boolean value of the form true, false, 0, 1, 'true', 'false', '0', '1',

#### confirmed
The field under validation must have a matching field of foo_confirmation. For example, if the field under validation is password, a matching password_confirmation field must be present in the input.

#### date
The field under validation must be a valid date format which is acceptable by Javascript's Date object.

#### digits:value
The field under validation must be numeric and must have an exact length of value.

#### digits_between:min,max
The field under validation must be numeric and must have length between given min and max.

#### different:attribute
The given field must be different than the field under validation.

#### email
The field under validation must be formatted as an e-mail address.

#### hex
The field under validation should be a hexadecimal format. Useful in combination with other rules, like hex|size:6 for hex color code validation.

#### in:foo,bar,...
The field under validation must be included in the given list of values. The field can be an array or string.

#### integer
The field under validation must have an integer value.

#### max:value
Validate that an attribute is no greater than a given size

Note: Maximum checks are inclusive.

#### min:value
Validate that an attribute is at least a given size.

Note: Minimum checks are inclusive.

#### not_in:foo,bar,...
The field under validation must not be included in the given list of values.

#### numeric
Validate that an attribute is numeric. The string representation of a number will pass.

#### present
The field under validation must be present in the input data but can be empty.

#### required
Checks if the length of the String representation of the value is >

#### required_if:anotherfield,value
The field under validation must be present and not empty if the anotherfield field is equal to any value.

#### required_unless:anotherfield,value
The field under validation must be present and not empty unless the anotherfield field is equal to any value.

#### required_with:foo,bar,...
The field under validation must be present and not empty only if any of the other specified fields are present.

#### required_with_all:foo,bar,...
The field under validation must be present and not empty only if all of the other specified fields are present.

#### required_without:foo,bar,...
The field under validation must be present and not empty only when any of the other specified fields are not present.

#### required_without_all:foo,bar,...
The field under validation must be present and not empty only when all of the other specified fields are not present.

#### same:attribute
The given field must match the field under validation.

#### size:value
The field under validation must have a size matching the given value. For string data, value corresponds to the number of characters. For numeric data, value corresponds to a given integer value.

#### string
The field under validation must be a string.

#### url
Validate that an attribute has a valid URL format

#### regex:pattern
The field under validation must match the given regular expression.