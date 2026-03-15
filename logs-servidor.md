Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

4 migrations found in prisma/migrations


No pending migrations to apply.
Starting Next.js server...
▲ Next.js 16.1.6
- Local:         http://localhost:80
- Network:       http://0.0.0.0:80

✓ Starting...
✓ Ready in 108ms
[AurisLM] Imagen detectada, enviando a OCR...
[AurisLM] PDF necesita OCR (0 chars/pág). Renderizando páginas...
Warning: Please use the `legacy` build in Node.js environments.
[AurisLM] OCR de páginas falló: Error: Failed to load external module pdfjs-dist-29912611d2e8a9df: ReferenceError: DOMMatrix is not defined
    at Context.externalImport [as y] (.next/server/chunks/[turbopack]_runtime.js:518:15)
    at async (.next/server/chunks/[root-of-the-server]__4a081bae._.js:1:170)
[AurisLM] processDocument error: Error: No se pudo extraer texto del PDF. Puede ser un documento escaneado y el servicio de OCR no está disponible.
    at ignore-listed frames
[DocChat] Imagen detectada, enviando a OCR...
Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

4 migrations found in prisma/migrations


No pending migrations to apply.
Starting Next.js server...
▲ Next.js 16.1.6
- Local:         http://localhost:80
- Network:       http://0.0.0.0:80

✓ Starting...
✓ Ready in 105ms
[AurisLM] download: Error: ENOENT: no such file or directory, open '/app/uploads/doc-chat-export/REQUERIMIENTO GRUPO NEDEMY 25 FEBRERO 2026.pdf'
    at async y (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:2141)
    at async d (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:5673)
    at async l (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:6714)
    at async Module.O (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:7792) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/app/uploads/doc-chat-export/REQUERIMIENTO GRUPO NEDEMY 25 FEBRERO 2026.pdf'
}
[AurisLM] download: Error: ENOENT: no such file or directory, open '/app/uploads/doc-chat-export/REQUERIMIENTO GRUPO NEDEMY 25 FEBRERO 2026.pdf'
    at async y (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:2141)
    at async d (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:5673)
    at async l (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:6714)
    at async Module.O (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:7792) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/app/uploads/doc-chat-export/REQUERIMIENTO GRUPO NEDEMY 25 FEBRERO 2026.pdf'
}
[AurisLM] download: Error: ENOENT: no such file or directory, open '/app/uploads/doc-chat-export/REQUERIMIENTO GRUPO NEDEMY 25 FEBRERO 2026.pdf'
    at async y (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:2141)
    at async d (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:5673)
    at async l (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:6714)
    at async Module.O (.next/server/chunks/[root-of-the-server]__851a28fc._.js:1:7792) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/app/uploads/doc-chat-export/REQUERIMIENTO GRUPO NEDEMY 25 FEBRERO 2026.pdf'
}
[AurisLM] PDF con texto suficiente, omitiendo OCR.
[DocChat] Imagen detectada, enviando a OCR...
Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

4 migrations found in prisma/migrations


No pending migrations to apply.
Starting Next.js server...
▲ Next.js 16.1.6
- Local:         http://localhost:80
- Network:       http://0.0.0.0:80

✓ Starting...
✓ Ready in 107ms
[AurisLM] Imagen detectada, enviando a OCR...
[AurisLM] Imagen detectada, enviando a OCR...
Running Prisma migrations...
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


Starting Next.js server...
▲ Next.js 16.1.6
- Local:         http://localhost:80
- Network:       http://0.0.0.0:80

✓ Starting...
✓ Ready in 116ms
Running Prisma migrations...
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "toolshub", schema "public" at "work-tools-jhony_postgres:5432"

5 migrations found in prisma/migrations

Error: P3009

migrate found failed migrations in the target database, new migrations will not be applied. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve
The `20260315090000_aurislm_tenancy_pgvector` migration started at 2026-03-15 09:44:50.107066 UTC failed


Starting Next.js server...
▲ Next.js 16.1.6
- Local:         http://localhost:80
- Network:       http://0.0.0.0:80

✓ Starting...
✓ Ready in 107ms
Error: @clerk/nextjs: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
    at Object.throwMissingPublishableKeyError (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:24:1499)
    at l (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4916)
    at <unknown> (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4953)
Error: @clerk/nextjs: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
    at Object.throwMissingPublishableKeyError (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:24:1499)
    at l (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4916)
    at <unknown> (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4953)
Error: @clerk/nextjs: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
    at Object.throwMissingPublishableKeyError (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:24:1499)
    at l (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4916)
    at <unknown> (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4953)
Error: @clerk/nextjs: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
    at Object.throwMissingPublishableKeyError (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:24:1499)
    at l (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4916)
    at <unknown> (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4953)
Error: @clerk/nextjs: Missing publishableKey. You can get your key at https://dashboard.clerk.com/last-active?path=api-keys.
    at Object.throwMissingPublishableKeyError (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:24:1499)
    at l (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4916)
    at <unknown> (.next/server/edge/chunks/[root-of-the-server]__a72fedf9._.js:72:4953)