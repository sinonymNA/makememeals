import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL not set — database calls will fail');
}

const sql = postgres(process.env.DATABASE_URL || '', {
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql;
