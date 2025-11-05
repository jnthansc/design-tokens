/**
 * JavaScript Nested Formatter with References
 * 
 * Generates clean JavaScript modules with:
 * - Proper object literals (no unnecessary quotes)
 * - Actual JavaScript references between token sets
 * - Bracket notation for numeric/special keys
 * - Preserved nested structure
 */

import { usesReferences, getReferences } from 'style-dictionary/utils';

/**
 * Converts a key to a valid JavaScript property name
 * @param {string} key - The key to validate/quote
 * @returns {string} Valid JS property name or quoted string
 */
function toValidKey(key) {
  // Keys with numbers at start, hyphens, or special chars need quotes
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

/**
 * Converts a path array to JavaScript property access notation
 * @param {string[]} pathArray - Array of path segments
 * @returns {string} JavaScript property access string (e.g., "global.color.palette['100']")
 */
function pathToJS(pathArray) {
  return pathArray.map((key, index) => {
    const validKey = toValidKey(key);
    // Use bracket notation for quoted keys, dot notation otherwise
    if (validKey.startsWith('"') || validKey.startsWith("'")) {
      return `[${validKey}]`;
    }
    return index === 0 ? validKey : `.${validKey}`;
  }).join('');
}

/**
 * Builds a nested object structure from flat token array
 * @param {Array} tokens - Array of token objects
 * @param {string} setName - Name of the token set
 * @param {Object} dictionary - Full token dictionary
 * @param {boolean|Function} outputReferences - Whether to preserve references
 * @returns {Object} Nested object structure
 */
function buildNestedObject(tokens, setName, dictionary, outputReferences) {
  const result = {};

  tokens.forEach((token) => {
    const pathArray = token.path.slice(1); // Remove set name
    let current = result;

    // Navigate/create the nested structure
    for (let i = 0; i < pathArray.length - 1; i++) {
      const key = pathArray[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    // Get the final key name
    const finalKey = pathArray[pathArray.length - 1];
    
    // Handle value with potential references
    const originalValue = token.original.$value || token.original.value;
    const resolvedValue = token.$value || token.value;

    const shouldOutputRef =
      usesReferences(originalValue) &&
      (typeof outputReferences === 'function'
        ? outputReferences(token, { dictionary })
        : outputReferences);

    if (shouldOutputRef) {
      // Store the reference path for later resolution
      const refs = getReferences(originalValue, dictionary.tokens);
      if (refs.length > 0) {
        // Check if references are to the same set or different set
        const isSameSet = refs[0].path[0] === setName;
        
        // For composite values (like typography), keep the object structure
        if (typeof originalValue === 'object' && originalValue !== null) {
          // Check if any refs are cross-set
          const hasCrossSetRef = Object.values(originalValue).some(val => {
            if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
              const refString = val.slice(1, -1);
              const refSet = refString.split('.')[0];
              return refSet !== setName;
            }
            return false;
          });
          
          if (hasCrossSetRef) {
            current[finalKey] = { _ref: originalValue, _resolved: resolvedValue };
          } else {
            // All refs are same-set, use resolved values
            current[finalKey] = resolvedValue;
          }
        } else {
          // Simple reference
          if (isSameSet) {
            // Same set: use resolved value to avoid circular reference
            current[finalKey] = resolvedValue;
          } else {
            // Cross-set reference: keep as JS reference
            current[finalKey] = { _ref: refs[0].value, _refPath: refs[0].path };
          }
        }
      } else {
        current[finalKey] = resolvedValue;
      }
    } else {
      current[finalKey] = resolvedValue;
    }
  });

  return result;
}

/**
 * Converts nested object to JavaScript code string
 * @param {*} obj - Object to convert
 * @param {number} indent - Spaces per indent level
 * @param {number} currentIndent - Current indentation level
 * @returns {string} JavaScript code representation
 */
function objectToJS(obj, indent = 2, currentIndent = 0) {
  const spaces = ' '.repeat(currentIndent);
  const innerSpaces = ' '.repeat(currentIndent + indent);
  
  if (typeof obj !== 'object' || obj === null) {
    return JSON.stringify(obj);
  }

  // Handle reference objects
  if (obj._refPath) {
    return pathToJS(obj._refPath);
  }

  if (obj._ref && typeof obj._ref === 'object') {
    // Composite reference (like typography)
    const parts = [];
    for (const [key, value] of Object.entries(obj._ref)) {
      const validKey = toValidKey(key);
      if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const refPath = pathToJS(value.slice(1, -1).split('.'));
        parts.push(`${innerSpaces}${validKey}: ${refPath}`);
      } else {
        parts.push(`${innerSpaces}${validKey}: ${JSON.stringify(value)}`);
      }
    }
    return `{\n${parts.join(',\n')}\n${spaces}}`;
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }

  const parts = entries.map(([key, value]) => {
    const validKey = toValidKey(key);
    const valueStr = objectToJS(value, indent, currentIndent + indent);
    return `${innerSpaces}${validKey}: ${valueStr}`;
  });

  return `{\n${parts.join(',\n')}\n${spaces}}`;
}

/**
 * Main formatter function for Style Dictionary
 * @param {Object} params - Formatter parameters from Style Dictionary
 * @returns {string} Generated JavaScript module code
 */
export function jsNestedWithReferencesFormatter({ dictionary, options }) {
  const { outputReferences = true } = options;

  // Separate tokens by their top-level set (global, semantic, etc.)
  const tokensBySet = {};
  
  dictionary.allTokens.forEach((token) => {
    const setName = token.path[0];
    if (!tokensBySet[setName]) {
      tokensBySet[setName] = [];
    }
    tokensBySet[setName].push(token);
  });

  // Build output
  let output = '';
  const setNames = Object.keys(tokensBySet);

  // Generate each token set as a constant
  setNames.forEach(setName => {
    const tokens = tokensBySet[setName];
    const nestedObj = buildNestedObject(tokens, setName, dictionary, outputReferences);
    const validSetName = toValidKey(setName);
    output += `const ${validSetName} = ${objectToJS(nestedObj, 2, 0)};\n\n`;
  });

  // Export all sets
  output += `export default {\n`;
  output += setNames.map(name => `  ${toValidKey(name)}`).join(',\n');
  output += '\n};\n';

  return output;
}


