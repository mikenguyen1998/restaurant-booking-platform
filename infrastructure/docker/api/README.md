# docker/api

Reserved for the container image definition (`Dockerfile`) of `apps/api`, used for
Node.js-compatible hosting.

Not created yet. Points to decide when writing it:

- build context: the repository root (the API depends on workspace packages)
- producing a pruned deployment (`turbo prune` / `pnpm deploy`)
- running `prisma generate` during the image build
- runtime env vars (see the root `.env.example`)

The API is not part of `docker-compose.yml`; during development it runs on the
host via `pnpm dev`.
