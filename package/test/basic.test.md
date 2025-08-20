# Basic

## Simple validation

```file:config.yaml
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

```file:person.json
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

### Only valid entries

```execute
cat person.json | aux4 validator validate --config data --rules person --ignore --onlyValid | jq .
```

```expect
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

### only invalid entries

```execute
cat person.json | aux4 validator validate --config data --rules person --onlyInvalid 2>&1 | jq .
```

```expect
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

### All entries

```execute
cat person.json | aux4 validator validate --config data --rules person --ignore 2>&1 | jq .
```

```expect
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

### Stream mode

```execute
cat person.json | aux4 validator validate --config data --rules person --stream --ignore --onlyValid | jq .
```

```expect
{
  "name": "John",
  "age": 25
}
{
  "name": "Stella",
  "age": 39
}
```
