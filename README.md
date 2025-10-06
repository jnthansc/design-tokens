# Design Tokens System

A comprehensive design token build system using **Style Dictionary** and **@tokens-studio/sd-transforms** with **reference preservation** between token layers and **full TypeScript support**.

## 🎯 **Features**

- ✅ **Layered Token Architecture** - Global → Semantic → Component hierarchy
- ✅ **Reference Preservation** - Maintain relationships as JavaScript imports
- ✅ **TypeScript Support** - Full type safety with IntelliSense
- ✅ **Modular Design** - Clean separation of concerns
- ✅ **Easy Extension** - Simple to add new token layers

## 📁 **Project Structure**

```
design-tokens/
├── tokens.json                    # Source design tokens (from Tokens Studio)
├── build-tokens.js                # Style Dictionary configuration
├── preprocessor/                  
│   └── fix-references-preprocessor.js  # Fixes internal references
├── format/
│   └── typescript-esm-declarations.js  # Custom TypeScript format with reference preservation
├── build/                         # Generated TypeScript files
│   ├── global.ts                  # Global tokens (foundation)
│   └── semantic.ts                # Semantic tokens (references global)
└── package.json
```

## 🏗️ **Token Architecture**

### **Layer Hierarchy**
```
Global Tokens (Foundation)
    ↓ (references)
Semantic Tokens (Contextual)
    ↓ (references) 
Component Tokens (UI-specific)
```

### **Strict Reference Rules**
- **Global tokens**: Self-contained foundation values
- **Semantic tokens**: Only reference global tokens
- **Component tokens**: Only reference semantic tokens

## 🚀 **Quick Start**

### **Installation**
```bash
npm install
```

### **Build Tokens**
```bash
npm run build
```

This generates TypeScript files in the `build/` directory with preserved references and full type definitions.

## 💻 **Usage Examples**

### **Importing Tokens**
```typescript
import globalTokens, { type GlobalTokens } from './build/global.js';
import semanticTokens, { type SemanticTokens } from './build/semantic.js';
```

### **Type-Safe Access**
```typescript
// ✅ Full IntelliSense support
const primaryColor = globalTokens.color.palette.simba.simba100;
const surfaceColor = semanticTokens.color.base.surface;

// ✅ Type checking prevents errors
// const invalid = globalTokens.color.nonExistent; // ❌ TypeScript Error
```

### **Using in React Components**
```typescript
import semanticTokens from './tokens/build/semantic.js';

function Button() {
  return (
    <button 
      style={{
        backgroundColor: semanticTokens.color.surface.primary.default,
        color: semanticTokens.color.content.primary.default,
        borderColor: semanticTokens.color.border.primary.default,
      }}
    >
      Click me
    </button>
  );
}
```

### **Theme Configuration**
```typescript
interface AppTheme {
  global: GlobalTokens;
  semantic: SemanticTokens;
}

const theme: AppTheme = {
  global: globalTokens,
  semantic: semanticTokens,
};
```

## 🎨 **Generated Output**

### **Global Tokens (`build/global.ts`)**
```typescript
export type GlobalTokensType = {
  color: {
    palette: {
      white: string;
      simba: {
        simba100: string;
        // ... etc
      };
    };
  };
};

const globalTokens: GlobalTokensType = {
  color: {
    palette: {
      white: "#ffffff",
      simba: {
        simba100: "#b30831"
      }
    }
  }
};

export type GlobalTokens = GlobalTokensType;
export default globalTokens;
```

### **Semantic Tokens (`build/semantic.ts`)**
```typescript
import globalTokens, { type GlobalTokens } from "./global.js";

export type SemanticTokensType = {
  color: {
    base: {
      surface: string;
      primary: string;
    };
  };
};

const semanticTokens: SemanticTokensType = {
  color: {
    base: {
      surface: globalTokens.color.palette.white,      // ✅ Preserved reference!
      primary: globalTokens.color.palette.simba.simba100, // ✅ Preserved reference!
    }
  }
};

export type SemanticTokens = SemanticTokensType;
export default semanticTokens;
```

## ⚙️ **How It Works**

### **1. Reference Preprocessing**
The `fix-references-preprocessor.js` ensures internal references within layers are properly prefixed:
- `{color.palette.white}` → `{global.color.palette.white}`

### **2. Cross-Layer Reference Preservation**
The custom TypeScript format detects cross-layer references and converts them:
- `{global.color.palette.white}` → `globalTokens.color.palette.white`

### **3. Type Generation**
TypeScript interfaces are generated from the token structure providing:
- Full IntelliSense support
- Compile-time type checking
- Excellent developer experience

### **4. Automatic Imports**
External references automatically generate import statements:
```typescript
import globalTokens, { type GlobalTokens } from './global.js';
```

## 🔧 **Adding Component Layer**

To extend the system with component tokens:

### **1. Add to `tokens.json`**
```json
{
  "component": {
    "button": {
      "background": {
        "$value": "{semantic.color.surface.primary.default}"
      },
      "text": {
        "$value": "{semantic.color.content.primary.default}"
      }
    }
  }
}
```

### **2. Update Preprocessor**
In `preprocessor/fix-references-preprocessor.js`:
```javascript
if (dictionary.component) {
  dictionary.component = fixReferences(dictionary.component, 'semantic.');
}
```

### **3. Add Build Configuration**
In `build-tokens.js`:
```javascript
{
  destination: 'component.ts',
  format: 'typescript/default-export', 
  filter: (token) => token.path[0] === 'component',
}
```

### **4. Result: `build/component.ts`**
```typescript
import semanticTokens, { type SemanticTokens } from './semantic.js';

const componentTokens = {
  button: {
    background: semanticTokens.color.surface.primary.default, // ✅ Reference preserved!
    text: semanticTokens.color.content.primary.default,
  }
};

export default componentTokens;
```

## 🛠️ **Development**

### **Project Setup**
1. Export design tokens from Figma using Tokens Studio plugin
2. Save as `tokens.json` in project root
3. Run `npm run build` to generate TypeScript files

### **Token Guidelines**
- **Global**: Foundation values (colors, fonts, spacing, etc.)
- **Semantic**: Contextual meanings (primary, error, success, etc.) 
- **Component**: UI-specific tokens (button colors, input styles, etc.)

### **File Structure Guidelines**
- Keep preprocessors in `preprocessor/` directory
- Keep custom formats in `format/` directory  
- Generated files go in `build/` directory
- Source tokens in `tokens.json`

## 📚 **Key Technologies**

- **[Style Dictionary](https://amzn.github.io/style-dictionary/)** - Token build system
- **[@tokens-studio/sd-transforms](https://github.com/tokens-studio/sd-transforms)** - Tokens Studio integration
- **TypeScript** - Type safety and developer experience
- **Prettier** - Code formatting

## 🎯 **Benefits**

### **For Developers**
- 🔍 **IntelliSense** - Autocomplete for all token paths
- 🛡️ **Type Safety** - Prevent runtime errors with compile-time checks
- 🔗 **Traceability** - See exactly which tokens reference others
- 📖 **Self-Documenting** - Types serve as living documentation

### **For Design Systems**
- 🎨 **Single Source of Truth** - All tokens from Figma Tokens Studio
- 🏗️ **Scalable Architecture** - Easy to extend with new layers
- 🔄 **Maintainable References** - Change a global token, all references update
- 🚀 **Build Automation** - Consistent output every time

## 📖 **Advanced Usage**

### **CSS-in-JS Integration**
```typescript
const theme = {
  colors: {
    primary: globalTokens.color.palette.simba.simba100,
    surface: semanticTokens.color.base.surface,
  }
};
```

### **Styled Components**
```typescript
const StyledButton = styled.button`
  background-color: ${semanticTokens.color.surface.primary.default};
  color: ${semanticTokens.color.content.primary.default};
`;
```

### **CSS Custom Properties Generation**
The system can be extended to also generate CSS variables alongside TypeScript files for maximum flexibility.

---

## 🤝 **Contributing**

1. Make changes to `tokens.json` (exported from Tokens Studio)
2. Run `npm run build` to regenerate TypeScript files
3. Test the generated tokens in your application
4. Commit both source and generated files

## 📄 **License**

MIT License - feel free to use in your projects!

---

**Built with ❤️ using Style Dictionary and modern TypeScript practices**