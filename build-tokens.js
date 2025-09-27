#!/usr/bin/env node

const fs = require('fs');

// Read the original tokens.json (preserving nested structure)
const originalTokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));

// Helper function to convert path to camelCase name
function pathToCamelCase(path) {
  return path
    .join(' ')
    .replace(/[\s\-_]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

// Helper function to process token values and preserve references
function processTokenValue(originalValue, nestedStructure) {
  if (typeof originalValue === 'string' && originalValue.includes('{') && originalValue.includes('}')) {
    // Extract references from the original value
    const referencePattern = /\{([^}]+)\}/g;
    let match;
    const references = [];
    
    while ((match = referencePattern.exec(originalValue)) !== null) {
      references.push(match[1]);
    }

    if (references.length > 0) {
      // Convert reference paths to nested object access
      const refNames = references.map(ref => {
        const refPath = ref.split('.');
        return refPath.join('.');
      });

      // Check if this is entirely a reference
      const isEntirelyRef = references.length === 1 && originalValue === `{${references[0]}}`;

      if (isEntirelyRef) {
        // Direct reference using nested structure
        return refNames[0];
      } else {
        // Template literal with references
        let templateValue = originalValue;
        references.forEach((ref, index) => {
          templateValue = templateValue.replace(`{${ref}}`, `\${${refNames[index]}}`);
        });
        return `\`${templateValue}\``;
      }
    }
  }
  
  return JSON.stringify(originalValue);
}

// Helper function to convert nested object to nested JavaScript structure
function processNestedTokens(obj, path = []) {
  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object' && value.value !== undefined && value.type !== undefined) {
      // This is a token - process its value
      result[key] = processTokenValue(value.value, obj);
    } else if (value && typeof value === 'object') {
      // Recurse into nested structure
      result[key] = processNestedTokens(value, [...path, key]);
    }
  }
  
  return result;
}

// Generate nested JavaScript object structure
function generateNestedES6(nestedTokens, indent = 0) {
  const spaces = '  '.repeat(indent);
  const entries = [];
  
  for (const [key, value] of Object.entries(nestedTokens)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Nested object
      entries.push(`${spaces}  ${key}: {\n${generateNestedES6(value, indent + 2)}\n${spaces}  }`);
    } else {
      // Token value
      entries.push(`${spaces}  ${key}: ${value}`);
    }
  }
  
  return entries.join(',\n');
}

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Process tokens from the global key (preserving the nested structure)
const globalTokens = originalTokens.global || {};
const nestedTokens = processNestedTokens(globalTokens);

console.log('Processing tokens with preserved nested structure...');

// Generate the nested ES6 export
const es6Content = `const tokens = {
${generateNestedES6(nestedTokens)}
};

// Named exports for easy access to token categories
export const { 
  color, 
  shadow, 
  fontFamilies, 
  lineHeights, 
  fontWeights, 
  fontSize, 
  letterSpacing, 
  paragraphSpacing, 
  textstyle, 
  textCase, 
  textDecoration, 
  paragraphIndent 
} = tokens;

export default tokens;
`;

// Write only the JavaScript file
fs.writeFileSync('dist/tokens.js', es6Content);

console.log('✅ Created tokens.js with preserved nested structure and references!');