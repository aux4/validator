# aux4/validator

aux4 data validator

aux4/validator is a utility package for validating JSON input against specified rules. It integrates with the aux4 CLI framework, allowing you to stream and filter JSON data efficiently.

## Installation

```bash
aux4 aux4 pkger install aux4/validator
```

## Quick Start

Create a `config.yaml`:

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

Validate JSON data:

```bash
echo '{"name":"John","age":25}' \
  | aux4 validator validate --config data --rules person
```

## Usage

The `aux4/validator` package provides commands to validate JSON input according to your rules.

### Main Commands

- [`aux4 validator validate`](./commands/validator/validate) - Validate JSON input against specified rules.

### Command Reference

#### aux4 validator validate

Validate JSON input.

Variables:

- `--config` (required) - Configuration section name in config.yaml.
- `--rules` (required) - Rule set name within the config section.
- `--lang` (optional, default: `en`) - Validator language.
- `--stream` (optional, default: `false`) - Enable stream (newline-delimited JSON) mode.
- `--ignore` (optional, default: `false`) - Ignore validation errors and always exit with code 0.
- `--silent` (optional, default: `false`) - Suppress all output.
- `--onlyValid` (optional, default: `false`) - Output only valid inputs.
- `--onlyInvalid` (optional, default: `false`) - Output only invalid inputs.

## Examples

Given this sample `person.json`:

```json
[
  {
    "name": "John",
    "age": 25
  },
  {
    "name": "Eve",
    "age": 6
  },
  {
    "name": "Stella",
    "age": 39
  }
]
```

### Get Only Valid Entries

```bash
cat person.json | aux4 validator validate --config data --rules person --ignore --onlyValid | jq .
```

Output:
```json
[
  {
    "name": "John",
    "age": 25
  },
  {
    "name": "Stella",
    "age": 39
  }
]
```

### Get Only Invalid Entries with Errors

```bash
cat person.json | aux4 validator validate --config data --rules person --onlyInvalid 2>&1 | jq .
```

Output:
```json
[
  {
    "item": {
      "name": "Eve",
      "age": 6
    },
    "errors": {
      "age": [
        "The age must be at least 18."
      ]
    }
  }
]
```

### Stream Mode for Large Files

```bash
cat person.json | aux4 validator validate --config data --rules person --stream --ignore --onlyValid | jq .
```

Output:
```json
{
  "name": "John",
  "age": 25
}
{
  "name": "Stella",
  "age": 39
}
```

## See Also

- [aux4/config](/r/public/packages/aux4/config)
- [aux4/adapter](/r/public/packages/aux4/adapter)

## License

See the [LICENSE](./license) file for license details.
