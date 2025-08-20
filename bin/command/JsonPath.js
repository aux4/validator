const pathCache = new Map();

function parsePath(path) {
  if (pathCache.has(path)) {
    return pathCache.get(path);
  }

  // Handle simple dot notation like "$.name" or "name"
  let normalizedPath = path;
  if (path.startsWith("$.")) {
    normalizedPath = path.substring(2);
  } else if (path.startsWith("$")) {
    normalizedPath = path.substring(1);
  }

  if (!normalizedPath) {
    pathCache.set(path, []);
    return [];
  }

  // Split path by dots, handling array indices - optimized regex
  const parts = normalizedPath.split(/[.\[\]]/).filter(Boolean);

  // Pre-compile parts for faster lookup
  const compiledParts = parts.map(part => {
    if (/^\d+$/.test(part)) {
      return { type: "index", value: parseInt(part, 10) };
    }
    return { type: "property", value: part };
  });

  pathCache.set(path, compiledParts);
  return compiledParts;
}

function value(obj, path) {
  if (!obj || !path) return undefined;

  const parts = parsePath(path);
  if (parts.length === 0) return obj;

  let current = obj;
  // Optimize: Use for loop and early returns for better performance
  for (let i = 0; i < parts.length; i++) {
    if (current == null) return undefined; // Covers both null and undefined

    const part = parts[i];
    current = current[part.value]; // Works for both arrays and objects
  }

  return current;
}

export { value };
