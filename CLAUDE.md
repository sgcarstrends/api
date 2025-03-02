# SG Cars Trends API - Reference Guide

## Commands
- Build: `pnpm build`
- Lint: `pnpm lint` (uses Biome)
- Test all: `pnpm test`
- Test watch: `pnpm test:watch`
- Test coverage: `pnpm test:coverage`
- Run single test: `pnpm -F @sgcarstrends/api test -- src/utils/__tests__/slugify.test.ts`
- Package-specific test: `pnpm -F @sgcarstrends/<package> test`

## Code Style
- TypeScript with strict type checking
- Use double quotes for strings (Biome enforced)
- Use spaces for indentation (Biome enforced)
- Organize imports automatically (Biome enforced)
- Function/variable naming: camelCase
- Class naming: PascalCase
- Error handling: Use try/catch for async operations
- Use workspace imports for shared packages: `@sgcarstrends/utils`, etc.
- Path aliases: Use `@api/` for imports in api app

## Testing
- Testing framework: Vitest
- Tests should be in `__tests__` directories next to implementation
- Test file suffix: `.test.ts`