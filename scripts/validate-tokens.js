#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validates the design tokens JSON file
 */
function validateTokens() {
  const tokensPath = path.join(__dirname, '..', 'tokens.json');
  
  try {
    // Check if file exists
    if (!fs.existsSync(tokensPath)) {
      throw new Error('tokens.json file not found');
    }

    // Parse JSON
    const tokensContent = fs.readFileSync(tokensPath, 'utf8');
    const tokens = JSON.parse(tokensContent);

    // Validate structure
    if (!tokens.global) {
      throw new Error('Missing "global" token set');
    }

    // Validate token format
    validateTokenStructure(tokens.global, 'global');

    // Check for circular references
    checkCircularReferences(tokens.global);

    // Validate required token categories
    const requiredCategories = ['color', 'fontFamilies', 'fontSize', 'lineHeights'];
    const missingCategories = requiredCategories.filter(
      category => !tokens.global[category]
    );

    if (missingCategories.length > 0) {
      console.warn(`Warning: Missing token categories: ${missingCategories.join(', ')}`);
    }

    console.log('✅ Token validation passed');
    return true;

  } catch (error) {
    console.error('❌ Token validation failed:', error.message);
    process.exit(1);
  }
}

function validateTokenStructure(obj, path = '') {
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (value && typeof value === 'object') {
      // Check if this is a token (has value and type)
      if (value.value !== undefined && value.type !== undefined) {
        validateToken(value, currentPath);
      } else {
        // Recurse into nested structure
        validateTokenStructure(value, currentPath);
      }
    }
  }
}

function validateToken(token, path) {
  // Validate required properties
  if (!token.value) {
    throw new Error(`Token at ${path} missing required "value" property`);
  }

  if (!token.type) {
    throw new Error(`Token at ${path} missing required "type" property`);
  }

  // Validate token types
  const validTypes = [
    'color', 'dimension', 'fontFamily', 'fontWeight', 'fontSize', 
    'lineHeight', 'letterSpacing', 'paragraphSpacing', 'textCase', 
    'textDecoration', 'boxShadow', 'typography', 'fontFamilies',
    'fontWeights', 'fontSizes', 'lineHeights'
  ];

  if (!validTypes.includes(token.type)) {
    console.warn(`Warning: Unknown token type "${token.type}" at ${path}`);
  }

  // Validate color values
  if (token.type === 'color' && typeof token.value === 'string') {
    if (!token.value.startsWith('{') && !isValidColor(token.value)) {
      throw new Error(`Invalid color value "${token.value}" at ${path}`);
    }
  }
}

function isValidColor(color) {
  // Basic color validation (hex, rgb, hsl, named colors)
  const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\(|rgba\(|hsl\(|hsla\(|[a-zA-Z]+).*$/;
  return colorRegex.test(color);
}

function checkCircularReferences(tokens, visited = new Set(), path = []) {
  for (const [key, value] of Object.entries(tokens)) {
    const currentPath = [...path, key];
    const pathString = currentPath.join('.');

    if (visited.has(pathString)) {
      throw new Error(`Circular reference detected at ${pathString}`);
    }

    if (value && typeof value === 'object') {
      if (value.value && typeof value.value === 'string' && value.value.includes('{')) {
        // Extract references from value
        const references = extractReferences(value.value);
        for (const ref of references) {
          if (ref === pathString) {
            throw new Error(`Self-reference detected at ${pathString}`);
          }
        }
      }

      if (!value.type) {
        // Recurse into nested structure
        visited.add(pathString);
        checkCircularReferences(value, visited, currentPath);
        visited.delete(pathString);
      }
    }
  }
}

function extractReferences(value) {
  const referenceRegex = /\{([^}]+)\}/g;
  const references = [];
  let match;

  while ((match = referenceRegex.exec(value)) !== null) {
    references.push(match[1]);
  }

  return references;
}

// Run validation if called directly
if (require.main === module) {
  validateTokens();
}

module.exports = { validateTokens };
