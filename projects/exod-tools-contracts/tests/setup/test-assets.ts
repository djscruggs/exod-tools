import algosdk from 'algosdk'
import { AlgorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { TestAssets, waitForConfirmation, generateFundedAccount } from './test-fixtures'

/**
 * Create a mock EXOD asset on LocalNet with freeze and clawback capabilities
 * This allows us to test compliance features without owning real EXOD tokens
 */
export async function createMockExodAsset(
  fixture: AlgorandFixture,
  totalSupply: number = 1_000_000_000_000 // 1 million EXOD with 6 decimals
): Promise<{ assetId: number; creator: algosdk.Account }> {
  // Create a dedicated account for the EXOD asset
  const creator = await generateFundedAccount(fixture, 10_000_000)

  const algodClient = fixture.context.algod
  const suggestedParams = await algodClient.getTransactionParams().do()

  // Create asset with freeze and clawback addresses (for compliance testing)
  const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    suggestedParams,
    defaultFrozen: false,
    unitName: 'EXOD',
    assetName: 'EXOD Test Asset',
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr, // CRITICAL: Allows us to freeze accounts for compliance testing
    clawback: creator.addr,
    total: totalSupply,
    decimals: 6,
  })

  const signedTxn = assetCreateTxn.signTxn(creator.sk)
  const txId = await algodClient.sendRawTransaction(signedTxn).do()
  const result = await waitForConfirmation(fixture, txId.txId)

  const assetId = result.assetIndex!

  return { assetId, creator }
}

/**
 * Create a mock stablecoin asset (like USDCa) on LocalNet
 */
export async function createMockStablecoinAsset(
  fixture: AlgorandFixture,
  totalSupply: number = 10_000_000_000_000 // 10 million stablecoin with 6 decimals
): Promise<{ assetId: number; creator: algosdk.Account }> {
  // Create a dedicated account for the stablecoin asset
  const creator = await generateFundedAccount(fixture, 10_000_000)

  const algodClient = fixture.context.algod
  const suggestedParams = await algodClient.getTransactionParams().do()

  // Create stablecoin asset
  const assetCreateTxn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    suggestedParams,
    defaultFrozen: false,
    unitName: 'USDC',
    assetName: 'Test Stablecoin',
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
    total: totalSupply,
    decimals: 6,
  })

  const signedTxn = assetCreateTxn.signTxn(creator.sk)
  const txId = await algodClient.sendRawTransaction(signedTxn).do()
  const result = await waitForConfirmation(fixture, txId.txId)

  const assetId = result.assetIndex!

  return { assetId, creator }
}

/**
 * Create both test assets (EXOD and stablecoin)
 */
export async function createTestAssets(
  fixture: AlgorandFixture
): Promise<TestAssets> {
  const exodAsset = await createMockExodAsset(fixture)
  const stablecoinAsset = await createMockStablecoinAsset(fixture)

  return {
    exodAssetId: exodAsset.assetId,
    stablecoinAssetId: stablecoinAsset.assetId,
    exodCreator: exodAsset.creator,
    stablecoinCreator: stablecoinAsset.creator,
  }
}

/**
 * Opt an account into an asset
 */
export async function optIntoAsset(
  fixture: AlgorandFixture,
  account: algosdk.Account,
  assetId: number
): Promise<void> {
  const algodClient = fixture.context.algod
  const suggestedParams = await algodClient.getTransactionParams().do()

  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: account.addr,
    to: account.addr,
    assetIndex: assetId,
    amount: 0,
    suggestedParams,
  })

  const signedTxn = optInTxn.signTxn(account.sk)
  const txId = await algodClient.sendRawTransaction(signedTxn).do()
  await waitForConfirmation(fixture, txId.txId)
}

/**
 * Fund an account with test assets
 */
export async function fundAccountWithAsset(
  fixture: AlgorandFixture,
  recipient: algosdk.Account,
  assetId: number,
  amount: number,
  assetCreator: algosdk.Account
): Promise<void> {
  const algodClient = fixture.context.algod
  const suggestedParams = await algodClient.getTransactionParams().do()

  // First opt-in if not already opted in
  await optIntoAsset(fixture, recipient, assetId)

  // Transfer assets
  const transferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: assetCreator.addr,
    to: recipient.addr,
    assetIndex: assetId,
    amount,
    suggestedParams,
  })

  const signedTxn = transferTxn.signTxn(assetCreator.sk)
  const txId = await algodClient.sendRawTransaction(signedTxn).do()
  await waitForConfirmation(fixture, txId.txId)
}

/**
 * Freeze an account's asset holdings (for compliance testing)
 */
export async function freezeAssetForAccount(
  fixture: AlgorandFixture,
  account: algosdk.Account,
  assetId: number,
  assetCreator: algosdk.Account,
  frozen: boolean
): Promise<void> {
  const algodClient = fixture.context.algod
  const suggestedParams = await algodClient.getTransactionParams().do()

  const freezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
    from: assetCreator.addr,
    assetIndex: assetId,
    freezeTarget: account.addr,
    freezeState: frozen,
    suggestedParams,
  })

  const signedTxn = freezeTxn.signTxn(assetCreator.sk)
  const txId = await algodClient.sendRawTransaction(signedTxn).do()
  await waitForConfirmation(fixture, txId.txId)
}

/**
 * Get an account's asset balance
 */
export async function getAssetBalance(
  fixture: AlgorandFixture,
  account: algosdk.Account,
  assetId: number
): Promise<number> {
  const algodClient = fixture.context.algod
  const accountInfo = await algodClient.accountInformation(account.addr).do()

  const assetHolding = accountInfo.assets?.find((a: any) => a['asset-id'] === assetId)
  return assetHolding?.amount || 0
}

/**
 * Check if an account's asset is frozen
 */
export async function isAssetFrozen(
  fixture: AlgorandFixture,
  account: algosdk.Account,
  assetId: number
): Promise<boolean> {
  const algodClient = fixture.context.algod
  const accountInfo = await algodClient.accountInformation(account.addr).do()

  const assetHolding = accountInfo.assets?.find((a: any) => a['asset-id'] === assetId)
  return assetHolding?.['is-frozen'] || false
}
