# Design Tokens

Design tokens managed with [Figma Tokens Studio](https://tokens.studio/) and [Style Dictionary v5](https://styledictionary.com/).

## Setup

Install dependencies:

```bash
npm install
```

## Usage

Build the tokens to JavaScript:

```bash
npm run build
```

This will generate `dist/tokens.js` with the following features:

- ✅ **Nested structure preserved** - The JSON structure is maintained in the output
- ✅ **Proper JavaScript objects** - No unnecessary string quotes, uses valid property names
- ✅ **Actual references** - Semantic tokens directly reference global tokens (not strings)
- ✅ **ES6 module format** - Ready to import in modern JavaScript projects

## Import Tokens

```javascript
import tokens from './dist/tokens.js';

// Access nested tokens - get actual values
const white = tokens.global.color.palette.white; // "#ffffff"
const primaryColor = tokens.global.color.palette.simba["100"]; // "#b30831"

// Semantic tokens reference global tokens directly
const surfaceColor = tokens.semantic.color.base.surface; // "#ffffff"
// This is the SAME reference as:
tokens.semantic.color.base.surface === tokens.global.color.palette.white; // true

// If you change global tokens, semantic tokens automatically update!
```

### Example Output Structure

```javascript
const global = {
  color: {
    palette: {
      white: "#ffffff",
      simba: {
        "100": "#b30831"
      }
    }
  }
};

const semantic = {
  color: {
    base: {
      surface: global.color.palette.white,  // Actual JS reference!
      primary: global.color.palette.simba["100"]
    }
  }
};

export default { global, semantic };
```

## How It Works

### File Structure

```
build-tokens.js              # Main build script (~50 lines)
lib/
  ├── preprocessor.js        # Tokens Studio reference resolver (~170 lines)
  └── formatter.js           # JavaScript module generator (~210 lines)
tokens.json                  # Source tokens from Figma
dist/
  └── tokens.js              # Generated JavaScript output
```

### Build Process

1. **tokens.json** - Source design tokens exported from Figma Tokens Studio
2. **preprocessor.js** - Resolves Tokens Studio references (e.g., `{color.primary}` → `{global.color.primary}`)
3. **formatter.js** - Generates clean JavaScript with actual references between token sets
4. **dist/tokens.js** - Final output: JavaScript module with nested structure preserved

### Future-Proof Multi-Level Support

The build system supports **unlimited token hierarchy levels**:

```
global → semantic → component → page → ...
```

**Example:**
```json
{
  "global": { "primary": { "$value": "#b30831" } },
  "semantic": { "button": { "$value": "{primary}" } },
  "component": { "cta": { "$value": "{button}" } }
}
```

The preprocessor automatically resolves:
- `{primary}` → `{global.primary}`
- `{button}` → `{semantic.button}`
- References work at any depth with correct set resolution

## Sync with Figma

The `tokens.json` file is synced with Figma using the Tokens Studio plugin. After making changes in Figma:

1. Sync tokens.json from Figma Tokens Studio
2. Run `npm run build` to regenerate the JavaScript output
3. Commit both `tokens.json` and `dist/tokens.js`