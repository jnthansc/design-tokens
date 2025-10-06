import {format} from 'prettier'
import {fileHeader} from 'style-dictionary/utils'
/**
 * jsonToNestedValue
 * @description creates a nested json three where every final value is the `.value` prop
 * @param token StyleDictionary.DesignToken
 * @returns nested json three
 */
const jsonToNestedValue = (token) => {
  // is non-object value
  if (!token || typeof token !== 'object') return token
  // is design token
  if ('value' in token) return token.value
  if ('$value' in token) return token.$value
  // is obj
  const nextObj = {}
  for (const [prop, value] of Object.entries(token)) {
    // @ts-expect-error: can't predict type
    nextObj[prop] = jsonToNestedValue(value)
  }
  return nextObj
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
  options,
  platform = {},
}) => {
  const {prefix} = platform
  const tokens = prefix ? {[prefix]: dictionary.tokens} : dictionary.tokens

  // convert to nested values object
  const nestedValues = jsonToNestedValue(tokens)
  
  // Remove redundant top-level layer key (global/semantic/etc)
  // If there's only one top-level key, export its contents directly
  const topLevelKeys = Object.keys(nestedValues)
  const finalValues = topLevelKeys.length === 1 ? nestedValues[topLevelKeys[0]] : nestedValues

  const output = (await fileHeader({file})) + 
`export default ${JSON.stringify(finalValues, null, 2)};
`
  // return prettified
  return format(output, {parser: 'typescript', printWidth: 500, ...options?.prettier})
}