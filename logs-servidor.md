Commit: feat: Enhance Clerk integration with custom appearance and user authentication components 
##########################################
### Download Github Archive Started...
### Sun, 15 Mar 2026 19:46:01 GMT
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

#6 [builder 1/5] WORKDIR /app
#6 CACHED

#7 [deps 2/2] RUN npm ci
#7 CACHED

#8 [base 2/3] RUN apk add --no-cache libc6-compat openssl
#8 CACHED

#9 [base 3/3] WORKDIR /app
#9 CACHED

#10 [deps 1/2] COPY package.json package-lock.json* ./
#10 CACHED

#11 [builder 2/5] COPY --from=deps /app/node_modules ./node_modules
#11 CACHED

#12 [builder 3/5] COPY . .
#12 DONE 0.1s

#13 [builder 4/5] RUN ./node_modules/.bin/prisma generate
#13 0.612 Environment variables loaded from .env
#13 0.616 Prisma schema loaded from prisma/schema.prisma
#13 1.865 
#13 1.865 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 204ms
#13 1.865 
#13 1.865 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#13 1.865 
#13 1.865 Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22
#13 1.865 
#13 DONE 2.1s

#14 [builder 5/5] RUN npm run build
#14 0.600 
#14 0.600 > tools-hub@0.1.0 build
#14 0.600 > next build
#14 0.600 
#14 1.701 ▲ Next.js 16.1.6 (Turbopack)
#14 1.702 - Environments: .env
#14 1.702 
#14 1.705 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
#14 1.741   Creating an optimized production build ...
#14 15.20 
#14 15.20 > Build error occurred
#14 15.21 Error: Turbopack build failed with 4 errors:
#14 15.21 ./core/components/Header.tsx:3:1
#14 15.21 Export SignedIn doesn't exist in target module
#14 15.21   1 | "use client";
#14 15.21   2 |
#14 15.21 > 3 | import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
#14 15.21     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#14 15.21   4 | import { Wrench, Sparkles, Github, Menu, ChevronRight, Home } from "lucide-react";
#14 15.21   5 | import Link from "next/link";
#14 15.21   6 | import { ThemeToggleSimple } from "./ThemeToggle";
#14 15.21 
#14 15.21 The export SignedIn was not found in module [project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-client] (ecmascript).
#14 15.21 Did you mean to import SignIn?
#14 15.21 All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.
#14 15.21 
#14 15.21 Import trace:
#14 15.21   Server Component:
#14 15.21     ./core/components/Header.tsx
#14 15.21     ./app/(dashboard)/layout.tsx
#14 15.21 
#14 15.21 
#14 15.21 ./core/components/Header.tsx:3:1
#14 15.21 Export SignedIn doesn't exist in target module
#14 15.21   1 | "use client";
#14 15.21   2 |
#14 15.21 > 3 | import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
#14 15.21     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#14 15.21   4 | import { Wrench, Sparkles, Github, Menu, ChevronRight, Home } from "lucide-react";
#14 15.21   5 | import Link from "next/link";
#14 15.21   6 | import { ThemeToggleSimple } from "./ThemeToggle";
#14 15.21 
#14 15.21 The export SignedIn was not found in module [project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-ssr] (ecmascript).
#14 15.21 Did you mean to import SignIn?
#14 15.21 All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.
#14 15.21 
#14 15.21 Import trace:
#14 15.21   Server Component:
#14 15.21     ./core/components/Header.tsx
#14 15.21     ./app/(dashboard)/layout.tsx
#14 15.21 
#14 15.21 
#14 15.21 ./core/components/Header.tsx:3:1
#14 15.21 Export SignedOut doesn't exist in target module
#14 15.21   1 | "use client";
#14 15.21   2 |
#14 15.21 > 3 | import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
#14 15.21     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#14 15.21   4 | import { Wrench, Sparkles, Github, Menu, ChevronRight, Home } from "lucide-react";
#14 15.21   5 | import Link from "next/link";
#14 15.21   6 | import { ThemeToggleSimple } from "./ThemeToggle";
#14 15.21 
#14 15.21 The export SignedOut was not found in module [project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-client] (ecmascript).
#14 15.21 Did you mean to import SignOutButton?
#14 15.21 All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.
#14 15.21 
#14 15.21 Import trace:
#14 15.21   Server Component:
#14 15.21     ./core/components/Header.tsx
#14 15.21     ./app/(dashboard)/layout.tsx
#14 15.21 
#14 15.21 
#14 15.21 ./core/components/Header.tsx:3:1
#14 15.21 Export SignedOut doesn't exist in target module
#14 15.21   1 | "use client";
#14 15.21   2 |
#14 15.21 > 3 | import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
#14 15.21     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#14 15.21   4 | import { Wrench, Sparkles, Github, Menu, ChevronRight, Home } from "lucide-react";
#14 15.21   5 | import Link from "next/link";
#14 15.21   6 | import { ThemeToggleSimple } from "./ThemeToggle";
#14 15.21 
#14 15.21 The export SignedOut was not found in module [project]/node_modules/@clerk/nextjs/dist/esm/index.js [app-ssr] (ecmascript).
#14 15.21 Did you mean to import SignOutButton?
#14 15.21 All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.
#14 15.21 
#14 15.21 Import trace:
#14 15.21   Server Component:
#14 15.21     ./core/components/Header.tsx
#14 15.21     ./app/(dashboard)/layout.tsx
#14 15.21 
#14 15.21 
#14 15.21     at <unknown> (./core/components/Header.tsx:3:1)
#14 15.21     at <unknown> (./core/components/Header.tsx:3:1)
#14 15.21     at <unknown> (./core/components/Header.tsx:3:1)
#14 15.21     at <unknown> (./core/components/Header.tsx:3:1)
#14 15.45 npm notice
#14 15.45 npm notice New major version of npm available! 10.8.2 -> 11.11.1
#14 15.45 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.11.1
#14 15.45 npm notice To update run: npm install -g npm@11.11.1
#14 15.45 npm notice
#14 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
 > [builder 5/5] RUN npm run build:
15.21 
15.21     at <unknown> (./core/components/Header.tsx:3:1)
15.21     at <unknown> (./core/components/Header.tsx:3:1)
15.21     at <unknown> (./core/components/Header.tsx:3:1)
15.21     at <unknown> (./core/components/Header.tsx:3:1)
15.45 npm notice
15.45 npm notice New major version of npm available! 10.8.2 -> 11.11.1
15.45 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.11.1
15.45 npm notice To update run: npm install -g npm@11.11.1
15.45 npm notice
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
### Sun, 15 Mar 2026 19:46:20 GMT
##########################################
