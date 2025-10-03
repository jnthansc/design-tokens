#!/usr/bin/env node

const StyleDictionary = require('style-dictionary').default;
const { usesReferences, getReferences } = require('style-dictionary/utils');
const fs = require('fs');

// Read the original tokens
const originalTokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));

// Create separate token files for global and semantic
const globalTokens = originalTokens.global || {};
const semanticTokens = originalTokens.semantic || {};

// Write temporary token files
fs.writeFileSync('global-tokens.json', JSON.stringify(globalTokens, null, 2));
fs.writeFileSync('semantic-tokens.json', JSON.stringify(semanticTokens, null, 2));

// Register custom format for ES6 with references (following Style Dictionary docs)
StyleDictionary.registerFormat({
  name: 'es6WithReferences',
  format: function ({ dictionary, options }) {
    const { usesDtcg, outputReferences } = options;
    
    return dictionary.allTokens
      .map((token) => {
        let value = JSON.stringify(token.value);
        const originalValue = token.original.value;
        
        // Use Style Dictionary's built-in reference utilities
        const shouldOutputRef =
          usesReferences(originalValue) &&
          (typeof outputReferences === 'function'
            ? outputReferences(token, { dictionary, usesDtcg })
            : outputReferences);

        let isEntirelyRef = false;
        
        if (shouldOutputRef) {
          // Note: make sure to use `originalValue` because
          // `token.value` is already resolved at this point.
          const refs = getReferences(originalValue, dictionary.tokens);
          isEntirelyRef = refs.length === 1 && refs[0].value === value;
          
          refs.forEach((ref) => {
            // wrap in template literal ${} braces if the value is more than just entirely a reference
            value = value.replace(ref.value, isEntirelyRef ? ref.name : `\${${ref.name}}`);
          });
        }
        
        // if the value is not entirely a reference, we have to wrap in template literals
        return `export const ${token.name} = ${
          shouldOutputRef && !isEntirelyRef ? `\`${value}\`` : value
        };`;
      })
      .join('\n');
  },
});

// Register custom format for semantic tokens that references global
StyleDictionary.registerFormat({
  name: 'es6WithGlobalReferences',
  format: function ({ dictionary, options }) {
    const { usesDtcg, outputReferences } = options;
    
    // Add import statement for global tokens
    let output = "import global from './global.js';\n\n";
    
    output += dictionary.allTokens
      .map((token) => {
        let value = JSON.stringify(token.value);
        const originalValue = token.original.value;
        
        // Check if this token has references in its original value
        const hasReferences = typeof originalValue === 'string' && originalValue.includes('{') && originalValue.includes('}');
        
        if (hasReferences && outputReferences) {
          // Extract reference patterns from the original value
          const referencePattern = /\{([^}]+)\}/g;
          let match;
          const references = [];
          
          while ((match = referencePattern.exec(originalValue)) !== null) {
            references.push(match[1]);
          }
          
          if (references.length > 0) {
            // Check if this is entirely a reference
            const isEntirelyRef = references.length === 1 && originalValue === `{${references[0]}}`;
            
            if (isEntirelyRef) {
              // Convert the reference path to camelCase for global reference
              const refPath = references[0];
              const camelCaseRef = refPath
                .split('.')
                .join(' ')
                .replace(/[\s\-_]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
                .replace(/^(.)/, (_, char) => char.toLowerCase());
              
              value = `global.${camelCaseRef}`;
            } else {
              // Template literal with references
              let templateValue = originalValue;
              references.forEach((ref) => {
                const camelCaseRef = ref
                  .split('.')
                  .join(' ')
                  .replace(/[\s\-_]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
                  .replace(/^(.)/, (_, char) => char.toLowerCase());
                templateValue = templateValue.replace(`{${ref}}`, `\${global.${camelCaseRef}}`);
              });
              value = `\`${templateValue}\``;
            }
          }
        }
        
        return `export const ${token.name} = ${value};`;
      })
      .join('\n');
      
    return output;
  },
});

// Register transform for camelCase names
StyleDictionary.registerTransform({
  name: 'name/camel',
  type: 'name',
  transform: function (token) {
    return token.path
      .join(' ')
      .replace(/[\s\-_]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^(.)/, (_, char) => char.toLowerCase());
  },
});

// Register transform group for web
StyleDictionary.registerTransformGroup({
  name: 'web/js',
  transforms: ['attribute/cti', 'name/camel', 'size/px', 'color/hex'],
});

// Configuration for global tokens
const globalConfig = {
  source: ['global-tokens.json'],
  platforms: {
    web: {
      transformGroup: 'web/js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'global.js',
          format: 'es6WithReferences',
          options: {
            outputReferences: false, // Global tokens should resolve to final values
            usesDtcg: true,
          },
        },
      ],
    },
  },
};

// Configuration for semantic tokens
const semanticConfig = {
  source: ['semantic-tokens.json', 'global-tokens.json'], // Include global for reference resolution
  platforms: {
    web: {
      transformGroup: 'web/js',
      buildPath: 'dist/',
      files: [
        {
          destination: 'semantic.js',
          format: 'es6WithGlobalReferences',
          filter: (token) => {
            // Only include semantic tokens, not global ones
            return token.filePath.includes('semantic-tokens.json');
          },
          options: {
            outputReferences: true,
            usesDtcg: true,
          },
        },
      ],
    },
  },
};

async function buildTokens() {
  try {
    console.log('Building global tokens...');
    
    // Build global tokens
    const globalSD = new StyleDictionary(globalConfig);
    await globalSD.buildAllPlatforms();
    
    console.log('Building semantic tokens...');
    
    // Build semantic tokens
    const semanticSD = new StyleDictionary(semanticConfig);
    await semanticSD.buildAllPlatforms();
    
    // Create index file
    const indexContent = `export { default as global } from './global.js';
export { default as semantic } from './semantic.js';

// Re-export all global tokens
export * from './global.js';

// Re-export semantic tokens
import semantic from './semantic.js';
export { semantic };

// Default export combines both layers
import global from './global.js';
export default {
  global,
  semantic
};
`;

    fs.writeFileSync('dist/index.js', indexContent);
    
    // Generate TypeScript declarations for IDE support
    console.log('Generating TypeScript declarations...');
    
    // Read the generated files to create .d.ts files
    const globalContent = fs.readFileSync('dist/global.js', 'utf8');
    const semanticContent = fs.readFileSync('dist/semantic.js', 'utf8');
    
    // Extract exports from global.js
    const globalExports = globalContent.match(/export const (\w+) = (.+);/g) || [];
    const globalDts = globalExports.map(line => {
      const match = line.match(/export const (\w+) = (.+);/);
      if (match) {
        const [, name, value] = match;
        return `export const ${name}: ${value};`;
      }
      return line;
    }).join('\n');
    
    fs.writeFileSync('dist/global.d.ts', globalDts);
    
    // Extract exports from semantic.js and create proper references
    const semanticExports = semanticContent.match(/export const (\w+) = global\.(\w+);/g) || [];
    const semanticDts = `import { ${globalExports.map(line => {
      const match = line.match(/export const (\w+) = (.+);/);
      return match ? match[1] : '';
    }).filter(Boolean).join(', ')} } from './global.js';

${semanticExports.map(line => {
      const match = line.match(/export const (\w+) = global\.(\w+);/);
      if (match) {
        const [, semanticName, globalName] = match;
        return `export const ${semanticName}: typeof ${globalName};`;
      }
      return line;
    }).join('\n')}`;
    
    fs.writeFileSync('dist/semantic.d.ts', semanticDts);
    
    // Create index.d.ts
    const indexDts = `export * from './global.js';
export * from './semantic.js';
export { default as global } from './global.js';
export { default as semantic } from './semantic.js';

import global from './global.js';
import semantic from './semantic.js';

declare const _default: {
  global: typeof global;
  semantic: typeof semantic;
};

export default _default;
`;
    
    fs.writeFileSync('dist/index.d.ts', indexDts);
    
    // Clean up temporary files
    fs.unlinkSync('global-tokens.json');
    fs.unlinkSync('semantic-tokens.json');
    
    console.log('✅ Built global.js, semantic.js, and index.js with proper references!');
  } catch (error) {
    // Clean up temporary files even if there's an error
    try {
      fs.unlinkSync('global-tokens.json');
      fs.unlinkSync('semantic-tokens.json');
    } catch (e) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

buildTokens().catch(console.error);