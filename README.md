# SG Cars Trends Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

This monorepo contains the backend services for SG Cars Trends, tracking Singapore's car statistics including:

## Project Structure

```
backend/
├── apps/
│   ├── api/          # REST API service
│   └── updater/      # Data update service
├── packages/
│   ├── schema/       # Database schema using Drizzle ORM
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utility functions
```

## Technologies

- **Backend**: Node.js, TypeScript
- **Framework**: Hono
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM
- **Caching**: Upstash Redis
- **Infrastructure**: SST (Serverless Stack)
- **Scheduling**: Trigger.dev
- **Package Management**: pnpm workspace
- **Build Tools**: Turbo
- **Testing**: Vitest
- **Linting**: Biome

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/sgcarstrends/backend.git
cd backend

# Install dependencies
pnpm install
```

### Development

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint
```

## License

MIT