# aux4/validator

aux4 data validator

aux4/validator validates JSON input against rule definitions (typically stored in an aux4 config). It integrates with aux4/config to extract rule sets from your configuration and provides streaming and filtering options so you can validate large data sets or pipeline results easily.

## Installation

```bash
aux4 aux4 pkger install aux4/validator
```

## Quick Start

Create a config.yaml with your rule definitions (see Configuration below). Then validate JSON input from a file or a pipeline:

```bash
cat person.json \
  | aux4 aux4 validator validate --config data --rules person --ignore --onlyValid | jq .
```

This will output only the valid items from the `person` rule set.

## Usage

aux4/validator exposes a single profile of commands for validating JSON input.

### Main Commands

- [`aux4 aux4 validator validate`](./commands/validator/validate) - Validate JSON input against a named rule set.

### Command Reference

aux4 aux4 validator validate

Description: Validate JSON input. The command reads JSON from stdin (either an array or newline-delimited JSON when --stream is used) and validates each item according to the rule mapping extracted from your aux4 config.

Variables (defined in the package):

- `--rules` (required) - Rule set name within the configuration. This is the set of validation rules to apply (see Configuration examples).
- `--lang` (optional, default: `en`) - Validation language for error messages.
- `--stream` (optional, default: `false`) - Treat stdin as a stream of newline-delimited JSON objects (instead of a single JSON array).
- `--ignore` (optional, default: `false`) - Ignore validation errors and exit with code 0 (useful when you only want filtered output).
- `--silent` (optional, default: `false`) - Suppress all output.
- `--onlyValid` (optional, default: `false`) - Output only valid items.
- `--onlyInvalid` (optional, default: `false`) - Output only invalid items (emits error objects to stderr when not using --ignore).

Note: This package depends on `aux4/config` to extract configuration sections. Use the `--config` option (provided by aux4/config) to point to the config section that contains your rule definitions (for example `--config data`).

## Examples

The examples below are lifted from the package tests and show common workflows.

### Example config (config.yaml)

```yaml
config:
  data:
    person:
      name:
        path: $.name
        rule: required
      age:
        path: $.age
        rule: required|integer|min:18
```

Save this as `config.yaml` and make it available to aux4 (via your project config mechanism or aux4/config).

Create `person.json`:

```json
[
  {"name": "John", "age": 25},
  {"name": "Eve",  "age": 6},
  {"name": "Stella","age": 39}
]
```

### Get only valid entries

```bash
cat person.json \
  | aux4 aux4 validator validate --config data --rules person --ignore --onlyValid | jq .
```

Output:

```json
[
  {"name":"John","age":25},
  {"name":"Stella","age":39}
]
```

### Get only invalid entries (with errors)

```bash
cat person.json \
  | aux4 aux4 validator validate --config data --rules person --onlyInvalid 2>&1 | jq .
```

Output (example):

```json
[
  {
    "item": {"name":"Eve","age":6},
    "errors": {
      "age": ["The age must be at least 18."]
    }
  }
]
```

### Stream mode (newline-delimited JSON)

```bash
cat person.json \
  | aux4 aux4 validator validate --config data --rules person --stream --ignore --onlyValid | jq .
```

Output (each valid item emitted separately):

```json
{ "name": "John", "age": 25 }
{ "name": "Stella", "age": 39 }
```

## Advanced: Nested objects and arrays

You can define nested mappings and arrays in your rule set. Example rules (in config.yaml):

```yaml
config:
  data:
    nested-fields:
      name:
        path: $.name
        rule: "alpha|required"
      age:
        path: $.age
        rule: "integer"
      address:
        path: $.address
        mapping:
          street:
            path: $.street
            rule: "required"
          city:
            path: $.city
            rule: "required"
          state:
            path: $.state
            rule: "required"
          zip:
            path: $.zip
            rule: "integer|required"
    nested-array:
      name:
        path: $.name
        rule: "alpha|required"
      age:
        path: $.age
        rule: "integer"
      contacts:
        path: $.contacts
        type: array
        mapping:
          email:
            path: $.email
            rule: "email|required"
          phone:
            path: $.phone
            rule: "required"
```

Validate nested objects or arrays the same way:

```bash
echo '[{"name":"John","age":25,"address":{"street":"123 Main St","city":"Boston","state":"MA","zip":12345}}]' \
  | aux4 aux4 validator validate --config data --rules nested-fields --ignore --onlyValid | jq .
```

Expected output: the reconstructed, validated object.

## Configuration

aux4/validator expects your validation rule sets to be available inside your aux4 configuration (for example under `config.data`). Each rule set is a mapping of field names to objects specifying `path`, `rule`, and optionally `type` and `mapping` for nested structures. See the `test/*.test.md` files in this package for many real examples you can copy.

### Minimal rule entry

```yaml
fieldName:
  path: $.json.path
  rule: "required|integer"
```

## Package manifest (.aux4)

Below is the package .aux4 manifest that defines profiles, commands and variables for this package.

```json
{
  "scope": "aux4",
  "name": "validator",
  "version": "1.1.0",
  "description": "aux4 data validator",
  "dependencies": [
    "aux4/config"
  ],
  "tags": [
    "aux4",
    "validator",
    "data",
    "json"
  ],
  "profiles": [
    {
      "name": "main",
      "commands": [
        {
          "name": "validator",
          "execute": [
            "profile:validator"
          ],
          "help": {
            "text": "aux4 data validator"
          }
        }
      ]
    },
    {
      "name": "validator",
      "commands": [
        {
          "name": "validate",
          "execute": [
            "stdin:node ${packageDir}/lib/aux4-validator.mjs validate value($rules) values(lang, stream, ignore, silent, onlyValid, onlyInvalid)"
          ],
          "help": {
            "text": "validate json input",
            "variables": [
              {
                "name": "rules",
                "text": "Validation rules"
              },
              {
                "name": "lang",
                "text": "Validator language",
                "default": "en"
              },
              {
                "name": "stream",
                "text": "Stream input",
                "default": "false"
              },
              {
                "name": "ignore",
                "text": "Ignore errors (always exit code 0)",
                "default": "false"
              },
              {
                "name": "silent",
                "text": "Does not output anything",
                "default": "false"
              },
              {
                "name": "onlyValid",
                "text": "Output only valid data",
                "default": "false"
              },
              {
                "name": "onlyInvalid",
                "text": "Output only invalid data",
                "default": "false"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

## See Also

- [aux4/config](/r/public/packages/aux4/config) - extract configuration sections used by this validator

## License

This package is licensed under the Apache License, Version 2.0.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./license)
