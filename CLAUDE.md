# SG Cars Trends API - Developer Reference Guide

## Project Overview
SG Cars Trends API provides access to Singapore vehicle registration data and Certificate of Entitlement (COE) bidding results. The system consists of:
- **API Service**: RESTful endpoints for accessing car registration and COE data
- **Updater Service**: Scheduled jobs that fetch and process data from LTA DataMall

## Commands
### Common Commands
- Build all: `pnpm build`
- Develop: `pnpm dev`
- Lint: `pnpm lint` (uses Biome)
- Test all: `pnpm test`
- Test watch: `pnpm test:watch`
- Test coverage: `pnpm test:coverage`
- Run single test: `pnpm -F @sgcarstrends/api test -- src/utils/__tests__/slugify.test.ts`
- Package-specific test: `pnpm -F @sgcarstrends/<package> test`

### Database Commands
- Run migrations: `pnpm migrate`
- Check pending migrations: `pnpm migrate:check`

### Deployment Commands
- Deploy API: `pnpm -F @sgcarstrends/api deploy`
- Deploy Updater service: `pnpm -F @sgcarstrends/updater deploy`
- Deploy Trigger.dev jobs: `pnpm -F @sgcarstrends/updater trigger:deploy`

## Code Structure
- **apps/api**: API service using Hono framework
- **apps/updater**: Data update service using Trigger.dev
- **packages/schema**: Shared database schema (Drizzle ORM)
- **packages/types**: Shared TypeScript type definitions
- **packages/utils**: Shared utility functions

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
- Coverage reports generated with V8 coverage

## API Endpoints
- **/v1/cars**: Car registration data (filterable by month, make, fuel type)
- **/v1/coe**: COE bidding results
- **/v1/coe/pqp**: COE Prevailing Quota Premium rates
- **/v1/makes**: List of car manufacturers
- **/v1/months/latest**: Get the latest month with data

## Environment Setup
Required environment variables:
- DATABASE_URL: PostgreSQL connection string
- SG_CARS_TRENDS_API_TOKEN: Authentication token
- UPSTASH_REDIS_REST_URL: Redis URL
- UPSTASH_REDIS_REST_TOKEN: Redis token
- UPDATER_API_TOKEN: Updater service token

## Deployment
- AWS Region: ap-southeast-1 (Singapore)
- Architecture: arm64
- Domains: sgcarstrends.com (with environment subdomains)
- Cloudflare for DNS management
- SST framework for infrastructure

## Data Models
- **cars**: Car registrations by make, fuel type, and vehicle type
- **coe**: COE bidding results (quota, bids, premium)
- **coePQP**: Prevailing Quota Premium rates