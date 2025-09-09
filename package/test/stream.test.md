# Stream Mode Validation

## Simple stream validation

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
echo '[{"name":"John","age":25},{"name":"123","age":"abc"},{"name":"Alice","age":30}]' | aux4 validator validate --config data --rules simple --stream --ignore 2>&1
```

```expect
{"name":"John","age":25}
{"item":{"name":"123","age":"abc"},"errors":{"name":["The name field must contain only alphabetic characters."],"age":["The age must be an integer."]}}
{"name":"Alice","age":30}
```

## Stream with nested objects

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
echo '[{"name":"John","age":25,"address":{"street":"123 Main St","city":"Boston","state":"MA","zip":12345}},{"name":"Jane","age":30,"address":{"street":"","city":"","state":"","zip":"abc"}}]' | aux4 validator validate --config data --rules nested-fields --stream --ignore 2>&1
```

```expect
{"name":"John","age":25,"address":{"street":"123 Main St","city":"Boston","state":"MA","zip":12345}}
{"item":{"name":"Jane","age":30,"address":{"street":"","city":"","state":"","zip":"abc"}},"errors":{"address.street":["The address.street field is required."],"address.city":["The address.city field is required."],"address.state":["The address.state field is required."],"address.zip":["The address.zip must be an integer."]}}
```

## Stream with nested arrays

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

```execute
echo '[{"name":"John","age":25,"contacts":[{"email":"john@example.com","phone":"555-1234"}]},{"name":"Jane","age":30,"contacts":[{"email":"invalid-email","phone":""}]}]' | aux4 validator validate --config data --rules nested-array --stream --ignore 2>&1
```

```expect
{"name":"John","age":25,"contacts":[{"email":"john@example.com","phone":"555-1234"}]}
{"item":{"name":"Jane","age":30,"contacts":[{"email":"invalid-email","phone":""}]},"errors":{"contacts.0.email":["The contacts.0.email format is invalid."],"contacts.0.phone":["The contacts.0.phone field is required."]}}
```