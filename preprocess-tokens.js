/**
 * Simple preprocessor to convert Tokens Studio references to DTCG-compliant format
 * - Converts {fontFamilies.inter} → {global.fontFamilies.inter}
 * - Converts Tokens Studio types to DTCG types (fontFamilies → fontFamily)
 */

import { readFileSync, writeFileSync } from 'fs';

// Map Tokens Studio types to DTCG types
const typeMapping = {
  'fontFamilies': 'fontFamily',
  'fontWeights': 'fontWeight',
  'fontSizes': 'dimension',
  'lineHeights': 'dimension',
  'letterSpacing': 'dimension',
  'paragraphSpacing': 'dimension',
  'textCase': 'string',
  'textDecoration': 'string',
};

// Convert font weight values to DTCG spec (lowercase)
const fontWeightMapping = {
  'Regular': 'regular',
  'Bold': 'bold',
  'Medium': 'medium',
  'Light': 'light',
  'Thin': 'thin',
  'Black': 'black',
  'Semi-Bold': 'semi-bold',
  'Extra-Bold': 'extra-bold',
};

// Read the original tokens
const tokensPath = './tokens.json';
const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));

// Build a registry of all token paths
const tokenRegistry = new Map();

function buildRegistry(obj, currentPath, setName) {
  if (!obj || typeof obj !== 'object') return;
  
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    
    if (value && typeof value === 'object') {
      const newPath = [...currentPath, key];
      if (value.$value !== undefined) {
        // This is a token
        const pathKey = newPath.join('.');
        tokenRegistry.set(pathKey, setName);
      } else {
        // It's a group
        buildRegistry(value, newPath, setName);
      }
    }
  }
}

// Build registry for all token sets
for (const [setName, setTokens] of Object.entries(tokens)) {
  if (!setName.startsWith('$')) {
    buildRegistry(setTokens, [], setName);
  }
}

// Fix references in a string
function fixReferences(value) {
  if (typeof value !== 'string') return value;
  
  return value.replace(/\{([^}]+)\}/g, (match, ref) => {
    // Check if already has a set prefix
    const firstPart = ref.split('.')[0];
    if (tokens[firstPart] !== undefined && !firstPart.startsWith('$')) {
      return match; // Already qualified
    }
    
    // Look up which set this token belongs to
    const targetSet = tokenRegistry.get(ref);
    
    if (targetSet) {
      return `{${targetSet}.${ref}}`;
    }
    
    // Fallback to global
    return `{global.${ref}}`;
  });
}

// Fix references in objects (like typography values)
function fixObjectReferences(obj, tokenType) {
  if (!obj || typeof obj !== 'object') return obj;
  
  // Non-standard fields in Tokens Studio that aren't part of DTCG typography spec
  const nonStandardTypographyFields = ['paragraphSpacing', 'paragraphIndent', 'textCase'];
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip non-standard typography fields
    if (tokenType === 'typography' && nonStandardTypographyFields.includes(key)) {
      continue;
    }
    
    if (typeof value === 'string') {
      result[key] = fixReferences(value);
    } else if (typeof value === 'object') {
      result[key] = fixObjectReferences(value, tokenType);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Process all tokens
function processTokens(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$')) {
      // Convert Tokens Studio types to DTCG types
      if (key === '$type' && typeof value === 'string' && typeMapping[value]) {
        result[key] = typeMapping[value];
      } else {
        result[key] = value;
      }
      continue;
    }
    
    if (value && typeof value === 'object') {
      if (value.$value !== undefined) {
        // This is a token
        result[key] = { ...value };
        
        // Convert type if needed
        if (value.$type && typeMapping[value.$type]) {
          result[key].$type = typeMapping[value.$type];
        }
        
        // Fix references in value
        if (typeof value.$value === 'string') {
          let processedValue = fixReferences(value.$value);
          
          // Convert font weight values to lowercase
          if (value.$type === 'fontWeights' && fontWeightMapping[processedValue]) {
            processedValue = fontWeightMapping[processedValue];
          }
          
          // Add units to dimension values that don't have them
          const convertedType = typeMapping[value.$type] || value.$type;
          
          if (convertedType === 'dimension') {
            // If it's a number without units, add 'px'
            if (/^-?\d+(\.\d+)?$/.test(processedValue) && !processedValue.includes('{')) {
              processedValue = processedValue + 'px';
            } else if (processedValue === '0') {
              processedValue = '0px';
            } else if (processedValue.endsWith('%')) {
              // Convert percentage values (like letterSpacing "0%") to px
              processedValue = '0px';
            }
          }
          
          result[key].$value = processedValue;
        } else if (typeof value.$value === 'object') {
          result[key].$value = fixObjectReferences(value.$value, value.$type);
        } else if (typeof value.$value === 'number') {
          // Handle numeric values - add px for dimensions
          const convertedType = typeMapping[value.$type] || value.$type;
          
          if (convertedType === 'dimension') {
            result[key].$value = value.$value + 'px';
          } else {
            result[key].$value = value.$value;
          }
        }
      } else {
        // It's a group
        result[key] = processTokens(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Process all sets
const processed = {};
for (const [setName, setTokens] of Object.entries(tokens)) {
  if (setName.startsWith('$')) {
    processed[setName] = setTokens;
  } else {
    processed[setName] = processTokens(setTokens);
  }
}

// Write processed tokens
writeFileSync('.terrazzo/tokens.json', JSON.stringify(processed, null, 2));
console.log('✓ Preprocessed tokens for Terrazzo');

