#!/bin/bash

# -------------------------------------------
# Purpose: Set up ESLint + Prettier for a JS project
# Usage:   Run this script in your project root:
#          bash add_eslint.sh
# -------------------------------------------

echo "🔧 Installing ESLint and Prettier dependencies..."

# Install ESLint, Prettier, and useful plugins/configs
npm install --save-dev \
  eslint \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier \
  eslint-plugin-jest \
  @eslint/js \
  globals \
  jest

echo "✅ Dependencies installed."

# Create a basic ESLint config file
echo "🧩 Creating eslint.config.js..."

cat > eslint.config.js << 'EOF'
import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "prettier/prettier": "warn",
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
EOF

echo "✅ ESLint configuration file created: eslint.config.js"
echo "🎉 Setup complete! You can now lint your code with:  npx eslint ."
