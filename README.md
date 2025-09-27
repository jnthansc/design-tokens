# Design Tokens

> The single source of truth for design tokens across all company applications.

## Overview

This repository contains design tokens that define the visual foundation of our design system. Tokens are automatically synchronized from Figma using the Tokens Studio plugin and transformed into consumable formats for various platforms.

## 🚀 Quick Start

### Installation

```bash
npm install @company/design-tokens
```

### Usage

```javascript
// ES6 imports
import { colorBasePrimary, fontSizeRegular } from '@company/design-tokens';

// Use in your components
const Button = styled.button`
  background-color: ${colorBasePrimary};
  font-size: ${fontSizeRegular};
`;
```

### CSS Variables

```css
@import '@company/design-tokens/dist/tokens.css';

.my-component {
  background-color: var(--color-base-primary);
  font-size: var(--font-size-regular);
}
```

## 📁 Repository Structure

```
design-tokens/
├── tokens.json              # Source tokens from Figma
├── style-dictionary.config.js # Build configuration
├── dist/                    # Generated token files
│   ├── tokens.js           # ES6 exports
│   ├── tokens.d.ts         # TypeScript definitions
│   ├── tokens.css          # CSS custom properties
│   └── tokens.json         # Nested JSON format
├── scripts/                # Build and validation scripts
└── __tests__/              # Test files
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/your-company/design-tokens.git
cd design-tokens

# Install dependencies
npm install

# Build tokens
npm run build
```

### Available Scripts

- `npm run build` - Build all token formats
- `npm run build:tokens` - Build tokens using Style Dictionary
- `npm run build:types` - Generate TypeScript definitions
- `npm run validate` - Validate token structure
- `npm run test` - Run tests
- `npm run lint` - Lint code

## 🎨 Token Categories

### Colors

- **Palette**: Base color values (white, grey, simba, blue, green, orange, red)
- **Base**: Semantic color assignments (primary, success, warning, error)
- **Surface**: Background colors with interaction states
- **Content**: Text and icon colors
- **Border**: Border colors for various contexts

### Typography

- **Font Families**: Available font stacks
- **Font Sizes**: Scale from x-small to 3x-large
- **Font Weights**: Regular and bold variants
- **Line Heights**: Corresponding line heights for each size
- **Text Styles**: Complete typography definitions (heading-1 through heading-6, body styles, labels)

### Shadows

- **Drop Shadows**: External shadows in various sizes (xs, s, m, l, xl)
- **Inner Shadows**: Internal shadows for inset effects
- **Inversed**: Upward-facing shadows

### Spacing & Layout

- **Letter Spacing**: Character spacing values
- **Paragraph Spacing**: Spacing between paragraphs

## 🔄 Workflow

### Figma to Repository Sync

1. **Design Updates**: Designers update tokens in Figma using Tokens Studio
2. **Sync**: Tokens Studio pushes changes to `tokens.json`
3. **Validation**: Automated validation ensures token integrity
4. **Build**: Style Dictionary transforms tokens into consumable formats
5. **Release**: Automated versioning and publishing to npm registry

### Consuming Applications

1. **Install**: Applications install the latest token package
2. **Import**: Use ES6 imports or CSS variables
3. **Update**: Regular updates to get latest design changes

## 🔒 Security

This repository follows strict security practices:

- Branch protection with required reviews
- Automated security scanning
- Dependency auditing
- Secrets management via GitHub Secrets
- Complete audit trail of all changes

See [SECURITY.md](./SECURITY.md) for detailed security guidelines.

## 📦 Output Formats

### JavaScript/TypeScript

```javascript
// Individual token exports
export const colorBasePrimary = '#b30831';
export const fontSizeRegular = '16px';

// With references preserved
export const colorBaseSurface = colorPaletteWhite;
```

### CSS Custom Properties

```css
:root {
  --color-base-primary: #b30831;
  --font-size-regular: 16px;
  --color-base-surface: var(--color-palette-white);
}
```

### JSON

```json
{
  "color": {
    "base": {
      "primary": {
        "value": "#b30831",
        "type": "color"
      }
    }
  }
}
```

## 🤝 Contributing

1. **Create Branch**: Create a feature branch from `main`
2. **Make Changes**: Update tokens in Figma or modify build scripts
3. **Validate**: Run `npm run validate` and `npm test`
4. **Create PR**: Submit pull request with clear description
5. **Review**: Wait for required reviews and status checks
6. **Merge**: Merge triggers automated build and release

## 📋 Token Naming Convention

Tokens follow a hierarchical naming structure:

```
{category}.{type}.{item}.{subitem}.{state}
```

Examples:
- `color.base.primary` - Base primary color
- `color.surface.neutral.default.hover` - Neutral surface hover state
- `textstyle.heading.heading-1` - Heading 1 typography style

## 🐛 Troubleshooting

### Build Failures

1. Check token validation: `npm run validate`
2. Review Style Dictionary config
3. Ensure all references are valid

### Type Errors

1. Rebuild types: `npm run build:types`
2. Check TypeScript definitions in `dist/`
3. Verify token names match exports

### Sync Issues

1. Verify Figma token structure
2. Check Tokens Studio configuration
3. Validate JSON format

## 📚 Resources

- [Style Dictionary Documentation](https://amzn.github.io/style-dictionary/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Tokens Studio Documentation](https://docs.tokens.studio/)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🆘 Support

For questions or issues:

1. Check existing [GitHub Issues](https://github.com/your-company/design-tokens/issues)
2. Create new issue with detailed description
3. Contact the design system team on Slack: #design-system