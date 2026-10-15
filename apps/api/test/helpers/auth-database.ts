import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

/** Isolate the library's destructive contract fixtures per suite/process. */
export function authTestDatabase(url: string) {
  const parsed = new URL(url);
  if (!parsed.pathname.endsWith('_test')) {
    throw new Error(
      'Auth contracts require a disposable database ending in _test.',
    );
  }
  const schema = `auth_test_${randomUUID().replaceAll('-', '')}`;
  parsed.searchParams.set('options', `-csearch_path=${schema},public`);
  const tables = [
    'Session',
    'RefreshToken',
    'EmailToken',
    'MfaAuthenticator',
    'MfaRecoveryCode',
    'MfaFailure',
  ];
  async function connect<T>(
    action: (client: Client) => Promise<T>,
  ): Promise<T> {
    const client = new Client({
      connectionString: url,
      connectionTimeoutMillis: 3000,
    });
    await client.connect();
    try {
      return await action(client);
    } finally {
      await client.end();
    }
  }
  return {
    schema,
    url: parsed.href,
    async create() {
      // Production migrations must already have created public tables. LIKE copies
      // their columns/defaults/checks/indexes; these six tables have no foreign keys.
      // Fail if that changes rather than silently testing a weaker schema.
      await connect(async (client) => {
        const { rowCount } = await client.query(
          `SELECT 1 FROM pg_constraint WHERE contype = 'f' AND conrelid IN
           (SELECT oid FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relname = ANY($1))`,
          [tables],
        );
        if (rowCount)
          throw new Error(
            'Auth table foreign keys changed; update isolated test fixtures.',
          );
        await client.query('BEGIN');
        try {
          await client.query(`CREATE SCHEMA "${schema}"`);
          for (const table of tables) {
            await client.query(
              `CREATE TABLE "${schema}"."${table}" (LIKE public."${table}" INCLUDING ALL)`,
            );
          }
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      });
    },
    async drop() {
      await connect(async (client) => {
        await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      });
    },
  };
}
