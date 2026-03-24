The files belonging to this database system will be owned by user "postgres".
This user must also own the server process.

The database cluster will be initialized with locale "en_US.utf8".
The default database encoding has accordingly been set to "UTF8".
The default text search configuration will be set to "english".

Data page checksums are disabled.

fixing permissions on existing directory /var/lib/postgresql/data ... ok
creating subdirectories ... ok
selecting dynamic shared memory implementation ... posix
selecting default "max_connections" ... 100
selecting default "shared_buffers" ... 128MB
selecting default time zone ... Etc/UTC
creating configuration files ... ok
running bootstrap script ... ok
performing post-bootstrap initialization ... ok
initdb: warning: enabling "trust" authentication for local connections
syncing data to disk ... ok


Success. You can now start the database server using:

    pg_ctl -D /var/lib/postgresql/data -l logfile start

initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
waiting for server to start....2026-03-02 00:02:35.818 UTC [50] LOG:  starting PostgreSQL 17.9 (Debian 17.9-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
2026-03-02 00:02:35.819 UTC [50] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-03-02 00:02:35.824 UTC [53] LOG:  database system was shut down at 2026-03-02 00:02:35 UTC
2026-03-02 00:02:35.829 UTC [50] LOG:  database system is ready to accept connections
 done
server started
CREATE DATABASE


/usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*

waiting for server to shut down...2026-03-02 00:02:36.033 UTC [50] LOG:  received fast shutdown request
.2026-03-02 00:02:36.035 UTC [50] LOG:  aborting any active transactions
2026-03-02 00:02:36.039 UTC [50] LOG:  background worker "logical replication launcher" (PID 56) exited with exit code 1
2026-03-02 00:02:36.039 UTC [51] LOG:  shutting down
2026-03-02 00:02:36.041 UTC [51] LOG:  checkpoint starting: shutdown immediate
2026-03-02 00:02:36.084 UTC [51] LOG:  checkpoint complete: wrote 925 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.018 s, sync=0.023 s, total=0.045 s; sync files=301, longest=0.002 s, average=0.001 s; distance=4256 kB, estimate=4256 kB; lsn=0/1915978, redo lsn=0/1915978
2026-03-02 00:02:36.094 UTC [50] LOG:  database system is shut down
 done
server stopped

PostgreSQL init process complete; ready for start up.

2026-03-02 00:02:36.160 UTC [7] LOG:  starting PostgreSQL 17.9 (Debian 17.9-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit
2026-03-02 00:02:36.160 UTC [7] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-03-02 00:02:36.160 UTC [7] LOG:  listening on IPv6 address "::", port 5432
2026-03-02 00:02:36.162 UTC [7] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-03-02 00:02:36.165 UTC [66] LOG:  database system was shut down at 2026-03-02 00:02:36 UTC
2026-03-02 00:02:36.171 UTC [7] LOG:  database system is ready to accept connections
2026-03-02 00:07:36.265 UTC [64] LOG:  checkpoint starting: time
2026-03-02 00:07:40.682 UTC [64] LOG:  checkpoint complete: wrote 47 buffers (0.3%); 0 WAL file(s) added, 0 removed, 0 recycled; write=4.411 s, sync=0.003 s, total=4.417 s; sync files=12, longest=0.002 s, average=0.001 s; distance=270 kB, estimate=270 kB; lsn=0/19591F0, redo lsn=0/1959198
2026-03-02 02:17:38.715 UTC [64] LOG:  checkpoint starting: time
2026-03-02 02:17:44.436 UTC [64] LOG:  checkpoint complete: wrote 58 buffers (0.4%); 0 WAL file(s) added, 0 removed, 0 recycled; write=5.715 s, sync=0.004 s, total=5.721 s; sync files=49, longest=0.001 s, average=0.001 s; distance=222 kB, estimate=265 kB; lsn=0/1990BF0, redo lsn=0/1990B60
2026-03-02 02:22:38.493 UTC [64] LOG:  checkpoint starting: time
2026-03-02 02:22:39.199 UTC [64] LOG:  checkpoint complete: wrote 7 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.702 s, sync=0.001 s, total=0.706 s; sync files=5, longest=0.001 s, average=0.001 s; distance=8 kB, estimate=239 kB; lsn=0/1992BB8, redo lsn=0/1992B60
2026-03-02 02:27:38.298 UTC [64] LOG:  checkpoint starting: time
2026-03-02 02:27:38.805 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.503 s, sync=0.001 s, total=0.507 s; sync files=4, longest=0.001 s, average=0.001 s; distance=1 kB, estimate=215 kB; lsn=0/1993380, redo lsn=0/19932F0
2026-03-02 07:42:43.288 UTC [64] LOG:  checkpoint starting: time
2026-03-02 07:42:43.393 UTC [64] LOG:  checkpoint complete: wrote 2 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.101 s, sync=0.002 s, total=0.105 s; sync files=2, longest=0.001 s, average=0.001 s; distance=1 kB, estimate=194 kB; lsn=0/19939F0, redo lsn=0/1993998
2026-03-02 07:47:43.493 UTC [64] LOG:  checkpoint starting: time
2026-03-02 07:47:43.798 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.302 s, sync=0.002 s, total=0.306 s; sync files=4, longest=0.001 s, average=0.001 s; distance=3 kB, estimate=175 kB; lsn=0/1994838, redo lsn=0/19947E0
2026-03-02 09:10:39.903 UTC [1596] LOG:  could not receive data from client: Connection reset by peer
2026-03-02 09:12:22.306 UTC [1603] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 442
2026-03-02 09:12:22.306 UTC [1603] STATEMENT:  SELECT "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt" FROM "public"."MaintenanceReportSemMes" WHERE 1=1 ORDER BY "public"."MaintenanceReportSemMes"."dateRangeStart" DESC OFFSET $1
2026-03-02 09:39:44.528 UTC [1686] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 13
2026-03-02 09:39:44.528 UTC [1686] STATEMENT:  INSERT INTO "public"."MaintenanceReportSemMes" ("id","periodType","dateRangeStart","dateRangeEnd","csvFileName","metrics","notes","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt"
2026-03-02 09:39:55.294 UTC [1686] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 13
2026-03-02 09:39:55.294 UTC [1686] STATEMENT:  INSERT INTO "public"."MaintenanceReportSemMes" ("id","periodType","dateRangeStart","dateRangeEnd","csvFileName","metrics","notes","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt"
2026-03-02 10:05:44.020 UTC [1767] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 442
2026-03-02 10:05:44.020 UTC [1767] STATEMENT:  SELECT "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt" FROM "public"."MaintenanceReportSemMes" WHERE 1=1 ORDER BY "public"."MaintenanceReportSemMes"."dateRangeStart" DESC OFFSET $1
2026-03-02 10:05:44.262 UTC [1767] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 442
2026-03-02 10:05:44.262 UTC [1767] STATEMENT:  SELECT "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt" FROM "public"."MaintenanceReportSemMes" WHERE 1=1 ORDER BY "public"."MaintenanceReportSemMes"."dateRangeStart" DESC OFFSET $1
2026-03-02 10:07:45.175 UTC [1767] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 13
2026-03-02 10:07:45.175 UTC [1767] STATEMENT:  INSERT INTO "public"."MaintenanceReportSemMes" ("id","periodType","dateRangeStart","dateRangeEnd","csvFileName","metrics","notes","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt"
2026-03-02 10:15:15.773 UTC [1797] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 442
2026-03-02 10:15:15.773 UTC [1797] STATEMENT:  SELECT "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt" FROM "public"."MaintenanceReportSemMes" WHERE 1=1 ORDER BY "public"."MaintenanceReportSemMes"."dateRangeStart" DESC OFFSET $1
2026-03-02 10:15:15.929 UTC [1797] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 442
2026-03-02 10:15:15.929 UTC [1797] STATEMENT:  SELECT "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt" FROM "public"."MaintenanceReportSemMes" WHERE 1=1 ORDER BY "public"."MaintenanceReportSemMes"."dateRangeStart" DESC OFFSET $1
2026-03-02 10:26:21.475 UTC [1831] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 13
2026-03-02 10:26:21.475 UTC [1831] STATEMENT:  INSERT INTO "public"."MaintenanceReportSemMes" ("id","periodType","dateRangeStart","dateRangeEnd","csvFileName","metrics","notes","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt"
2026-03-02 10:26:29.844 UTC [1831] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 442
2026-03-02 10:26:29.844 UTC [1831] STATEMENT:  SELECT "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt" FROM "public"."MaintenanceReportSemMes" WHERE 1=1 ORDER BY "public"."MaintenanceReportSemMes"."dateRangeStart" DESC OFFSET $1
2026-03-02 10:26:30.134 UTC [1831] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 442
2026-03-02 10:26:30.134 UTC [1831] STATEMENT:  SELECT "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt" FROM "public"."MaintenanceReportSemMes" WHERE 1=1 ORDER BY "public"."MaintenanceReportSemMes"."dateRangeStart" DESC OFFSET $1
2026-03-02 10:26:36.555 UTC [1831] ERROR:  relation "public.MaintenanceReportSemMes" does not exist at character 13
2026-03-02 10:26:36.555 UTC [1831] STATEMENT:  INSERT INTO "public"."MaintenanceReportSemMes" ("id","periodType","dateRangeStart","dateRangeEnd","csvFileName","metrics","notes","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING "public"."MaintenanceReportSemMes"."id", "public"."MaintenanceReportSemMes"."periodType", "public"."MaintenanceReportSemMes"."dateRangeStart", "public"."MaintenanceReportSemMes"."dateRangeEnd", "public"."MaintenanceReportSemMes"."csvFileName", "public"."MaintenanceReportSemMes"."metrics", "public"."MaintenanceReportSemMes"."notes", "public"."MaintenanceReportSemMes"."createdAt", "public"."MaintenanceReportSemMes"."updatedAt"
2026-03-02 10:42:46.215 UTC [64] LOG:  checkpoint starting: time
2026-03-02 10:42:49.430 UTC [64] LOG:  checkpoint complete: wrote 33 buffers (0.2%); 0 WAL file(s) added, 0 removed, 0 recycled; write=3.210 s, sync=0.003 s, total=3.216 s; sync files=35, longest=0.001 s, average=0.001 s; distance=145 kB, estimate=172 kB; lsn=0/19B8DE0, redo lsn=0/19B8D88
2026-03-02 10:47:46.520 UTC [64] LOG:  checkpoint starting: time
2026-03-02 10:47:47.729 UTC [64] LOG:  checkpoint complete: wrote 13 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.204 s, sync=0.002 s, total=1.209 s; sync files=9, longest=0.002 s, average=0.001 s; distance=6 kB, estimate=155 kB; lsn=0/19BA910, redo lsn=0/19BA8B8
2026-03-02 10:50:43.663 UTC [1908] LOG:  could not receive data from client: Connection reset by peer
2026-03-02 10:52:46.768 UTC [64] LOG:  checkpoint starting: time
2026-03-02 10:52:47.075 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.302 s, sync=0.002 s, total=0.307 s; sync files=4, longest=0.001 s, average=0.001 s; distance=6 kB, estimate=140 kB; lsn=0/19BC1D0, redo lsn=0/19BC178
2026-03-02 11:02:46.234 UTC [64] LOG:  checkpoint starting: time
2026-03-02 11:02:47.041 UTC [64] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.002 s, total=0.807 s; sync files=8, longest=0.001 s, average=0.001 s; distance=12 kB, estimate=127 kB; lsn=0/19BF350, redo lsn=0/19BF2F8
2026-03-02 11:17:46.333 UTC [64] LOG:  checkpoint starting: time
2026-03-02 11:17:47.240 UTC [64] LOG:  checkpoint complete: wrote 10 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.903 s, sync=0.002 s, total=0.907 s; sync files=8, longest=0.001 s, average=0.001 s; distance=12 kB, estimate=116 kB; lsn=0/19C26E8, redo lsn=0/19C2690
2026-03-02 11:23:07.910 UTC [2016] LOG:  could not receive data from client: Connection reset by peer
2026-03-02 12:32:47.358 UTC [64] LOG:  checkpoint starting: time
2026-03-02 12:32:53.083 UTC [64] LOG:  checkpoint complete: wrote 58 buffers (0.4%); 0 WAL file(s) added, 0 removed, 0 recycled; write=5.719 s, sync=0.004 s, total=5.726 s; sync files=59, longest=0.001 s, average=0.001 s; distance=232 kB, estimate=232 kB; lsn=0/19FC968, redo lsn=0/19FC910
2026-03-02 12:37:47.182 UTC [64] LOG:  checkpoint starting: time
2026-03-02 12:37:48.590 UTC [64] LOG:  checkpoint complete: wrote 15 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.405 s, sync=0.002 s, total=1.409 s; sync files=12, longest=0.001 s, average=0.001 s; distance=4 kB, estimate=209 kB; lsn=0/19FD9E0, redo lsn=0/19FD988
2026-03-02 13:37:48.625 UTC [64] LOG:  checkpoint starting: time
2026-03-02 13:37:49.231 UTC [64] LOG:  checkpoint complete: wrote 7 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.603 s, sync=0.002 s, total=0.607 s; sync files=7, longest=0.001 s, average=0.001 s; distance=5 kB, estimate=189 kB; lsn=0/19FF1B0, redo lsn=0/19FF158
2026-03-02 14:42:49.061 UTC [64] LOG:  checkpoint starting: time
2026-03-02 14:42:50.671 UTC [64] LOG:  checkpoint complete: wrote 17 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.605 s, sync=0.002 s, total=1.610 s; sync files=11, longest=0.001 s, average=0.001 s; distance=4 kB, estimate=170 kB; lsn=0/1A00408, redo lsn=0/1A003B0
2026-03-02 17:12:51.833 UTC [64] LOG:  checkpoint starting: time
2026-03-02 17:12:52.339 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.502 s, sync=0.001 s, total=0.506 s; sync files=6, longest=0.001 s, average=0.001 s; distance=3 kB, estimate=154 kB; lsn=0/1A013C8, redo lsn=0/1A01370
2026-03-02 20:57:54.330 UTC [64] LOG:  checkpoint starting: time
2026-03-02 20:57:56.540 UTC [64] LOG:  checkpoint complete: wrote 23 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=2.206 s, sync=0.002 s, total=2.211 s; sync files=20, longest=0.001 s, average=0.001 s; distance=17 kB, estimate=140 kB; lsn=0/1A05AD8, redo lsn=0/1A05A80
2026-03-03 08:13:04.346 UTC [64] LOG:  checkpoint starting: time
2026-03-03 08:13:04.651 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.302 s, sync=0.002 s, total=0.306 s; sync files=4, longest=0.001 s, average=0.001 s; distance=3 kB, estimate=126 kB; lsn=0/1A06718, redo lsn=0/1A066C0
2026-03-03 08:18:04.751 UTC [64] LOG:  checkpoint starting: time
2026-03-03 08:18:06.061 UTC [64] LOG:  checkpoint complete: wrote 14 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.304 s, sync=0.003 s, total=1.310 s; sync files=14, longest=0.001 s, average=0.001 s; distance=17 kB, estimate=115 kB; lsn=0/1A0ABE0, redo lsn=0/1A0AB88
2026-03-03 08:23:04.154 UTC [64] LOG:  checkpoint starting: time
2026-03-03 08:23:04.962 UTC [64] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.002 s, total=0.809 s; sync files=9, longest=0.001 s, average=0.001 s; distance=14 kB, estimate=105 kB; lsn=0/1A0E680, redo lsn=0/1A0E628
2026-03-03 11:03:07.336 UTC [64] LOG:  checkpoint starting: time
2026-03-03 11:03:07.741 UTC [64] LOG:  checkpoint complete: wrote 5 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.402 s, sync=0.002 s, total=0.406 s; sync files=5, longest=0.001 s, average=0.001 s; distance=5 kB, estimate=95 kB; lsn=0/1A0FB20, redo lsn=0/1A0FAC8
2026-03-03 12:11:58.562 UTC [6524] LOG:  could not receive data from client: Connection reset by peer
2026-03-03 12:13:08.980 UTC [64] LOG:  checkpoint starting: time
2026-03-03 12:13:09.185 UTC [64] LOG:  checkpoint complete: wrote 2 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.201 s, sync=0.001 s, total=0.205 s; sync files=2, longest=0.001 s, average=0.001 s; distance=4 kB, estimate=86 kB; lsn=0/1A10CC0, redo lsn=0/1A10C68
2026-03-03 12:25:50.101 UTC [6568] LOG:  could not receive data from client: Connection reset by peer
2026-03-03 13:12:10.577 UTC [6713] LOG:  could not receive data from client: Connection reset by peer
2026-03-03 14:03:09.877 UTC [64] LOG:  checkpoint starting: time
2026-03-03 14:03:11.286 UTC [64] LOG:  checkpoint complete: wrote 15 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.404 s, sync=0.002 s, total=1.409 s; sync files=15, longest=0.001 s, average=0.001 s; distance=17 kB, estimate=79 kB; lsn=0/1A15280, redo lsn=0/1A15228
2026-03-03 14:08:09.381 UTC [64] LOG:  checkpoint starting: time
2026-03-03 14:08:09.887 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.502 s, sync=0.002 s, total=0.506 s; sync files=6, longest=0.001 s, average=0.001 s; distance=9 kB, estimate=72 kB; lsn=0/1A17758, redo lsn=0/1A17700
2026-03-03 19:18:14.705 UTC [64] LOG:  checkpoint starting: time
2026-03-03 19:18:15.612 UTC [64] LOG:  checkpoint complete: wrote 10 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.903 s, sync=0.001 s, total=0.907 s; sync files=10, longest=0.001 s, average=0.001 s; distance=13 kB, estimate=66 kB; lsn=0/1A1AEB8, redo lsn=0/1A1AE60
2026-03-03 21:20:03.175 UTC [8192] LOG:  could not receive data from client: Connection reset by peer
2026-03-03 22:58:17.676 UTC [64] LOG:  checkpoint starting: time
2026-03-03 22:58:21.794 UTC [64] LOG:  checkpoint complete: wrote 42 buffers (0.3%); 0 WAL file(s) added, 0 removed, 0 recycled; write=4.112 s, sync=0.003 s, total=4.118 s; sync files=43, longest=0.001 s, average=0.001 s; distance=176 kB, estimate=176 kB; lsn=0/1A471D8, redo lsn=0/1A47180
2026-03-03 23:03:17.893 UTC [64] LOG:  checkpoint starting: time
2026-03-03 23:03:19.702 UTC [64] LOG:  checkpoint complete: wrote 19 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.805 s, sync=0.002 s, total=1.809 s; sync files=14, longest=0.001 s, average=0.001 s; distance=15 kB, estimate=160 kB; lsn=0/1A4B148, redo lsn=0/1A4B0F0
2026-03-03 23:08:17.800 UTC [64] LOG:  checkpoint starting: time
2026-03-03 23:08:18.907 UTC [64] LOG:  checkpoint complete: wrote 12 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.104 s, sync=0.002 s, total=1.108 s; sync files=12, longest=0.001 s, average=0.001 s; distance=23 kB, estimate=146 kB; lsn=0/1A51008, redo lsn=0/1A50FB0
2026-03-03 23:28:18.196 UTC [64] LOG:  checkpoint starting: time
2026-03-03 23:28:19.003 UTC [64] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.803 s, sync=0.002 s, total=0.807 s; sync files=9, longest=0.001 s, average=0.001 s; distance=13 kB, estimate=133 kB; lsn=0/1A54638, redo lsn=0/1A545E0
2026-03-03 23:33:18.102 UTC [64] LOG:  checkpoint starting: time
2026-03-03 23:33:19.714 UTC [64] LOG:  checkpoint complete: wrote 17 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.607 s, sync=0.001 s, total=1.612 s; sync files=17, longest=0.001 s, average=0.001 s; distance=33 kB, estimate=123 kB; lsn=0/1A5CB88, redo lsn=0/1A5CB30
2026-03-03 23:53:19.006 UTC [64] LOG:  checkpoint starting: time
2026-03-03 23:53:20.514 UTC [64] LOG:  checkpoint complete: wrote 16 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.505 s, sync=0.002 s, total=1.508 s; sync files=15, longest=0.002 s, average=0.001 s; distance=38 kB, estimate=115 kB; lsn=0/1A665E0, redo lsn=0/1A66588
2026-03-03 23:58:19.613 UTC [64] LOG:  checkpoint starting: time
2026-03-03 23:58:20.120 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.502 s, sync=0.002 s, total=0.507 s; sync files=6, longest=0.001 s, average=0.001 s; distance=11 kB, estimate=104 kB; lsn=0/1A692C0, redo lsn=0/1A69268
2026-03-04 00:08:19.314 UTC [64] LOG:  checkpoint starting: time
2026-03-04 00:08:21.526 UTC [64] LOG:  checkpoint complete: wrote 23 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=2.206 s, sync=0.003 s, total=2.212 s; sync files=22, longest=0.002 s, average=0.001 s; distance=60 kB, estimate=100 kB; lsn=0/1A783B8, redo lsn=0/1A78360
2026-03-04 08:34:12.426 UTC [10238] LOG:  could not receive data from client: Connection reset by peer
2026-03-04 09:21:55.109 UTC [10391] LOG:  could not receive data from client: Connection reset by peer
2026-03-04 09:33:28.229 UTC [64] LOG:  checkpoint starting: time
2026-03-04 09:33:28.736 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.502 s, sync=0.002 s, total=0.507 s; sync files=6, longest=0.001 s, average=0.001 s; distance=13 kB, estimate=91 kB; lsn=0/1A7B870, redo lsn=0/1A7B818
2026-03-04 15:43:34.461 UTC [64] LOG:  checkpoint starting: time
2026-03-04 15:43:34.967 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.502 s, sync=0.002 s, total=0.506 s; sync files=6, longest=0.001 s, average=0.001 s; distance=10 kB, estimate=83 kB; lsn=0/1A7E248, redo lsn=0/1A7E1F0
2026-03-04 19:58:39.128 UTC [64] LOG:  checkpoint starting: time
2026-03-04 19:58:40.035 UTC [64] LOG:  checkpoint complete: wrote 10 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.904 s, sync=0.001 s, total=0.907 s; sync files=10, longest=0.001 s, average=0.001 s; distance=17 kB, estimate=76 kB; lsn=0/1A82920, redo lsn=0/1A828C8
2026-03-04 20:13:39.303 UTC [64] LOG:  checkpoint starting: time
2026-03-04 20:13:40.512 UTC [64] LOG:  checkpoint complete: wrote 13 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.204 s, sync=0.002 s, total=1.209 s; sync files=12, longest=0.002 s, average=0.001 s; distance=27 kB, estimate=71 kB; lsn=0/1A896F8, redo lsn=0/1A896A0
2026-03-04 20:18:39.548 UTC [64] LOG:  checkpoint starting: time
2026-03-04 20:18:42.161 UTC [64] LOG:  checkpoint complete: wrote 27 buffers (0.2%); 0 WAL file(s) added, 0 removed, 0 recycled; write=2.609 s, sync=0.002 s, total=2.614 s; sync files=25, longest=0.001 s, average=0.001 s; distance=61 kB, estimate=70 kB; lsn=0/1A98D08, redo lsn=0/1A98C78
2026-03-04 20:23:39.235 UTC [64] LOG:  checkpoint starting: time
2026-03-04 20:23:40.143 UTC [64] LOG:  checkpoint complete: wrote 10 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.904 s, sync=0.002 s, total=0.908 s; sync files=9, longest=0.001 s, average=0.001 s; distance=12 kB, estimate=65 kB; lsn=0/1A9BFE0, redo lsn=0/1A9BF88
2026-03-04 20:43:39.391 UTC [64] LOG:  checkpoint starting: time
2026-03-04 20:43:41.400 UTC [64] LOG:  checkpoint complete: wrote 21 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=2.005 s, sync=0.002 s, total=2.010 s; sync files=20, longest=0.001 s, average=0.001 s; distance=47 kB, estimate=63 kB; lsn=0/1AA7BE8, redo lsn=0/1AA7B90
2026-03-04 21:03:39.661 UTC [64] LOG:  checkpoint starting: time
2026-03-04 21:03:40.168 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.502 s, sync=0.002 s, total=0.507 s; sync files=6, longest=0.002 s, average=0.001 s; distance=13 kB, estimate=58 kB; lsn=0/1AAB200, redo lsn=0/1AAB1A8
2026-03-04 21:08:39.253 UTC [64] LOG:  checkpoint starting: time
2026-03-04 21:08:40.160 UTC [64] LOG:  checkpoint complete: wrote 10 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.903 s, sync=0.002 s, total=0.907 s; sync files=10, longest=0.001 s, average=0.001 s; distance=25 kB, estimate=55 kB; lsn=0/1AB1760, redo lsn=0/1AB1708
2026-03-04 21:13:39.253 UTC [64] LOG:  checkpoint starting: time
2026-03-04 21:13:41.464 UTC [64] LOG:  checkpoint complete: wrote 23 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=2.206 s, sync=0.003 s, total=2.211 s; sync files=20, longest=0.002 s, average=0.001 s; distance=60 kB, estimate=60 kB; lsn=0/1AC08C8, redo lsn=0/1AC0838
2026-03-05 07:08:48.613 UTC [64] LOG:  checkpoint starting: time
2026-03-05 07:08:48.919 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.302 s, sync=0.002 s, total=0.306 s; sync files=4, longest=0.001 s, average=0.001 s; distance=7 kB, estimate=54 kB; lsn=0/1AC2528, redo lsn=0/1AC24D0
2026-03-06 06:14:09.581 UTC [64] LOG:  checkpoint starting: time
2026-03-06 06:14:11.390 UTC [64] LOG:  checkpoint complete: wrote 19 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.805 s, sync=0.003 s, total=1.810 s; sync files=16, longest=0.001 s, average=0.001 s; distance=46 kB, estimate=54 kB; lsn=0/1ACDFE8, redo lsn=0/1ACDF90
2026-03-06 15:04:17.554 UTC [64] LOG:  checkpoint starting: time
2026-03-06 15:04:17.861 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.302 s, sync=0.003 s, total=0.307 s; sync files=4, longest=0.002 s, average=0.001 s; distance=8 kB, estimate=49 kB; lsn=0/1AD01D0, redo lsn=0/1AD0178
2026-03-06 16:24:19.035 UTC [64] LOG:  checkpoint starting: time
2026-03-06 16:24:19.743 UTC [64] LOG:  checkpoint complete: wrote 8 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.703 s, sync=0.002 s, total=0.708 s; sync files=7, longest=0.001 s, average=0.001 s; distance=12 kB, estimate=45 kB; lsn=0/1AD3568, redo lsn=0/1AD3510
2026-03-06 22:29:25.349 UTC [64] LOG:  checkpoint starting: time
2026-03-06 22:29:25.955 UTC [64] LOG:  checkpoint complete: wrote 7 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.603 s, sync=0.001 s, total=0.607 s; sync files=7, longest=0.001 s, average=0.001 s; distance=16 kB, estimate=42 kB; lsn=0/1AD77C0, redo lsn=0/1AD7768
2026-03-09 08:40:18.428 UTC [64] LOG:  checkpoint starting: time
2026-03-09 08:40:19.038 UTC [64] LOG:  checkpoint complete: wrote 7 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.603 s, sync=0.001 s, total=0.610 s; sync files=7, longest=0.001 s, average=0.001 s; distance=6 kB, estimate=39 kB; lsn=0/1AD92B8, redo lsn=0/1AD9260
2026-03-09 09:05:18.363 UTC [64] LOG:  checkpoint starting: time
2026-03-09 09:05:18.668 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.302 s, sync=0.001 s, total=0.305 s; sync files=4, longest=0.001 s, average=0.001 s; distance=8 kB, estimate=36 kB; lsn=0/1ADB570, redo lsn=0/1ADB518
2026-03-10 08:15:40.675 UTC [64] LOG:  checkpoint starting: time
2026-03-10 08:15:41.080 UTC [64] LOG:  checkpoint complete: wrote 5 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.402 s, sync=0.001 s, total=0.405 s; sync files=5, longest=0.001 s, average=0.001 s; distance=2 kB, estimate=32 kB; lsn=0/1ADBF60, redo lsn=0/1ADBF08
2026-03-10 11:05:42.701 UTC [64] LOG:  checkpoint starting: time
2026-03-10 11:05:44.010 UTC [64] LOG:  checkpoint complete: wrote 14 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.304 s, sync=0.003 s, total=1.309 s; sync files=13, longest=0.002 s, average=0.001 s; distance=21 kB, estimate=31 kB; lsn=0/1AE16A0, redo lsn=0/1AE1648
2026-03-11 07:36:01.059 UTC [64] LOG:  checkpoint starting: time
2026-03-11 07:36:01.368 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.304 s, sync=0.001 s, total=0.309 s; sync files=4, longest=0.001 s, average=0.001 s; distance=4 kB, estimate=29 kB; lsn=0/1AE2700, redo lsn=0/1AE26A8
2026-03-12 10:21:24.712 UTC [64] LOG:  checkpoint starting: time
2026-03-12 10:21:25.017 UTC [64] LOG:  checkpoint complete: wrote 4 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.302 s, sync=0.002 s, total=0.306 s; sync files=4, longest=0.002 s, average=0.001 s; distance=5 kB, estimate=26 kB; lsn=0/1AE3C98, redo lsn=0/1AE3C40
2026-03-12 19:21:32.118 UTC [64] LOG:  checkpoint starting: time
2026-03-12 19:21:33.826 UTC [64] LOG:  checkpoint complete: wrote 18 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=1.705 s, sync=0.002 s, total=1.709 s; sync files=16, longest=0.001 s, average=0.001 s; distance=44 kB, estimate=44 kB; lsn=0/1AEEF50, redo lsn=0/1AEEEF8
2026-03-12 19:26:32.923 UTC [64] LOG:  checkpoint starting: time
2026-03-12 19:26:33.429 UTC [64] LOG:  checkpoint complete: wrote 6 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.502 s, sync=0.002 s, total=0.506 s; sync files=6, longest=0.001 s, average=0.001 s; distance=13 kB, estimate=41 kB; lsn=0/1AF2360, redo lsn=0/1AF2308
2026-03-13 11:16:46.820 UTC [64] LOG:  checkpoint starting: time
2026-03-13 11:16:47.728 UTC [64] LOG:  checkpoint complete: wrote 10 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.904 s, sync=0.002 s, total=0.908 s; sync files=10, longest=0.002 s, average=0.001 s; distance=21 kB, estimate=39 kB; lsn=0/1AF7990, redo lsn=0/1AF7938
2026-03-15 09:44:50.110 UTC [58001] ERROR:  extension "vector" is not available
2026-03-15 09:44:50.110 UTC [58001] DETAIL:  Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
2026-03-15 09:44:50.110 UTC [58001] HINT:  The extension must first be installed on the system where PostgreSQL is running.
2026-03-15 09:44:50.110 UTC [58001] STATEMENT:  CREATE EXTENSION IF NOT EXISTS vector;

        ALTER TABLE "AurisLMSpace"
        ADD COLUMN "userId" TEXT;

        UPDATE "AurisLMSpace"
        SET "userId" = 'legacy-local'
        WHERE "userId" IS NULL;

        ALTER TABLE "AurisLMSpace"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "checksum" TEXT;

        UPDATE "AurisLMDocument" d
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE d."spaceId" = s."id" AND d."userId" IS NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "status" SET DEFAULT 'queued';

        ALTER TABLE "AurisLMChunk"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "modality" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourceKind" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourcePage" INTEGER,
        ADD COLUMN "embedding" vector(1536);

        UPDATE "AurisLMChunk" c
        SET "userId" = d."userId"
        FROM "AurisLMDocument" d
        WHERE c."documentId" = d."id" AND c."userId" IS NULL;

        ALTER TABLE "AurisLMChunk"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMChatMessage"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "grounded" BOOLEAN;

        UPDATE "AurisLMChatMessage" m
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE m."spaceId" = s."id" AND m."userId" IS NULL;

        ALTER TABLE "AurisLMChatMessage"
        ALTER COLUMN "userId" SET NOT NULL;

        CREATE INDEX "AurisLMSpace_userId_updatedAt_idx" ON "AurisLMSpace"("userId", "updatedAt");
        CREATE INDEX "AurisLMDocument_userId_spaceId_idx" ON "AurisLMDocument"("userId", "spaceId");
        CREATE INDEX "AurisLMChunk_userId_spaceId_idx" ON "AurisLMChunk"("userId", "spaceId");
        CREATE INDEX "AurisLMChatMessage_userId_spaceId_createdAt_idx" ON "AurisLMChatMessage"("userId", "spaceId", "createdAt");

        CREATE INDEX "AurisLMChunk_embedding_hnsw_idx"
        ON "AurisLMChunk" USING hnsw ("embedding" vector_cosine_ops)
        WHERE "embedding" IS NOT NULL;

2026-03-15 09:47:28.311 UTC [64] LOG:  checkpoint starting: time
2026-03-15 09:47:28.516 UTC [64] LOG:  checkpoint complete: wrote 3 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.201 s, sync=0.001 s, total=0.205 s; sync files=3, longest=0.001 s, average=0.001 s; distance=4 kB, estimate=36 kB; lsn=0/1AF8D50, redo lsn=0/1AF8CF8
2026-03-15 10:08:22.052 UTC [58073] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:25:31.948 UTC [59748] ERROR:  column AurisLMSpace.userId does not exist at character 38
2026-03-15 19:25:31.948 UTC [59748] STATEMENT:  SELECT "public"."AurisLMSpace"."id", "public"."AurisLMSpace"."userId", "public"."AurisLMSpace"."name", "public"."AurisLMSpace"."description", "public"."AurisLMSpace"."createdAt", "public"."AurisLMSpace"."updatedAt", COALESCE("aggr_selection_0_AurisLMDocument"."_aggr_count_documents", 0) AS "_aggr_count_documents" FROM "public"."AurisLMSpace" LEFT JOIN (SELECT "public"."AurisLMDocument"."spaceId", COUNT(*) AS "_aggr_count_documents" FROM "public"."AurisLMDocument" WHERE 1=1 GROUP BY "public"."AurisLMDocument"."spaceId") AS "aggr_selection_0_AurisLMDocument" ON ("public"."AurisLMSpace"."id" = "aggr_selection_0_AurisLMDocument"."spaceId") WHERE "public"."AurisLMSpace"."userId" = $1 ORDER BY "public"."AurisLMSpace"."updatedAt" DESC OFFSET $2
2026-03-15 19:42:46.410 UTC [59800] ERROR:  column "userId" of relation "AurisLMSpace" does not exist at character 43
2026-03-15 19:42:46.410 UTC [59800] STATEMENT:  INSERT INTO "public"."AurisLMSpace" ("id","userId","name","description","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6) RETURNING "public"."AurisLMSpace"."id"
2026-03-15 19:42:53.930 UTC [59800] ERROR:  column AurisLMSpace.userId does not exist at character 38
2026-03-15 19:42:53.930 UTC [59800] STATEMENT:  SELECT "public"."AurisLMSpace"."id", "public"."AurisLMSpace"."userId", "public"."AurisLMSpace"."name", "public"."AurisLMSpace"."description", "public"."AurisLMSpace"."createdAt", "public"."AurisLMSpace"."updatedAt", COALESCE("aggr_selection_0_AurisLMDocument"."_aggr_count_documents", 0) AS "_aggr_count_documents" FROM "public"."AurisLMSpace" LEFT JOIN (SELECT "public"."AurisLMDocument"."spaceId", COUNT(*) AS "_aggr_count_documents" FROM "public"."AurisLMDocument" WHERE 1=1 GROUP BY "public"."AurisLMDocument"."spaceId") AS "aggr_selection_0_AurisLMDocument" ON ("public"."AurisLMSpace"."id" = "aggr_selection_0_AurisLMDocument"."spaceId") WHERE "public"."AurisLMSpace"."userId" = $1 ORDER BY "public"."AurisLMSpace"."updatedAt" DESC OFFSET $2
2026-03-15 19:42:54.082 UTC [59800] ERROR:  column AurisLMSpace.userId does not exist at character 38
2026-03-15 19:42:54.082 UTC [59800] STATEMENT:  SELECT "public"."AurisLMSpace"."id", "public"."AurisLMSpace"."userId", "public"."AurisLMSpace"."name", "public"."AurisLMSpace"."description", "public"."AurisLMSpace"."createdAt", "public"."AurisLMSpace"."updatedAt", COALESCE("aggr_selection_0_AurisLMDocument"."_aggr_count_documents", 0) AS "_aggr_count_documents" FROM "public"."AurisLMSpace" LEFT JOIN (SELECT "public"."AurisLMDocument"."spaceId", COUNT(*) AS "_aggr_count_documents" FROM "public"."AurisLMDocument" WHERE 1=1 GROUP BY "public"."AurisLMDocument"."spaceId") AS "aggr_selection_0_AurisLMDocument" ON ("public"."AurisLMSpace"."id" = "aggr_selection_0_AurisLMDocument"."spaceId") WHERE "public"."AurisLMSpace"."userId" = $1 ORDER BY "public"."AurisLMSpace"."updatedAt" DESC OFFSET $2
2026-03-15 19:42:58.335 UTC [59800] ERROR:  column "userId" of relation "AurisLMSpace" does not exist at character 43
2026-03-15 19:42:58.335 UTC [59800] STATEMENT:  INSERT INTO "public"."AurisLMSpace" ("id","userId","name","description","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6) RETURNING "public"."AurisLMSpace"."id"
2026-03-15 19:43:20.076 UTC [59800] ERROR:  column "userId" of relation "AurisLMSpace" does not exist at character 43
2026-03-15 19:43:20.076 UTC [59800] STATEMENT:  INSERT INTO "public"."AurisLMSpace" ("id","userId","name","description","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6) RETURNING "public"."AurisLMSpace"."id"
2026-03-15 19:47:37.693 UTC [64] LOG:  checkpoint starting: time
2026-03-15 19:47:38.503 UTC [64] LOG:  checkpoint complete: wrote 9 buffers (0.1%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.804 s, sync=0.002 s, total=0.810 s; sync files=9, longest=0.001 s, average=0.001 s; distance=11 kB, estimate=33 kB; lsn=0/1AFBB60, redo lsn=0/1AFBB08
2026-03-15 19:50:04.081 UTC [59824] ERROR:  column AurisLMSpace.userId does not exist at character 38
2026-03-15 19:50:04.081 UTC [59824] STATEMENT:  SELECT "public"."AurisLMSpace"."id", "public"."AurisLMSpace"."userId", "public"."AurisLMSpace"."name", "public"."AurisLMSpace"."description", "public"."AurisLMSpace"."createdAt", "public"."AurisLMSpace"."updatedAt", COALESCE("aggr_selection_0_AurisLMDocument"."_aggr_count_documents", 0) AS "_aggr_count_documents" FROM "public"."AurisLMSpace" LEFT JOIN (SELECT "public"."AurisLMDocument"."spaceId", COUNT(*) AS "_aggr_count_documents" FROM "public"."AurisLMDocument" WHERE 1=1 GROUP BY "public"."AurisLMDocument"."spaceId") AS "aggr_selection_0_AurisLMDocument" ON ("public"."AurisLMSpace"."id" = "aggr_selection_0_AurisLMDocument"."spaceId") WHERE "public"."AurisLMSpace"."userId" = $1 ORDER BY "public"."AurisLMSpace"."updatedAt" DESC OFFSET $2
2026-03-15 19:50:12.102 UTC [59824] ERROR:  column AurisLMSpace.userId does not exist at character 38
2026-03-15 19:50:12.102 UTC [59824] STATEMENT:  SELECT "public"."AurisLMSpace"."id", "public"."AurisLMSpace"."userId", "public"."AurisLMSpace"."name", "public"."AurisLMSpace"."description", "public"."AurisLMSpace"."createdAt", "public"."AurisLMSpace"."updatedAt", COALESCE("aggr_selection_0_AurisLMDocument"."_aggr_count_documents", 0) AS "_aggr_count_documents" FROM "public"."AurisLMSpace" LEFT JOIN (SELECT "public"."AurisLMDocument"."spaceId", COUNT(*) AS "_aggr_count_documents" FROM "public"."AurisLMDocument" WHERE 1=1 GROUP BY "public"."AurisLMDocument"."spaceId") AS "aggr_selection_0_AurisLMDocument" ON ("public"."AurisLMSpace"."id" = "aggr_selection_0_AurisLMDocument"."spaceId") WHERE "public"."AurisLMSpace"."userId" = $1 ORDER BY "public"."AurisLMSpace"."updatedAt" DESC OFFSET $2
2026-03-15 19:51:01.698 UTC [59834] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:51:47.917 UTC [59850] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:52:46.989 UTC [59871] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:54:06.266 UTC [59897] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:54:12.995 UTC [59900] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:54:33.775 UTC [59907] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:54:37.048 UTC [59912] ERROR:  extension "vector" is not available
2026-03-15 19:54:37.048 UTC [59912] DETAIL:  Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
2026-03-15 19:54:37.048 UTC [59912] HINT:  The extension must first be installed on the system where PostgreSQL is running.
2026-03-15 19:54:37.048 UTC [59912] STATEMENT:  CREATE EXTENSION IF NOT EXISTS vector;

        ALTER TABLE "AurisLMSpace"
        ADD COLUMN "userId" TEXT;

        UPDATE "AurisLMSpace"
        SET "userId" = 'legacy-local'
        WHERE "userId" IS NULL;

        ALTER TABLE "AurisLMSpace"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "checksum" TEXT;

        UPDATE "AurisLMDocument" d
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE d."spaceId" = s."id" AND d."userId" IS NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "status" SET DEFAULT 'queued';

        ALTER TABLE "AurisLMChunk"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "modality" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourceKind" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourcePage" INTEGER,
        ADD COLUMN "embedding" vector(1536);

        UPDATE "AurisLMChunk" c
        SET "userId" = d."userId"
        FROM "AurisLMDocument" d
        WHERE c."documentId" = d."id" AND c."userId" IS NULL;

        ALTER TABLE "AurisLMChunk"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMChatMessage"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "grounded" BOOLEAN;

        UPDATE "AurisLMChatMessage" m
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE m."spaceId" = s."id" AND m."userId" IS NULL;

        ALTER TABLE "AurisLMChatMessage"
        ALTER COLUMN "userId" SET NOT NULL;

        CREATE INDEX "AurisLMSpace_userId_updatedAt_idx" ON "AurisLMSpace"("userId", "updatedAt");
        CREATE INDEX "AurisLMDocument_userId_spaceId_idx" ON "AurisLMDocument"("userId", "spaceId");
        CREATE INDEX "AurisLMChunk_userId_spaceId_idx" ON "AurisLMChunk"("userId", "spaceId");
        CREATE INDEX "AurisLMChatMessage_userId_spaceId_createdAt_idx" ON "AurisLMChatMessage"("userId", "spaceId", "createdAt");

        CREATE INDEX "AurisLMChunk_embedding_hnsw_idx"
        ON "AurisLMChunk" USING hnsw ("embedding" vector_cosine_ops)
        WHERE "embedding" IS NOT NULL;

2026-03-15 19:54:44.560 UTC [59916] ERROR:  extension "vector" is not available
2026-03-15 19:54:44.560 UTC [59916] DETAIL:  Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
2026-03-15 19:54:44.560 UTC [59916] HINT:  The extension must first be installed on the system where PostgreSQL is running.
2026-03-15 19:54:44.560 UTC [59916] STATEMENT:  CREATE EXTENSION IF NOT EXISTS vector;

        ALTER TABLE "AurisLMSpace"
        ADD COLUMN "userId" TEXT;

        UPDATE "AurisLMSpace"
        SET "userId" = 'legacy-local'
        WHERE "userId" IS NULL;

        ALTER TABLE "AurisLMSpace"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "checksum" TEXT;

        UPDATE "AurisLMDocument" d
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE d."spaceId" = s."id" AND d."userId" IS NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "status" SET DEFAULT 'queued';

        ALTER TABLE "AurisLMChunk"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "modality" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourceKind" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourcePage" INTEGER,
        ADD COLUMN "embedding" vector(1536);

        UPDATE "AurisLMChunk" c
        SET "userId" = d."userId"
        FROM "AurisLMDocument" d
        WHERE c."documentId" = d."id" AND c."userId" IS NULL;

        ALTER TABLE "AurisLMChunk"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMChatMessage"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "grounded" BOOLEAN;

        UPDATE "AurisLMChatMessage" m
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE m."spaceId" = s."id" AND m."userId" IS NULL;

        ALTER TABLE "AurisLMChatMessage"
        ALTER COLUMN "userId" SET NOT NULL;

        CREATE INDEX "AurisLMSpace_userId_updatedAt_idx" ON "AurisLMSpace"("userId", "updatedAt");
        CREATE INDEX "AurisLMDocument_userId_spaceId_idx" ON "AurisLMDocument"("userId", "spaceId");
        CREATE INDEX "AurisLMChunk_userId_spaceId_idx" ON "AurisLMChunk"("userId", "spaceId");
        CREATE INDEX "AurisLMChatMessage_userId_spaceId_createdAt_idx" ON "AurisLMChatMessage"("userId", "spaceId", "createdAt");

        CREATE INDEX "AurisLMChunk_embedding_hnsw_idx"
        ON "AurisLMChunk" USING hnsw ("embedding" vector_cosine_ops)
        WHERE "embedding" IS NOT NULL;

2026-03-15 19:54:51.588 UTC [59919] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:54:52.295 UTC [59920] LOG:  could not receive data from client: Connection reset by peer
2026-03-15 19:54:52.346 UTC [59921] ERROR:  extension "vector" is not available
2026-03-15 19:54:52.346 UTC [59921] DETAIL:  Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
2026-03-15 19:54:52.346 UTC [59921] HINT:  The extension must first be installed on the system where PostgreSQL is running.
2026-03-15 19:54:52.346 UTC [59921] STATEMENT:  CREATE EXTENSION IF NOT EXISTS vector;

        ALTER TABLE "AurisLMSpace"
        ADD COLUMN "userId" TEXT;

        UPDATE "AurisLMSpace"
        SET "userId" = 'legacy-local'
        WHERE "userId" IS NULL;

        ALTER TABLE "AurisLMSpace"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "checksum" TEXT;

        UPDATE "AurisLMDocument" d
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE d."spaceId" = s."id" AND d."userId" IS NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMDocument"
        ALTER COLUMN "status" SET DEFAULT 'queued';

        ALTER TABLE "AurisLMChunk"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "modality" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourceKind" TEXT NOT NULL DEFAULT 'text',
        ADD COLUMN "sourcePage" INTEGER,
        ADD COLUMN "embedding" vector(1536);

        UPDATE "AurisLMChunk" c
        SET "userId" = d."userId"
        FROM "AurisLMDocument" d
        WHERE c."documentId" = d."id" AND c."userId" IS NULL;

        ALTER TABLE "AurisLMChunk"
        ALTER COLUMN "userId" SET NOT NULL;

        ALTER TABLE "AurisLMChatMessage"
        ADD COLUMN "userId" TEXT,
        ADD COLUMN "grounded" BOOLEAN;

        UPDATE "AurisLMChatMessage" m
        SET "userId" = s."userId"
        FROM "AurisLMSpace" s
        WHERE m."spaceId" = s."id" AND m."userId" IS NULL;

        ALTER TABLE "AurisLMChatMessage"
        ALTER COLUMN "userId" SET NOT NULL;

        CREATE INDEX "AurisLMSpace_userId_updatedAt_idx" ON "AurisLMSpace"("userId", "updatedAt");
        CREATE INDEX "AurisLMDocument_userId_spaceId_idx" ON "AurisLMDocument"("userId", "spaceId");
        CREATE INDEX "AurisLMChunk_userId_spaceId_idx" ON "AurisLMChunk"("userId", "spaceId");
        CREATE INDEX "AurisLMChatMessage_userId_spaceId_createdAt_idx" ON "AurisLMChatMessage"("userId", "spaceId", "createdAt");

        CREATE INDEX "AurisLMChunk_embedding_hnsw_idx"
        ON "AurisLMChunk" USING hnsw ("embedding" vector_cosine_ops)
        WHERE "embedding" IS NOT NULL;

2026-03-15 19:55:00.228 UTC [59925] ERROR:  extension "vector" is not available
2026-03-15 19:55:00.228 UTC [59925] DETAIL:  Could not open extension control file "/usr/share/postgresql/17/extension/vector.control": No such file or directory.
2026-03-15 19:55:00.228 UTC [59925] HINT:  The extension must first be installed on the system where PostgreSQL is running.
2026-03-15 19:55:00.228 UTC [59925] STATEMENT:  CREATE EXTENSION IF NOT EXISTS vector;