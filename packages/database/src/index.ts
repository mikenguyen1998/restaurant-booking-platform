// Public entry point of the database package.
//
// Re-exports the Prisma client generated from prisma/schema.prisma.
// Client instantiation (driver adapter, connection lifecycle) is deliberately left to be
// designed during development.
export * from './generated/prisma/client.js';
