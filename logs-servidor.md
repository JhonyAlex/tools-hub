Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

Migration 20260315090000_aurislm_tenancy_pgvector marked as rolled back.

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

5 migrations found in prisma/migrations

Applying migration `20260315090000_aurislm_tenancy_pgvector`
Error: P3018

A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260315090000_aurislm_tenancy_pgvector

Database error code: 0A000

Database error:
ERROR: extension "vector" is not available
DETAIL: Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
HINT: The extension must first be installed on the system where PostgreSQL is running.

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E0A000), message: "extension \"vector\" is not available", detail: Some("Could not open extension control file \"/usr/share/postgresql/17/extension/vector.control\": No such file or directory."), hint: Some("The extension must first be installed on the system where PostgreSQL is running."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("extension.c"), line: Some(672), routine: Some("parse_extension_control_file") }


Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

Migration 20260315090000_aurislm_tenancy_pgvector marked as rolled back.

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

5 migrations found in prisma/migrations

Applying migration `20260315090000_aurislm_tenancy_pgvector`
Error: P3018

A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260315090000_aurislm_tenancy_pgvector

Database error code: 0A000

Database error:
ERROR: extension "vector" is not available
DETAIL: Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
HINT: The extension must first be installed on the system where PostgreSQL is running.

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E0A000), message: "extension \"vector\" is not available", detail: Some("Could not open extension control file \"/usr/share/postgresql/17/extension/vector.control\": No such file or directory."), hint: Some("The extension must first be installed on the system where PostgreSQL is running."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("extension.c"), line: Some(672), routine: Some("parse_extension_control_file") }


Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

Migration 20260315090000_aurislm_tenancy_pgvector marked as rolled back.

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

5 migrations found in prisma/migrations

Applying migration `20260315090000_aurislm_tenancy_pgvector`
Error: P3018

A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve

Migration name: 20260315090000_aurislm_tenancy_pgvector

Database error code: 0A000

Database error:
ERROR: extension "vector" is not available
DETAIL: Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
HINT: The extension must first be installed on the system where PostgreSQL is running.

DbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E0A000), message: "extension \"vector\" is not available", detail: Some("Could not open extension control file \"/usr/share/postgresql/17/extension/vector.control\": No such file or directory."), hint: Some("The extension must first be installed on the system where PostgreSQL is running."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("extension.c"), line: Some(672), routine: Some("parse_extension_control_file") }


Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

Migration 20260315090000_aurislm_tenancy_pgvector marked as rolled back.

Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

5 migrations found in prisma/migrations

Applying migration `20260315090000_aurislm_tenancy_pgvector`

The following migration(s) have been applied:

migrations/
  └─ 20260315090000_aurislm_tenancy_pgvector/
    └─ migration.sql
      
All migrations have been successfully applied.
┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.5.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
Starting Next.js server...
▲ Next.js 16.1.6
- Local:         http://localhost:80
- Network:       http://0.0.0.0:80

✓ Starting...
✓ Ready in 108ms