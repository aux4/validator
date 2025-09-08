# Rule Extractor

## Simple object extraction

```file:config.yaml
config:
  data:
    simple:
      name:
        path: $.name
        rule: "alpha|required"
      age:
        path: $.age
        rule: "integer"
```

```execute
echo '[{"name":"John","age":25}]' | aux4 validator validate --config data --rules simple --ignore --onlyValid | jq .
```

```expect
{
  "name": "John",
  "age": 25
}
```

```execute
echo '[{"name":"123","age":"abc"}]' | aux4 validator validate --config data --rules simple --onlyInvalid 2>&1 | jq .
```

```expect
{
  "item": {
    "name": "123",
    "age": "abc"
  },
  "errors": {
    "name": [
      "The name field must contain only alphabetic characters."
    ],
    "age": [
      "The age must be an integer."
    ]
  }
}
```

## Nested object validation

```file:config.yaml
config:
  data:
    simple:
      name:
        path: $.name
        rule: "alpha|required"
      age:
        path: $.age
        rule: "integer"
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
```

```execute
echo '[{"name":"John","age":25,"address":{"street":"123 Main St","city":"Boston","state":"MA","zip":12345}}]' | aux4 validator validate --config data --rules nested-fields --ignore --onlyValid | jq .
```

```expect
{
  "name": "John",
  "age": 25,
  "address": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "zip": 12345
  }
}
```

```execute
echo '[{"name":"John","age":25,"address":{"street":"","city":"","state":"","zip":"abc"}}]' | aux4 validator validate --config data --rules nested-fields --onlyInvalid 2>&1 | jq .
```

```expect
{
  "item": {
    "name": "John",
    "age": 25,
    "address": {
      "street": "",
      "city": "",
      "state": "",
      "zip": "abc"
    }
  },
  "errors": {
    "address.street": [
      "The address.street field is required."
    ],
    "address.city": [
      "The address.city field is required."
    ],
    "address.state": [
      "The address.state field is required."
    ],
    "address.zip": [
      "The address.zip must be an integer."
    ]
  }
}
```
