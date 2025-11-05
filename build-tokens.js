/**
 * Design Tokens Build Script
 * 
 * Transforms Tokens Studio design tokens into JavaScript modules with:
 * - Nested structure preservation
 * - Actual JavaScript references (not strings)
 * - Multi-level token hierarchy support
 * 
 * Architecture:
 * - Preprocessor: Resolves Tokens Studio reference format
 * - Formatter: Generates clean JavaScript with proper syntax
 */

import StyleDictionary from 'style-dictionary';
import { tokensStudioPreprocessor } from './lib/preprocessor.js';
import { jsNestedWithReferencesFormatter } from './lib/formatter.js';

// Register custom preprocessor
StyleDictionary.registerPreprocessor({
  name: 'tokens-studio-resolver',
  preprocessor: tokensStudioPreprocessor,
});

// Register custom formatter
StyleDictionary.registerFormat({
  name: 'javascript/nested-with-references',
  format: jsNestedWithReferencesFormatter,
});

// Build configuration
const sd = new StyleDictionary({
  source: ['tokens.json'],
  preprocessors: ['tokens-studio-resolver'],
  platforms: {
    js: {
      transforms: ['name/kebab'],
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/nested-with-references',
          options: {
            outputReferences: true,
          },
        },
      ],
    },
  },
});

// Build all platforms
await sd.buildAllPlatforms();
