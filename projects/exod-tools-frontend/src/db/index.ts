import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// Create SQLite database connection
const sqlite = new Database('exod-vault.db')
sqlite.pragma('journal_mode = WAL')

// Create Drizzle ORM instance
export const db = drizzle(sqlite, { schema })

// Export schema for easy access
export * from './schema'
