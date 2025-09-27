#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Generates TypeScript type definitions for design tokens
 */
function generateTypes() {
  const distPath = path.join(__dirname, '..', 'dist');
  const tokensPath = path.join(distPath, 'tokens.d.ts');
  
  // Read the generated tokens.d.ts file
  if (!fs.existsSync(tokensPath)) {
    console.error('tokens.d.ts not found. Run build:tokens first.');
    process.exit(1);
  }

  const tokensTypes = fs.readFileSync(tokensPath, 'utf8');

  // Generate additional type definitions
  const additionalTypes = `
// Typography token interface
export interface TypographyToken {
  fontFamily: string;
  fontWeight: string;
  lineHeight: string;
  fontSize: string;
  letterSpacing: string;
  paragraphSpacing: string;
  paragraphIndent: string;
  textCase: string;
  textDecoration: string;
}

// Shadow token interface
export interface ShadowToken {
  color: string;
  type: 'dropShadow' | 'innerShadow';
  x: string;
  y: string;
  blur: string;
  spread: string;
}

// Token categories
export interface DesignTokens {
  // Colors
  colorPaletteWhite: string;
  colorPaletteGrey10: string;
  colorPaletteGrey20: string;
  colorPaletteGrey30: string;
  colorPaletteGrey40: string;
  colorPaletteGrey50: string;
  colorPaletteGrey60: string;
  colorPaletteGrey70: string;
  colorPaletteGrey80: string;
  colorPaletteGrey100: string;
  colorPaletteGrey110: string;
  colorPaletteGrey120: string;
  colorPaletteGrey1000: string;
  
  // Base colors
  colorBaseSurface: string;
  colorBaseOnSurface: string;
  colorBasePrimary: string;
  colorBaseInfo: string;
  colorBaseSuccess: string;
  colorBaseWarning: string;
  colorBaseError: string;
  
  // Typography
  fontFamiliesInter: string;
  fontSizeXSmall: string;
  fontSizeSmall: string;
  fontSizeRegular: string;
  fontSizeLarge: string;
  fontSizeXLarge: string;
  fontSize2xLarge: string;
  fontSize3xLarge: string;
  
  // Add more specific token types as needed
}

// Re-export all tokens
export * from './tokens';
`;

  // Combine the generated types with additional types
  const fullTypes = tokensTypes + additionalTypes;

  // Write the complete type definitions
  const indexTypesPath = path.join(distPath, 'index.d.ts');
  fs.writeFileSync(indexTypesPath, fullTypes);

  console.log('✅ TypeScript definitions generated');
}

// Run if called directly
if (require.main === module) {
  generateTypes();
}

module.exports = { generateTypes };
