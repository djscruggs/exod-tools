import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Loan positions table - mirrors the on-chain Box storage structure
export const loanPositions = sqliteTable('loan_positions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  address: text('address').notNull().unique(),
  collateralAmount: integer('collateral_amount').notNull().default(0),
  borrowedAmount: integer('borrowed_amount').notNull().default(0),
  lastUpdateTime: integer('last_update_time', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  healthFactor: text('health_factor').default('Infinity'),
  isLiquidatable: integer('is_liquidatable', { mode: 'boolean' }).notNull().default(false),
})

// User wallet connections - for tracking connected wallets
export const walletConnections = sqliteTable('wallet_connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  address: text('address').notNull().unique(),
  connectedAt: integer('connected_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastSeen: integer('last_seen', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})

// Transaction history - for UI display
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  address: text('address').notNull(),
  type: text('type').notNull(), // deposit, borrow, repay, withdraw, liquidate
  amount: integer('amount').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  txHash: text('tx_hash'),
})

export type LoanPosition = typeof loanPositions.$inferSelect
export type NewLoanPosition = typeof loanPositions.$inferInsert
export type WalletConnection = typeof walletConnections.$inferSelect
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
