const RuleExtractor = require("../../lib/RuleExtractor");

describe("RuleExtractor", () => {
  describe("extract", () => {
    let config, rules;

    describe("given simple object", () => {
      beforeEach(() => {
        config = {
          name: {
            rule: "alpha|required"
          },
          age: {
            rule: "integer"
          }
        };

        rules = RuleExtractor.extractRules(config);
      });

      it("should return rules", () => {
        expect(rules).toEqual({
          name: "alpha|required",
          age: "integer"
        });
      });
    });

    describe("given nested object with mapping", () => {
      beforeEach(() => {
        config = {
          name: {
            rule: "alpha|required"
          },
          age: {
            rule: "integer"
          },
          address: {
            mapping: {
              street: {
                rule: "required"
              },
              city: {
                rule: "required"
              },
              state: {
                rule: "required"
              },
              zip: {
                rule: "integer|required|max:5"
              }
            }
          }
        };

        rules = RuleExtractor.extractRules(config);
      });

      it("should return rules", () => {
        expect(rules).toEqual({
          name: "alpha|required",
          age: "integer",
          address: {
            street: "required",
            city: "required",
            state: "required",
            zip: "integer|required|max:5"
          }
        });
      });
    });

    describe("given nested object without mapping", () => {
      beforeEach(() => {
        config = {
          name: {
            rule: "alpha|required"
          },
          age: {
            rule: "integer"
          },
          address: {
            street: {
              rule: "required"
            },
            city: {
              rule: "required"
            },
            state: {
              rule: "required"
            },
            zip: {
              rule: "integer|required|max:5"
            }
          }
        };

        rules = RuleExtractor.extractRules(config);
      });

      it("should return rules", () => {
        expect(rules).toEqual({
          name: "alpha|required",
          age: "integer",
          address: {
            street: "required",
            city: "required",
            state: "required",
            zip: "integer|required|max:5"
          }
        });
      });
    });
  });
});
