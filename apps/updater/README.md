# Updater

## Description

Scheduler for downloading and updating cars and COE data.

## Prerequisites

- [Node.js](https://nodejs.org/) (compatible with Node 22.x)
- [pnpm](https://pnpm.io/)

## Installation

```bash
pnpm install
```

## Scripts

- `pnpm dev`: Start development server using [SST (Serverless Stack)](https://sst.dev/) in dev stage
- `pnpm test`: Run tests using [Vitest](https://vitest.dev/)
- `pnpm test:coverage`: Run tests with coverage report
- `pnpm migrate`: Run database migrations using [Drizzle Kit](https://orm.drizzle.team/)

## Key Dependencies

- [Hono](https://hono.dev/) (Web framework)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon Database Serverless](https://neon.tech/)
- [Upstash Redis](https://upstash.com/)
- [Trigger.dev](https://trigger.dev/) (Job scheduling and orchestration)
- [AdmZip](https://github.com/cthackers/adm-zip) (File extraction)
- [Node.js Crypto](https://nodejs.org/api/crypto.html) (Checksum generation)

## Development Tools

- [Vitest](https://vitest.dev/) (Testing)
- [Biome](https://biomejs.dev/) (Linting)

## Key Features

- Automated job scheduling with Trigger.dev
- Efficient file download and extraction
- SHA-256 checksum calculation
- Serverless database migrations
- Redis caching support

## Database Migrations

Migrations are managed using Drizzle Kit. Run `pnpm migrate` to apply database schema changes.

## Performance Considerations

- Streaming file processing to minimize memory usage
- Chunk-based file checksum calculation
- Lightweight ZIP file handling
- Serverless job scheduling

## License

MIT License

## Author

Ru Chern Chong <ruchern.chong@sgcarstrends.com>
