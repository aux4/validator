#!/usr/bin/env node

const { Engine } = require("@aux4/engine");
const validateExecutor = require("./command/ValidateCommand");

const config = {
  profiles: [
    {
      name: "main",
      commands: [
        {
          name: "validate",
          execute: validateExecutor,
          help: {
            text: "validate json input",
            variables: [
              {
                name: "configFile",
                text: "Configuration file.\nIt automatically reads *config.yaml*, *config.yml*, *config.json*.",
                default: ""
              },
              {
                name: "config",
                text: "Configuration name",
                default: ""
              },
              {
                name: "lang",
                text: "Validator language",
                default: "en"
              },
              {
                name: "raw",
                text: "Raw configuration",
                default: "false"
              },
              {
                name: "stream",
                text: "Stream input",
                default: "false"
              },
              {
                name: "ignore",
                text: "Ignore errors (always exit code 0)",
                default: "false"
              },
              {
                name: "silent",
                text: "Does not output anything",
                default: "false"
              },
              {
                name: "onlyValid",
                text: "Output only valid data",
                default: "false"
              },
              {
                name: "onlyInvalid",
                text: "Output only invalid data",
                default: "false"
              }
            ]
          }
        }
      ]
    }
  ]
};

(async () => {
  const engine = new Engine({ aux4: config });

  const args = process.argv.splice(2);

  try {
    await engine.run(args);
  } catch (e) {
    console.error(e.message.red);
    process.exit(1);
  }
})();
