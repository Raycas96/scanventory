/**
 * lint-staged configuration for Scanventory
 *
 * This configuration ensures code quality by:
 * 1. Formatting code with Prettier (runs first to avoid conflicts)
 * 2. Linting with ESLint (runs after Prettier)
 * 3. Type checking TypeScript files
 *
 * Order matters: Prettier → ESLint → TypeScript
 * Tests are excluded from pre-commit (too slow) - run in CI instead
 */
const config = {
  // Format all code files with Prettier first
  // This ensures consistent formatting before ESLint runs
  "*.{js,jsx,ts,tsx,json,jsonc}": ["prettier --write"],

  // Format style and config files
  // Note: TOML files are excluded - Prettier doesn't support TOML natively
  // If you need TOML formatting, install: pnpm add -D prettier-plugin-toml
  "*.{css,scss,md,mdx,yaml,yml}": ["prettier --write"],

  // Lint JavaScript and TypeScript files
  // ESLint runs after Prettier to catch any remaining issues
  "*.{js,jsx,ts,tsx}": [
    "eslint --cache --fix",
    // Only run type check on TypeScript files (can be slow, optional)
    // Uncomment if you want strict type checking on every commit:
    // (file) => `tsc --noEmit --pretty false ${file}`,
  ],

  // Prisma schema formatting
  "prisma/schema.prisma": ["prettier --write"],

  // GraphQL schema files
  "*.graphql": ["prettier --write"],

  // Note: Tests are intentionally excluded from pre-commit
  // Running tests on every commit is too slow. Run tests in CI/CD instead.
  // If you need to run tests, use: pnpm test
};

export default config;
