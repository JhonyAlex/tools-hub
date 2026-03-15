Commit: feat: Add error handling for embedding persistence in processDocument function 
##########################################
### Download Github Archive Started...
### Sun, 15 Mar 2026 20:25:13 GMT
##########################################

#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.21kB done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 DONE 0.3s

#3 [internal] load .dockerignore
#3 transferring context: 2B done
#3 DONE 0.0s

#4 [base 1/3] FROM docker.io/library/node:20-alpine@sha256:b88333c42c23fbd91596ebd7fd10de239cedab9617de04142dde7315e3bc0afa
#4 DONE 0.0s

#5 [internal] load build context
#5 transferring context: 1.15MB 0.0s done
#5 DONE 0.0s

#6 [base 3/3] WORKDIR /app
#6 CACHED

#7 [deps 2/2] RUN npm ci
#7 CACHED

#8 [deps 1/2] COPY package.json package-lock.json* ./
#8 CACHED

#9 [base 2/3] RUN apk add --no-cache libc6-compat openssl
#9 CACHED

#10 [builder 1/5] WORKDIR /app
#10 CACHED

#11 [builder 2/5] COPY --from=deps /app/node_modules ./node_modules
#11 CACHED

#12 [builder 3/5] COPY . .
#12 DONE 0.1s

#13 [builder 4/5] RUN ./node_modules/.bin/prisma generate
#13 0.580 Environment variables loaded from .env
#13 0.584 Prisma schema loaded from prisma/schema.prisma
#13 1.801 
#13 1.801 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 238ms
#13 1.801 
#13 1.801 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#13 1.801 
#13 1.801 Tip: Curious about the SQL queries Prisma ORM generates? Optimize helps you enhance your visibility: https://pris.ly/tip-2-optimize
#13 1.801 
#13 DONE 2.0s

#14 [builder 5/5] RUN npm run build
#14 0.689 
#14 0.689 > tools-hub@0.1.0 build
#14 0.689 > next build
#14 0.689 
#14 1.782 ▲ Next.js 16.1.6 (Turbopack)
#14 1.783 - Environments: .env
#14 1.783 
#14 1.786 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
#14 1.822   Creating an optimized production build ...
#14 15.08 ✓ Compiled successfully in 12.6s
#14 15.08   Running TypeScript ...
#14 23.17 Failed to compile.
#14 23.17 
#14 23.17 ./core/lib/requestUser.ts:6:11
#14 23.17 Type error: Property 'userId' does not exist on type 'Promise<SessionAuthWithRedirect>'.
#14 23.17 
#14 23.17   4 | export function getRequestUserId(req: NextRequest): string | null {
#14 23.17   5 |   void req;
#14 23.17 > 6 |   const { userId } = auth();
#14 23.17     |           ^
#14 23.17   7 |   return userId ?? null;
#14 23.17   8 | }
#14 23.17   9 |
#14 23.29 Next.js build worker exited with code: 1 and signal: null
#14 23.41 npm notice
#14 23.41 npm notice New major version of npm available! 10.8.2 -> 11.11.1
#14 23.41 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.11.1
#14 23.41 npm notice To update run: npm install -g npm@11.11.1
#14 23.41 npm notice
#14 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
 > [builder 5/5] RUN npm run build:
23.17     |           ^
23.17   7 |   return userId ?? null;
23.17   8 | }
23.17   9 |
23.29 Next.js build worker exited with code: 1 and signal: null
23.41 npm notice
23.41 npm notice New major version of npm available! 10.8.2 -> 11.11.1
23.41 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.11.1
23.41 npm notice To update run: npm install -g npm@11.11.1
23.41 npm notice
------
Dockerfile:18
--------------------
  16 |     RUN ./node_modules/.bin/prisma generate
  17 |     ENV NEXT_TELEMETRY_DISABLED=1
  18 | >>> RUN npm run build
  19 |     
  20 |     # --- Production ---
--------------------
ERROR: failed to build: failed to solve: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
##########################################
### Error
### Sun, 15 Mar 2026 20:25:40 GMT
##########################################