import RuleExtractor from "../../lib/RuleExtractor.js";
import Validator from "validatorjs";
import { value as jsonpath } from "./JsonPath.js";
import { getLanguageMessages } from "./LanguageLoader.js";
import { parse as jsonStreamParse } from "./JsonStreamParser.js";

async function validateExecutor(params) {

  const lang = params.lang || "en";
  const rulesConfig = params.rules;
  const stream = getBooleanParam(params.stream);
  const ignore = getBooleanParam(params.ignore);
  const silent = getBooleanParam(params.silent);
  const onlyValid = getBooleanParam(params.onlyValid);
  const onlyInvalid = getBooleanParam(params.onlyInvalid);
  const root = params.root;

  // Load language messages from validatorjs language files
  const messages = await getLanguageMessages(lang);
  if (messages) {
    Validator.setMessages(lang, messages);
    Validator.useLang(lang);
  } else {
    // Fallback to English if language is not supported
    const enMessages = await getLanguageMessages('en');
    Validator.setMessages('en', enMessages);
    Validator.useLang('en');
  }

  const rules = RuleExtractor.extractRules(rulesConfig);

  // Use streaming approach for both stream and non-stream modes to avoid memory issues
  const dataStream = streamInput(root);
  let hasInvalidItems = false;
  let processedItems = 0;
  let validItems = [];
  let invalidItems = [];
  
  dataStream.on("data", data => {
    const [valid, invalid] = validate(data, rules);
    processedItems++;
    
    if (stream) {
      // Stream mode: output immediately
      printOutput(false, valid, invalid, { silent, onlyValid, onlyInvalid });
    } else {
      // Non-stream mode: collect items but don't load all JSON in memory
      validItems = validItems.concat(valid);
      invalidItems = invalidItems.concat(invalid);
    }
    
    // Set exit code if there are invalid items and ignore is false
    if (!ignore && invalid.length > 0) {
      hasInvalidItems = true;
      if (stream) {
        process.exitCode = 40;
      }
    }
  });
  
  dataStream.on("error", error => {
    console.error("Stream error:", error.message.red);
    process.exit(1);
  });
  
  dataStream.on("end", () => {
    if (!stream) {
      // Non-stream mode: output collected results
      printOutput(processedItems > 1, validItems, invalidItems, { silent, onlyValid, onlyInvalid });
    }
    
    if (!ignore && hasInvalidItems) {
      process.exit(40);
    } else if (stream && process.exitCode !== 40) {
      process.exit(0);
    }
  });
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
  stream(JSON.stringify(outputData));
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

async function readAsJson(path = "$") {
  return await read(process.openStdin())
    .then(text => {
      if (text === "") return undefined;

      return JSON.parse(text);
    })
    .then(json => {
      if (!json) return undefined;

      return jsonpath(json, path);
    });
}

function streamInput(path = "$") {
  let jsonPath;
  if (path === "$") {
    // For root path, parse array elements
    jsonPath = [true];
  } else {
    // For specific paths, use the path
    jsonPath = path.replace("$.", "");
  }
  return process.stdin.pipe(jsonStreamParse(jsonPath));
}

async function read(buffer) {
  return new Promise((resolve, reject) => {
    let inputString = "";

    buffer.on("data", data => {
      inputString += data;
    });

    buffer.on("error", error => {
      reject(error);
    });

    buffer.on("end", () => {
      resolve(inputString);
    });
  });
}

export default validateExecutor;
