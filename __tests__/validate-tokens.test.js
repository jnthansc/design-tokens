const { validateTokens } = require('../scripts/validate-tokens');
const fs = require('fs');
const path = require('path');

describe('Token Validation', () => {
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalProcessExit = process.exit;

  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    process.exit = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    process.exit = originalProcessExit;
  });

  test('should validate valid tokens.json', () => {
    const result = validateTokens();
    expect(result).toBe(true);
    expect(console.log).toHaveBeenCalledWith('✅ Token validation passed');
  });

  test('should detect missing required properties', () => {
    // Create a temporary invalid tokens file
    const invalidTokens = {
      global: {
        color: {
          invalid: {
            // Missing value and type
          }
        }
      }
    };

    const tempPath = path.join(__dirname, 'temp-tokens.json');
    fs.writeFileSync(tempPath, JSON.stringify(invalidTokens, null, 2));

    // Mock the tokens path to use our temp file
    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = jest.fn((filePath, encoding) => {
      if (filePath.includes('tokens.json')) {
        return fs.readFileSync(tempPath, encoding);
      }
      return originalReadFileSync(filePath, encoding);
    });

    validateTokens();

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Token validation failed')
    );

    // Cleanup
    fs.unlinkSync(tempPath);
    fs.readFileSync = originalReadFileSync;
  });

  test('should warn about unknown token types', () => {
    const tokensWithUnknownType = {
      global: {
        custom: {
          token: {
            value: 'test',
            type: 'unknownType'
          }
        }
      }
    };

    const tempPath = path.join(__dirname, 'temp-unknown-type.json');
    fs.writeFileSync(tempPath, JSON.stringify(tokensWithUnknownType, null, 2));

    const originalReadFileSync = fs.readFileSync;
    fs.readFileSync = jest.fn((filePath, encoding) => {
      if (filePath.includes('tokens.json')) {
        return fs.readFileSync(tempPath, encoding);
      }
      return originalReadFileSync(filePath, encoding);
    });

    const result = validateTokens();

    expect(result).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Unknown token type "unknownType"')
    );

    // Cleanup
    fs.unlinkSync(tempPath);
    fs.readFileSync = originalReadFileSync;
  });
});
