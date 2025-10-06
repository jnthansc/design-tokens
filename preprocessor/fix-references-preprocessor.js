/**
 * Style Dictionary Preprocessor: Fix References
 * 
 * Fixes token references to maintain strict hierarchy:
 * - Global tokens reference other global tokens
 * - Semantic tokens reference global tokens  
 * - Component tokens reference semantic tokens (when added)
 */

// Fix references to maintain strict hierarchy
function fixReferences(obj, prefix) {
  if (typeof obj === 'string' && obj.includes('{') && obj.includes('}')) {
    // Replace references like {color.palette.white} with {global.color.palette.white}
    return obj.replace(/{([^}]+)}/g, (match, reference) => {
      // Don't modify if already has the correct prefix
      if (reference.startsWith(prefix)) {
        return match;
      }
      // Add the required prefix
      return `{${prefix}${reference}}`;
    });
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = fixReferences(value, prefix);
    }
    return result;
  }
  
  return obj;
}

export const fixReferencesPreprocessor = {
  name: 'fix-references',
  preprocessor: (dictionary, options) => {
    // Fix references based on strict hierarchy:
    // - semantic tokens only reference global tokens
    // - component tokens only reference semantic tokens (when added later)
    
    // Fix references in global tokens (for internal references within global)
    if (dictionary.global) {
      dictionary.global = fixReferences(dictionary.global, 'global.');
    }
    
    if (dictionary.semantic) {
      dictionary.semantic = fixReferences(dictionary.semantic, 'global.');
    }
    
    // Future: when component tokens are added
    // if (dictionary.component) {
    //   dictionary.component = fixReferences(dictionary.component, 'semantic.');
    // }
    
    return dictionary;
  },
};
