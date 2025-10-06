/**
 * TypeScript ESM Declarations Format with Reference Preservation
 * 
 * ✅ SIMPLIFIED APPROACH using Style Dictionary utilities:
 * - Uses `usesReferences()` to detect tokens with references
 * - Manually parses cross-layer references (getReferences doesn't support them)
 * - Preserves external references as JavaScript imports + property access
 * - Internal references are handled by existing preprocessor
 * 
 * Example output:
 * ```typescript
 * import globalTokens from './global.js';
 * 
 * export default {
 *   base: {
 *     surface: globalTokens.color.palette.white, // ✅ Preserved reference!
 *   }
 * };
 * ```
 */

import {format} from 'prettier'
import {fileHeader, usesReferences} from 'style-dictionary/utils'
/**
 * Build nested token object from allTokens array
 * @param {Array} allTokens - Array of Style Dictionary tokens
 * @param {string} currentLayer - Current layer being processed  
 * @param {Object} dictionary - Style Dictionary dictionary object
 * @param {Object} options - Format options including outputReferences
 * @returns {Object} Nested token object with references preserved
 */
const buildNestedTokensWithReferences = (allTokens, currentLayer, dictionary, options) => {
  const result = {}
  const externalRefs = new Set()
  
  // Process tokens for current layer
  
  // Filter tokens for current layer
  const layerTokens = allTokens.filter(token => token.path[0] === currentLayer)
  
  layerTokens.forEach(token => {
    // Build nested path
    let current = result
    const path = token.path.slice(1) // Remove layer prefix
    
    // Navigate/create nested structure
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {}
      }
      current = current[path[i]]
    }
    
    // Process the final value
    const finalKey = path[path.length - 1]
    current[finalKey] = processTokenWithReferences(token, currentLayer, dictionary, options, externalRefs)
  })
  
  return { tokens: result, externalRefs }
}

/**
 * Process a single token, preserving external references
 * @param {Object} token - Style Dictionary token
 * @param {string} currentLayer - Current layer name
 * @param {Object} dictionary - Style Dictionary dictionary object
 * @param {Object} options - Format options
 * @param {Set} externalRefs - Set to collect external references
 * @returns {*} Processed token value
 */
const processTokenWithReferences = (token, currentLayer, dictionary, options, externalRefs) => {
  const originalValue = token.original.$value || token.original.value
  
  // Check if token uses references using Style Dictionary utility
  if (!usesReferences(originalValue)) {
    // No references - return the original value directly
    return originalValue
  }
  
  // For tokens with references, we need to parse them manually since getReferences
  // doesn't work with cross-layer references
  if (typeof originalValue === 'string' && originalValue.includes('{')) {
    const referenceMatch = originalValue.match(/^{([^}]+)}$/)
    
    if (referenceMatch) {
      // Entire value is a single reference
      const referencePath = referenceMatch[1]
      const pathParts = referencePath.split('.')
      const referencedLayer = pathParts[0]
      
      if (referencedLayer !== currentLayer) {
        // External reference - convert to JS property access
        externalRefs.add(referencedLayer)
        const propertyPath = pathParts.slice(1).join('.')
        return `${referencedLayer}Tokens.${propertyPath}`
      }
      
      // Internal reference - we need to resolve it manually
      // For now, return the original value and let the user handle internal refs
      return originalValue
    }
    
    // Multiple references or template strings - for now return original value
    // TODO: Handle complex template strings with multiple references
    return originalValue
  }
  
  // No references or non-string value
  return originalValue
}

/**
 * jsonToTypes
 * @description creates a typescript type definition from a json object
 * @param json json object
 * @param indent indentation string
 * @param rootName name of the root type
 * @param isRoot is the root type
 * @returns typescript type definition
 */
const jsonToTypes = (json, indent = '  ', rootName = 'DesignToken', isRoot = true) => {
  // is non-object value
  if (!json || typeof json !== 'object') return json

  let result = isRoot ? `export type ${rootName} = {\n` : '{\n'

  Object.entries(json).forEach(([key, value]) => {
    result += `${indent}'${key}': `
    if (typeof value === 'object' && value !== null) {
      result += jsonToTypes(value, `${indent}  `, rootName, false)
    } else {
      result += `${typeof value};\n`
    }
  })

  result += `${indent.slice(0, -2)}};\n`
  return result
}

export const typescriptEsmDeclarations = async ({
  dictionary,
  file,
  options = {},
  platform = {},
}) => {
  // Determine current layer from file destination
  const currentLayer = detectCurrentLayer(file.destination)
  
  // Build nested tokens with reference preservation using Style Dictionary utilities
  const { tokens: nestedTokens, externalRefs } = buildNestedTokensWithReferences(
    dictionary.allTokens, 
    currentLayer, 
    dictionary, 
    options
  )
  
  // Generate import statements for external references
  const imports = generateImports(externalRefs)
  
  // Convert object to string and process JS expressions
  let objectString = JSON.stringify(nestedTokens, null, 2)
  objectString = convertToJsExpressions(objectString)

  const output = (await fileHeader({file})) + 
`${imports}export default ${objectString};
`
  // return prettified
  return format(output, {parser: 'typescript', printWidth: 500, ...options?.prettier})
}

/**
 * Detect current layer from file destination
 * @param {string} destination - File destination like 'global.ts' or 'semantic.ts'
 * @returns {string} Layer name
 */
const detectCurrentLayer = (destination) => {
  const filename = destination.split('/').pop() // Get filename from path
  const layerName = filename.replace(/\.(ts|js)$/, '') // Remove extension
  return layerName
}

/**
 * Generate import statements for external references
 * @param {Set} externalRefs - Set of referenced layer names
 * @returns {string} Import statements
 */
const generateImports = (externalRefs) => {
  if (externalRefs.size === 0) return ''
  
  const imports = Array.from(externalRefs).map(layer => {
    return `import ${layer}Tokens from './${layer}.js';`
  }).join('\n')
  
  return imports + '\n\n'
}

/**
 * Convert quoted JS expressions to actual JS expressions
 * @param {string} objectString - JSON string with quoted JS expressions
 * @returns {string} String with actual JS expressions
 */
const convertToJsExpressions = (objectString) => {
  // Convert "globalTokens.color.palette.white" to globalTokens.color.palette.white
  // This matches quoted strings that look like JS property access
  return objectString.replace(/"([a-zA-Z][a-zA-Z0-9]*Tokens\.[a-zA-Z0-9_.]+)"/g, '$1')
}