import algosdk from 'algosdk'
import { algorandFixture, AlgorandFixture } from '@algorandfoundation/algokit-utils/testing'

/**
 * Extended test fixture that includes test assets and configuration
 */
export interface ExodTestFixture extends AlgorandFixture {
  testAssets: TestAssets
  testConfig: TestConfig
}

export interface TestAssets {
  exodAssetId: number
  stablecoinAssetId: number
  exodCreator: algosdk.Account
  stablecoinCreator: algosdk.Account
}

export interface TestConfig {
  collateralizationRatio: number // e.g., 15000 = 150%
  liquidationThreshold: number // e.g., 12000 = 120%
  exodPrice: number // Price in stablecoin (scaled by 1e6)
}

/**
 * Get or create the base Algorand test fixture
 * This sets up a LocalNet instance for testing
 */
export async function getAlgorandFixture(): Promise<AlgorandFixture> {
  return await algorandFixture()
}

/**
 * Default test configuration
 */
export const DEFAULT_TEST_CONFIG: TestConfig = {
  collateralizationRatio: 15000, // 150%
  liquidationThreshold: 12000, // 120%
  exodPrice: 10_000_000, // $10 per EXOD (scaled by 1e6)
}

/**
 * Helper to generate a funded test account
 */
export async function generateFundedAccount(
  fixture: AlgorandFixture,
  initialFunds: number = 10_000_000 // 10 ALGO
): Promise<algosdk.Account> {
  const account = algosdk.generateAccount()

  // Fund the account from the fixture's genesis account
  await fixture.algorand.send.payment({
    sender: fixture.context.testAccount.addr,
    receiver: account.addr,
    amount: algosdk.algosToMicroalgos(initialFunds / 1_000_000),
  })

  return account
}

/**
 * Helper to wait for transaction confirmation
 */
export async function waitForConfirmation(
  fixture: AlgorandFixture,
  txId: string
): Promise<algosdk.modelsv2.PendingTransactionResponse> {
  const algodClient = fixture.context.algod
  return await algosdk.waitForConfirmation(algodClient, txId, 4)
}

/**
 * Calculate collateral value in stablecoin
 */
export function calculateCollateralValue(
  collateralAmount: number,
  exodPrice: number
): number {
  return Math.floor((collateralAmount * exodPrice) / 1_000_000)
}

/**
 * Calculate required collateral for a borrow amount
 */
export function calculateRequiredCollateral(
  borrowAmount: number,
  collateralizationRatio: number,
  exodPrice: number
): number {
  const requiredValue = Math.floor((borrowAmount * collateralizationRatio) / 10_000)
  return Math.ceil((requiredValue * 1_000_000) / exodPrice)
}

/**
 * Check if a loan is underwater (should be liquidated)
 */
export function isLoanUnderwater(
  collateralAmount: number,
  borrowedAmount: number,
  exodPrice: number,
  liquidationThreshold: number
): boolean {
  const collateralValue = calculateCollateralValue(collateralAmount, exodPrice)
  const thresholdValue = Math.floor((borrowedAmount * liquidationThreshold) / 10_000)
  return collateralValue < thresholdValue
}
