/**
 * Design Token Build System
 * 
 * ✅ CLEAN MODULAR APPROACH:
 * - Uses Style Dictionary preprocessors for clean separation of concerns
 * - Preserves global/semantic structure with excludeParentKeys: false
 * - Custom 'fix-references' preprocessor maintains strict hierarchy
 * - Easy to extend: add new layers to fix-references-preprocessor.js
 */

import { register } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import { typescriptEsmDeclarations } from './format/typescript-esm-declarations.js';
import { fixReferencesPreprocessor } from './preprocessor/fix-references-preprocessor.js';

// Register the tokens-studio transforms WITHOUT excludeParentKeys 
// so we preserve the global/semantic structure
register(StyleDictionary, {
  excludeParentKeys: false, // Keep parent keys to preserve global/semantic distinction
});

// Register custom preprocessor for fixing references
StyleDictionary.registerPreprocessor(fixReferencesPreprocessor);

// Register TypeScript formats
StyleDictionary.registerFormat({
  name: 'typescript/default-export',
  format: typescriptEsmDeclarations,
});

// Create and configure Style Dictionary
const sd = new StyleDictionary({
  source: ['tokens.json'],
  preprocessors: ['fix-references', 'tokens-studio'], // Fix references BEFORE tokens-studio processing
  platforms: {
    ts: {
      transformGroup: 'tokens-studio', // Use tokens-studio transform group
      buildPath: 'build/',
      files: [
        {
          destination: 'global.ts',
          format: 'typescript/default-export',
          filter: (token) => {
            // Include only tokens from the "global" section in original JSON
            return token.path[0] === 'global';
          },
        },
        {
          destination: 'semantic.ts',  
          format: 'typescript/default-export',
          filter: (token) => {
            // Include only tokens from the "semantic" section in original JSON
            return token.path[0] === 'semantic';
          },
        },
        
        // 🚀 FUTURE: Component layer example
        // {
        //   destination: 'component.ts',
        //   format: 'typescript/default-export', 
        //   filter: (token) => {
        //     return token.path[0] === 'component';
        //   },
        // },
      ],
    },
  },
});

// Clean and build
await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();

console.log('✅ Tokens built successfully!');
