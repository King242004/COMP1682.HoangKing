import type { PoolClient } from 'pg';

import database from './database';

// Runs several queries as one transaction: either all of them are saved, or none.
// Every query inside must use the given client (a transaction lives on one connection).
export default async function withTransaction<Result>(work: (client: PoolClient) => Promise<Result>): Promise<Result> {
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
