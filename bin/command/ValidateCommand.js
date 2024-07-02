const { ConfigLoader } = require("@aux4/config");
const RuleExtractor = require("../../lib/RuleExtractor");
const Input = require("@aux4/input");
const Validator = require("validatorjs");

async function validateExecutor(params) {
  const lang = (await params.lang) || "en";
  const raw = getBooleanParam(await params.raw);
  const stream = getBooleanParam(await params.stream);
  const ignore = getBooleanParam(await params.ignore);
  const silent = getBooleanParam(await params.silent);
  const onlyValid = getBooleanParam(await params.onlyValid);
  const onlyInvalid = getBooleanParam(await params.onlyInvalid);
  const root = await params.root;

  Validator.useLang(lang);

  const config = await loadConfig(params);
  if (!config) {
    throw new Error(`Configuration not found: ${params.config}`);
  }

  let rules;
  if (raw) {
    rules = config;
  } else {
    rules = RuleExtractor.extractRules(config);
  }

  if (stream) {
    const dataStream = Input.stream(root);
    dataStream.on("data", data => {
      const [valid, invalid] = validate(data, rules);
      printOutput(Array.isArray(data), valid, invalid, { silent, onlyValid, onlyInvalid });
    });
  } else {
    const data = await Input.readAsJson(root);
    console.log("data", JSON.stringify(data, null, 2));
    const [valid, invalid] = validate(data, rules);

    printOutput(Array.isArray(data), valid, invalid, { silent, onlyValid, onlyInvalid });

    if (!ignore && invalid.length > 0) {
      process.exit(40);
    }
  }
}

function getBooleanParam(value) {
  return value === "true" || value === true;
}

function printOutput(isArray, valid, invalid, options) {
  if (options.silent) return;

  if (!options.onlyInvalid) {
    print(console.log, valid, isArray);
  }

  if (!options.onlyValid) {
    print(console.error, invalid, isArray);
  }
}

function print(stream, data, isArray) {
  if (data.length === 0) return;

  const outputData = isArray ? data : data[0];
  stream(JSON.stringify(outputData, null, 2));
}

function validate(data, rules) {
  const valid = [];
  const invalid = [];

  const inputData = Array.isArray(data) ? data : [data];

  inputData.forEach(item => {
    const result = validateObject(item, rules);
    if (result.valid) {
      valid.push(item);
    } else {
      invalid.push({ item, errors: result.errors });
    }
  });

  return [valid, invalid];
}

function validateObject(object, rules) {
  const validator = new Validator(object, rules);

  return {
    valid: validator.passes(),
    errors: validator.errors.all()
  };
}

async function loadConfig(params) {
  const configFile = await params.configFile;
  const configName = await params.config;

  const config = ConfigLoader.load(configFile);
  return config.get(configName);
}

module.exports = validateExecutor;
