# @raweval/db

Database package for RawEval monorepo.

## Setup

1. Choose your ORM:
   - **Prisma** (recommended for type safety)
   - **Drizzle** (lightweight, SQL-like)
   - **Kysely** (type-safe SQL builder)

2. Install dependencies:
```bash
pnpm --filter @raweval/db add prisma @prisma/client
# or
pnpm --filter @raweval/db add drizzle-orm
```

3. Create `prisma/schema.prisma` (if using Prisma):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

4. Generate client:
```bash
pnpm --filter @raweval/db db:generate
```

## Usage

```typescript
import { db } from '@raweval/db';

// Use in apps
const users = await db.user.findMany();
```

## Migration

```bash
# Create migration
pnpm --filter @raweval/db db:migrate

# Open Prisma Studio
pnpm --filter @raweval/db db:studio
```
