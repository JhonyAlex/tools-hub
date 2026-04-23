Commit: feat: enhance UI components with improved styling and layout adjustments across dashboard and AurisLM sections 
##########################################
### Download Github Archive Started...
### Thu, 23 Apr 2026 09:04:33 GMT
##########################################

#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.21kB done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:20-alpine
#2 DONE 0.6s

#3 [internal] load .dockerignore
#3 transferring context: 2B 0.0s done
#3 DONE 0.0s

#4 [base 1/3] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 resolve docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 done
#4 ...

#5 [internal] load build context
#5 transferring context: 1.34MB 0.1s done
#5 DONE 0.1s

#4 [base 1/3] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#4 sha256:afdf98210b07b586eb71fa22ba2e432e058e4cd1304d31ed60888755b8c865fb 1.72kB / 1.72kB done
#4 sha256:11cedc39e663e7c5d5cb9cc77a461a0d2adc25537b94e6831a6108f09cb2001b 6.52kB / 6.52kB done
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 0B / 3.86MB 0.1s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 0B / 43.23MB 0.1s
#4 sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 0B / 1.26MB 0.1s
#4 sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 7.67kB / 7.67kB done
#4 extracting sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb
#4 sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 3.86MB / 3.86MB 0.2s done
#4 sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 0B / 445B 0.2s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 15.73MB / 43.23MB 0.4s
#4 sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 1.26MB / 1.26MB 0.2s done
#4 extracting sha256:6a0ac1617861a677b045b7ff88545213ec31c0ff08763195a70a4a5adda577bb 0.1s done
#4 sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 445B / 445B 0.3s done
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 23.07MB / 43.23MB 0.5s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 40.89MB / 43.23MB 0.7s
#4 sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 43.23MB / 43.23MB 0.8s done
#4 extracting sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 0.1s
#4 extracting sha256:4feea04c154301db6f4a496efa397b3db96603b1c009c797cfdde77bea8b3287 1.4s done
#4 extracting sha256:b2cbbfe903b0821005780971ddc5892edcc4ce74c5a48d82e1d2b382edac3122 0.0s done
#4 extracting sha256:fff4e2c1b189bf87d63ad8bd07f7f4eb288d6f2b6a07a8bb44c60e8c075d2096 done
#4 DONE 2.4s

#6 [base 2/3] RUN apk add --no-cache libc6-compat openssl
#6 0.645 (1/4) Installing musl-obstack (1.2.3-r2)
#6 0.649 (2/4) Installing libucontext (1.3.3-r0)
#6 0.652 (3/4) Installing gcompat (1.1.0-r4)
#6 0.657 (4/4) Installing openssl (3.5.6-r0)
#6 0.670 Executing busybox-1.37.0-r30.trigger
#6 0.678 OK: 11.8 MiB in 22 packages
#6 DONE 0.7s

#7 [base 3/3] WORKDIR /app
#7 DONE 0.0s

#8 [builder 1/5] WORKDIR /app
#8 DONE 0.0s

#9 [deps 1/2] COPY package.json package-lock.json* ./
#9 DONE 0.0s

#10 [runner  2/10] RUN addgroup --system --gid 1001 nodejs
#10 DONE 0.1s

#11 [runner  3/10] RUN adduser --system --uid 1001 nextjs
#11 DONE 0.1s

#12 [deps 2/2] RUN npm ci
#12 5.533 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
#12 99.21 
#12 99.21 added 885 packages, and audited 886 packages in 2m
#12 99.21 
#12 99.21 325 packages are looking for funding
#12 99.21   run `npm fund` for details
#12 99.41 
#12 99.41 13 vulnerabilities (2 moderate, 8 high, 3 critical)
#12 99.41 
#12 99.41 To address issues that do not require attention, run:
#12 99.41   npm audit fix
#12 99.41 
#12 99.41 To address all issues, run:
#12 99.41   npm audit fix --force
#12 99.41 
#12 99.41 Run `npm audit` for details.
#12 99.41 npm notice
#12 99.41 npm notice New major version of npm available! 10.8.2 -> 11.13.0
#12 99.41 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.13.0
#12 99.41 npm notice To update run: npm install -g npm@11.13.0
#12 99.41 npm notice
#12 DONE 99.7s

#13 [builder 2/5] COPY --from=deps /app/node_modules ./node_modules
#13 DONE 7.9s

#14 [builder 3/5] COPY . .
#14 DONE 0.1s

#15 [builder 4/5] RUN ./node_modules/.bin/prisma generate
#15 0.577 Environment variables loaded from .env
#15 0.581 Prisma schema loaded from prisma/schema.prisma
#15 1.476 
#15 1.476 ✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 166ms
#15 1.476 
#15 1.476 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#15 1.476 
#15 1.476 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
#15 1.476 
#15 DONE 1.7s

#16 [builder 5/5] RUN npm run build
#16 0.551 
#16 0.551 > tools-hub@0.1.0 build
#16 0.551 > next build
#16 0.551 
#16 1.598 ▲ Next.js 16.1.6 (Turbopack)
#16 1.598 - Environments: .env
#16 1.598 
#16 1.601 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
#16 1.641   Creating an optimized production build ...
#16 16.05 
#16 16.05 > Build error occurred
#16 16.06 Error: Turbopack build failed with 3 errors:
#16 16.06 ./core/components/Header.tsx:94:18
#16 16.06 Parsing ecmascript source code failed
#16 16.06   92 |                     Beta
#16 16.06   93 |                   </Badge>
#16 16.06 > 94 |                 )}
#16 16.06      |                  ^
#16 16.06   95 |               </div>
#16 16.06   96 |               {toolInfo.description && (
#16 16.06   97 |                 <p className="text-xs text-muted-foreground truncate max-w-[300px] lg:max-w-[500px]">
#16 16.06 
#16 16.06 Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
#16 16.06 
#16 16.06 Import traces:
#16 16.06   Server Component:
#16 16.06     ./core/components/Header.tsx
#16 16.06     ./app/(dashboard)/layout.tsx
#16 16.06 
#16 16.06   Client Component Browser:
#16 16.06     ./core/components/Header.tsx [Client Component Browser]
#16 16.06     ./core/components/index.ts [Client Component Browser]
#16 16.06     ./tools/ai-report-orchestrator/components/AIReportOrchestratorApp.tsx [Client Component Browser]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Client Component Browser]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Server Component]
#16 16.06 
#16 16.06   Client Component SSR:
#16 16.06     ./core/components/Header.tsx [Client Component SSR]
#16 16.06     ./core/components/index.ts [Client Component SSR]
#16 16.06     ./tools/ai-report-orchestrator/components/AIReportOrchestratorApp.tsx [Client Component SSR]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Client Component SSR]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Server Component]
#16 16.06 
#16 16.06 
#16 16.06 ./core/components/Sidebar.tsx:156:79
#16 16.06 Parsing ecmascript source code failed
#16 16.06   154 |         <kbd className="mt-1 inline-block rounded border bg-muted px-1 font-mono text-[9px]">
#16 16.06   155 |           ⌘K
#16 16.06 > 156 |         </kbd>{" "}h-14 items-center justify-between gap-3 px-4 py-2 border-b">
#16 16.06       |                                                                               ^
#16 16.06   157 |       <p className="text-xs text-muted-foreground min-w-0 flex items-center gap-2">
#16 16.06   158 |         <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
#16 16.06   159 |           ⌘K
#16 16.06 
#16 16.06 Unexpected token. Did you mean `{'>'}` or `&gt;`?
#16 16.06 
#16 16.06 Import traces:
#16 16.06   Server Component:
#16 16.06     ./core/components/Sidebar.tsx
#16 16.06     ./app/(dashboard)/layout.tsx
#16 16.06 
#16 16.06   Client Component Browser:
#16 16.06     ./core/components/Sidebar.tsx [Client Component Browser]
#16 16.06     ./core/components/index.ts [Client Component Browser]
#16 16.06     ./tools/ai-report-orchestrator/components/AIReportOrchestratorApp.tsx [Client Component Browser]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Client Component Browser]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Server Component]
#16 16.06 
#16 16.06   Client Component SSR:
#16 16.06     ./core/components/Sidebar.tsx [Client Component SSR]
#16 16.06     ./core/components/index.ts [Client Component SSR]
#16 16.06     ./tools/ai-report-orchestrator/components/AIReportOrchestratorApp.tsx [Client Component SSR]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Client Component SSR]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Server Component]
#16 16.06 
#16 16.06 
#16 16.06 ./core/components/Sidebar.tsx:177:1
#16 16.06 Parsing ecmascript source code failed
#16 16.06   175 |     </div>
#16 16.06   176 |   );
#16 16.06 > 177 | }
#16 16.06       | ^
#16 16.06   178 |
#16 16.06   179 | function CollapsedSidebarRailHeader({ toggle }: { toggle: () => void }) {
#16 16.06   180 |   return (
#16 16.06 
#16 16.06 Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
#16 16.06 
#16 16.06 Import traces:
#16 16.06   Server Component:
#16 16.06     ./core/components/Sidebar.tsx
#16 16.06     ./app/(dashboard)/layout.tsx
#16 16.06 
#16 16.06   Client Component Browser:
#16 16.06     ./core/components/Sidebar.tsx [Client Component Browser]
#16 16.06     ./core/components/index.ts [Client Component Browser]
#16 16.06     ./tools/ai-report-orchestrator/components/AIReportOrchestratorApp.tsx [Client Component Browser]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Client Component Browser]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Server Component]
#16 16.06 
#16 16.06   Client Component SSR:
#16 16.06     ./core/components/Sidebar.tsx [Client Component SSR]
#16 16.06     ./core/components/index.ts [Client Component SSR]
#16 16.06     ./tools/ai-report-orchestrator/components/AIReportOrchestratorApp.tsx [Client Component SSR]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Client Component SSR]
#16 16.06     ./app/(dashboard)/tools/ai-report-orchestrator/page.tsx [Server Component]
#16 16.06 
#16 16.06 
#16 16.06     at <unknown> (./core/components/Header.tsx:94:18)
#16 16.06     at <unknown> (./core/components/Sidebar.tsx:156:79)
#16 16.06     at <unknown> (./core/components/Sidebar.tsx:177:1)
#16 16.32 npm notice
#16 16.32 npm notice New major version of npm available! 10.8.2 -> 11.13.0
#16 16.32 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.13.0
#16 16.32 npm notice To update run: npm install -g npm@11.13.0
#16 16.32 npm notice
#16 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 1
------
 > [builder 5/5] RUN npm run build:
16.06 
16.06 
16.06     at <unknown> (./core/components/Header.tsx:94:18)
16.06     at <unknown> (./core/components/Sidebar.tsx:156:79)
16.06     at <unknown> (./core/components/Sidebar.tsx:177:1)
16.32 npm notice
16.32 npm notice New major version of npm available! 10.8.2 -> 11.13.0
16.32 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.13.0
16.32 npm notice To update run: npm install -g npm@11.13.0
16.32 npm notice
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
### Thu, 23 Apr 2026 09:06:51 GMT
##########################################