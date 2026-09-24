# storage

Placeholder for object storage integration (e.g. restaurant images, user uploads).

Status: **not implemented**. No provider has been chosen and no local storage
service runs in `docker-compose.yml`.

The API is expected to talk to an S3-compatible endpoint configured through the
`OBJECT_STORAGE_*` variables in the root `.env.example`. When local development
needs it, add an S3-compatible service to `docker-compose.yml` and document its
setup (buckets, CORS, credentials) here.
