class RuleExtractor {
  static extractRules(config) {
    const rules = {};

    Object.entries(config).forEach(([key, value]) => {
      if (value === undefined || value === null || typeof value !== "object") return;

      if (value.rule) {
        rules[key] = value.rule;
        return;
      }

      if (value.mapping) {
        rules[key] = RuleExtractor.extractRules(value.mapping);
        return;
      }

      rules[key] = RuleExtractor.extractRules(value);
    });

    return rules;
  }
}

module.exports = RuleExtractor;
