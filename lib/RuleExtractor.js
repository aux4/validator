class RuleExtractor {
  static extractRules(config) {
    const rules = {};

    const object = config.mapping || config;

    Object.entries(object).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      // Handle simple string rules directly
      if (typeof value === "string") {
        rules[key] = value;
        return;
      }
      
      // Handle object-based rules
      if (typeof value !== "object") return;

      if (value.rule) {
        rules[key] = value.rule;
        return;
      }

      if (value.type === 'array' && value.mapping) {
        const nestedRules = RuleExtractor.extractRules(value.mapping);
        Object.entries(nestedRules).forEach(([nestedKey, nestedRule]) => {
          rules[`${key}.*.${nestedKey}`] = nestedRule;
        });
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

export default RuleExtractor;
