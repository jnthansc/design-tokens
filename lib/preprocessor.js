/**
 * Tokens Studio Preprocessor
 * 
 * Handles Tokens Studio's reference format and resolves unqualified references
 * to their correct token set. Supports unlimited token hierarchy depth.
 * 
 * Examples:
 * - {color.primary} → {global.color.primary}
 * - {button.primary} → {semantic.button.primary}
 * - {cta.background} → {component.cta.background}
 */

/**
 * Builds a registry mapping token paths to their source set
 * @param {Object} obj - Token object to scan
 * @param {string[]} currentPath - Current path in the token tree
 * @param {string} setName - Name of the token set (global, semantic, etc.)
 * @param {Map} registry - Registry to populate
 */
function buildRegistry(obj, currentPath, setName, registry) {
  if (!obj || typeof obj !== 'object') return;
  
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    
    if (value && typeof value === 'object') {
      const newPath = [...currentPath, key];
      if (value.$value !== undefined) {
        // This is a token - register its path
        const pathKey = newPath.join('.');
        registry.set(pathKey, setName);
      } else {
        // It's a group, recurse
        buildRegistry(value, newPath, setName, registry);
      }
    }
  }
}

/**
 * Fixes reference strings by adding the correct set prefix
 * @param {string} value - Value that may contain references
 * @param {Map} tokenRegistry - Registry of token paths to sets
 * @param {Object} dictionary - Full token dictionary
 * @returns {string} Value with qualified references
 */
function fixReferences(value, tokenRegistry, dictionary) {
  if (typeof value !== 'string') return value;
  
  return value.replace(/\{([^}]+)\}/g, (match, ref) => {
    // Already has a set prefix, leave as-is
    if (ref.includes('.') && tokenRegistry.has(ref.split('.').slice(1).join('.'))) {
      const firstPart = ref.split('.')[0];
      if ([...tokenRegistry.values()].includes(firstPart)) {
        return match;
      }
    }
    
    // Look up which set this token belongs to
    const targetSet = tokenRegistry.get(ref);
    
    if (targetSet) {
      // Found it - add the correct set prefix
      return `{${targetSet}.${ref}}`;
    }
    
    // Check if it already starts with a known set name
    for (const [setName] of Object.entries(dictionary)) {
      if (ref.startsWith(setName + '.') && !setName.startsWith('$')) {
        return match; // Already qualified
      }
    }
    
    // Fallback: assume it's a global token (backwards compatible)
    return `{global.${ref}}`;
  });
}

/**
 * Recursively fixes references in composite objects (like typography tokens)
 * @param {Object} obj - Object containing references
 * @param {Map} tokenRegistry - Registry of token paths to sets
 * @param {Object} dictionary - Full token dictionary
 * @returns {Object} Object with qualified references
 */
function fixObjectReferences(obj, tokenRegistry, dictionary) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = fixReferences(value, tokenRegistry, dictionary);
    } else if (typeof value === 'object') {
      result[key] = fixObjectReferences(value, tokenRegistry, dictionary);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Recursively processes token objects and fixes their references
 * @param {Object} obj - Token object to process
 * @param {Map} tokenRegistry - Registry of token paths to sets
 * @param {Object} dictionary - Full token dictionary
 * @returns {Object} Processed token object
 */
function processTokens(obj, tokenRegistry, dictionary) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) {
      // Handle special keys like $type, $value, $description
      result[key] = value;
      continue;
    }
    
    if (value && typeof value === 'object') {
      // Check if this is a token (has $value) or a group
      if (value.$value !== undefined) {
        result[key] = { ...value };
        // Fix references in $value if it's a string
        if (typeof value.$value === 'string' && value.$value.includes('{')) {
          result[key].$value = fixReferences(value.$value, tokenRegistry, dictionary);
        }
        // Fix references in composite values (like typography)
        else if (typeof value.$value === 'object') {
          result[key].$value = fixObjectReferences(value.$value, tokenRegistry, dictionary);
        }
      } else {
        // It's a group, recurse
        result[key] = processTokens(value, tokenRegistry, dictionary);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Main preprocessor function
 * @param {Object} dictionary - The token dictionary from Tokens Studio
 * @returns {Object} Processed dictionary with qualified references
 */
export function tokensStudioPreprocessor(dictionary) {
  // Build a token path registry to resolve unqualified references
  const tokenRegistry = new Map();
  
  // Build registry for all token sets
  for (const [setName, tokens] of Object.entries(dictionary)) {
    if (!setName.startsWith('$')) {
      buildRegistry(tokens, [], setName, tokenRegistry);
    }
  }
  
  // Process each token set
  const processed = {};
  for (const [setName, tokens] of Object.entries(dictionary)) {
    if (setName.startsWith('$')) {
      // Keep metadata as-is
      processed[setName] = tokens;
    } else {
      processed[setName] = processTokens(tokens, tokenRegistry, dictionary);
    }
  }
  
  return processed;
}


