# Design Tokens

Design tokens for the project, managed with [Tokens Studio](https://tokens.studio/) in Figma and built with [Terrazzo CLI](https://terrazzo.app/).

## Setup

This project uses:
- **Tokens Studio** plugin in Figma to manage design tokens
- **Terrazzo CLI** to build tokens into JavaScript and TypeScript

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

This will:
1. **Preprocess** - Convert Tokens Studio format to DTCG-compliant format
2. **Build** - Generate `tokens.js` using Terrazzo CLI

## Output

The build generates `dist/tokens.js` - a JavaScript module with nested token structure and preserved references.

### Features

✅ **Nested structure preserved** - Maintains the hierarchy from your JSON file  
✅ **References preserved** - Token references become JavaScript references  
✅ **Minimal configuration** - Simple, 4-line config with Terrazzo CLI

### Usage Example

```javascript
import tokens from './dist/tokens.js';

// Access tokens with nested structure
const primaryColor = tokens.semantic.color.base.primary;
// => references tokens.global.color.palette.simba["100"]

const buttonHoverColor = tokens.semantic.color.surface.primary.hover;
// => references tokens.global.color.palette.simba["110"]
```

## Workflow

1. Update tokens in Figma using Tokens Studio plugin
2. Sync tokens to `tokens.json` in this repository
3. Run `npm run build` to generate output files
4. Import and use tokens in your application

## Configuration

### Build Scripts
- **`preprocess-tokens.js`** - Converts Tokens Studio format to DTCG standard
- **`terrazzo.config.js`** - Minimal 4-line Terrazzo configuration

### What the Preprocessor Does
- Converts Tokens Studio references to DTCG format (e.g., `{fontFamilies.inter}` → `{global.fontFamilies.inter}`)
- Maps Tokens Studio types to DTCG types (e.g., `fontFamilies` → `fontFamily`)
- Converts font weights to lowercase (e.g., `Regular` → `regular`)
- Adds units to dimension values (e.g., `16` → `16px`)
- Removes non-standard typography fields not supported by DTCG spec


