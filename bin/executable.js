#!/usr/bin/env node

import colors from "colors";
import validateExecutor from "./command/ValidateCommand.js";

(async () => {
  const args = process.argv.slice(2);

  // Arguments in order: action, rules, lang, stream, ignore, silent, onlyValid, onlyInvalid
  const [action, rules, lang, stream, ignore, silent, onlyValid, onlyInvalid] = args;

  // For now, action is fixed as "validate"
  if (action !== "validate") {
    console.error("Only 'validate' action is supported");
    process.exit(1);
  }

  try {
    // Parse rules JSON
    const rulesConfig = rules && rules !== "" ? JSON.parse(rules) : {};

    // Prepare parameters for ValidateCommand
    const params = {
      rules: rulesConfig,
      lang: lang || "en",
      stream: stream || "",
      ignore: ignore || "",
      silent: silent || "",
      onlyValid: onlyValid || "",
      onlyInvalid: onlyInvalid || "",
      root: "$"
    };

    await validateExecutor(params);
  } catch (e) {
    console.error(e.message.red, e);
    process.exit(1);
  }
})();
