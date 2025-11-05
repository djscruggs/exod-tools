import { eq, desc } from 'drizzle-orm'
import { db, loanPositions, walletConnections, transactions, type NewLoanPosition, type NewTransaction } from './index'

// Loan Position Queries
export function getLoanPosition(address: string) {
  return db.select().from(loanPositions).where(eq(loanPositions.address, address)).get()
}

export function getAllLoanPositions() {
  return db.select().from(loanPositions).all()
}

export function getLiquidatablePositions() {
  return db.select().from(loanPositions).where(eq(loanPositions.isLiquidatable, true)).all()
}

export function upsertLoanPosition(position: NewLoanPosition) {
  const existing = getLoanPosition(position.address)

  if (existing) {
    return db
      .update(loanPositions)
      .set({
        ...position,
        lastUpdateTime: new Date(),
      })
      .where(eq(loanPositions.address, position.address))
      .run()
  } else {
    return db.insert(loanPositions).values(position).run()
  }
}

export function deleteLoanPosition(address: string) {
  return db.delete(loanPositions).where(eq(loanPositions.address, address)).run()
}

// Wallet Connection Queries
export function trackWalletConnection(address: string) {
  const existing = db.select().from(walletConnections).where(eq(walletConnections.address, address)).get()

  if (existing) {
    return db
      .update(walletConnections)
      .set({ lastSeen: new Date() })
      .where(eq(walletConnections.address, address))
      .run()
  } else {
    return db.insert(walletConnections).values({ address }).run()
  }
}

// Transaction History Queries
export function addTransaction(transaction: NewTransaction) {
  return db.insert(transactions).values(transaction).run()
}

export function getTransactionHistory(address: string, limit = 10) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.address, address))
    .orderBy(desc(transactions.timestamp))
    .limit(limit)
    .all()
}

export function getAllTransactions(limit = 50) {
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.timestamp))
    .limit(limit)
    .all()
}

// Helper function to calculate health factor
export function calculateHealthFactor(collateral: number, borrowed: number, collateralRatio = 150): string {
  if (borrowed === 0) return 'Infinity'
  const healthFactor = (collateral * 100) / (borrowed * collateralRatio)
  return healthFactor.toFixed(2)
}

// Seed some sample data for testing
export function seedSampleData() {
  const sampleAddresses = [
    'ADDR7XNKJ4HQWVXMVNPNJ3KFQWLQOMQVXJ4HQWVXMVNPNJ3KFQWLQOM',
    'ADDRTEST2HQWVXMVNPNJ3KFQWLQOMQVXJ4HQWVXMVNPNJ3KFQWLQ',
    'ADDRTEST3HQWVXMVNPNJ3KFQWLQOMQVXJ4HQWVXMVNPNJ3KFQWLQ',
  ]

  sampleAddresses.forEach((address, index) => {
    const collateral = (index + 1) * 100
    const borrowed = (index + 1) * 50
    const healthFactor = calculateHealthFactor(collateral, borrowed)

    upsertLoanPosition({
      address,
      collateralAmount: collateral,
      borrowedAmount: borrowed,
      healthFactor,
      isLiquidatable: parseFloat(healthFactor) < 1.0,
    })
  })

  console.log('Sample data seeded!')
}
