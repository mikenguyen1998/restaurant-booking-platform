# docker/postgres

Configuration for the local PostgreSQL container (`postgres` service in the root
`docker-compose.yml`, image `postgres:18-alpine`).

Currently the container runs with image defaults. Add files here when needed, e.g.:

- init SQL scripts (mount into `/docker-entrypoint-initdb.d`)
- a custom `postgresql.conf`

Schema changes do not belong here. They go through Prisma migrations in
`packages/database`.
