# infrastructure

Container and infrastructure configuration. Local development only for now;
no production or cloud-specific resources exist yet.

| Path               | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `docker/postgres/` | PostgreSQL configuration and init scripts        |
| `docker/redis/`    | Redis configuration                              |
| `docker/api/`      | Container image definition for `apps/api`        |
| `storage/`         | Object storage integration notes and local setup |

The local services themselves are defined in the root `docker-compose.yml`.
