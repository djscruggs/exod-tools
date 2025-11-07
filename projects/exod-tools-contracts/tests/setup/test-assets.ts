import algosdk from "algosdk";
import type { AlgorandFixture } from "@algorandfoundation/algokit-utils/types/testing";
import { TestAssets, waitForConfirmation, generateFundedAccount } from "./test-fixtures";
import { algos } from "@algorandfoundation/algokit-utils";
/**
 * Create a mock EXOD asset on LocalNet with freeze and clawback capabilities
 * This allows us to test compliance features without owning real EXOD tokens
 */
export async function createMockExodAsset(
  fixture: AlgorandFixture,
  totalSupply: number = 1_000_000_000_000 // 1 million EXOD with 6 decimals
): Promise<{ assetId: bigint; creator: algosdk.Account }> {
  // Use AlgoKit client access
  const { algorand } = fixture.context;

  // 1. Create a dedicated account for the EXOD asset
  // Note: Asset creation requires an account balance increase (the asset creation fee).
  // We'll fund it with 10 ALGO, which is more than enough for the fee and the min balance.
  const creator = await generateFundedAccount(fixture, 10); // Now passing 10 ALGO

  // 2. Use the AlgoKit client for reliable transaction sending
  const assetCreateResult = await algorand.send.assetCreate({
    sender: creator.addr,
    unitName: "EXOD",
    assetName: "EXOD Test Asset",
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
    total: BigInt(totalSupply), // Use BigInt for large totals
    decimals: 6,
    // Add the fee to cover the asset creation cost
    extraFee: algos(0.1),
    suppressLog: true,
  });

  // Check if assetIndex exists before accessing
  if (!assetCreateResult.assetId) {
    // Throw if the confirmed transaction did not create an asset ID.
    throw new Error("Asset creation transaction failed to return an asset ID.");
  }

  const assetId = assetCreateResult.assetId;

  return { assetId, creator };
}

/**
 * Create a mock stablecoin asset (like USDCa) on LocalNet
 */
export async function createMockStablecoinAsset(
  fixture: AlgorandFixture,
  // Use BigInt for the default total supply to prevent issues
  // 10,000,000 ALGO * 1,000,000 micro = 10,000,000,000,000 microALGO (10 Trillion)
  totalSupply: bigint = 10_000_000_000_000n
): Promise<{ assetId: bigint; creator: algosdk.Account }> {
  const { algorand } = fixture.context; // <-- Get the AlgoKit client

  // 1. Create a dedicated account for the stablecoin asset
  // CRITICAL: Ensure generateFundedAccount passes 10 (ALGO) not 10_000_000 (microALGO)
  const creator = await generateFundedAccount(fixture, 10);
  const signingFunction = (txnGroup: algosdk.Transaction[], indexesToSign: number[]) => {
    // Use the creator's secret key (.sk) to sign the requested transactions
    const signed = indexesToSign.map((i) => txnGroup[i].signTxn(creator.sk));
    return Promise.resolve(signed);
  };
  // 2. Use the AlgoKit client for reliable transaction sending
  const assetCreateResult = await algorand.send.assetCreate({
    sender: creator.addr, // Pass the full account object for signing
    unitName: "USDC",
    assetName: "Test Stablecoin",
    signer: {
      addr: creator.addr, // The sender's address
      signer: signingFunction, // The function that actually signs the transactions
    },
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
    total: totalSupply, // Must be BigInt
    decimals: 6,
    extraFee: algos(0.1), // Ensure fee is covered
    suppressLog: true,
  });

  // This will throw immediately if the transaction was invalid.
  if (!assetCreateResult.assetId) {
    throw new Error("Stablecoin asset creation failed to return assetId.");
  }

  const assetId = assetCreateResult.assetId;

  return { assetId, creator };
}

/**
 * Create both test assets (EXOD and stablecoin)
 */
export async function createTestAssets(fixture: AlgorandFixture): Promise<TestAssets> {
  const exodAsset = await createMockExodAsset(fixture);
  const stablecoinAsset = await createMockStablecoinAsset(fixture);

  return {
    exodAssetId: exodAsset.assetId,
    stablecoinAssetId: stablecoinAsset.assetId,
    exodCreator: exodAsset.creator,
    stablecoinCreator: stablecoinAsset.creator,
  };
}

/**
 * Opt an account into an asset
 */
export async function optIntoAsset(fixture: AlgorandFixture, account: algosdk.Account, assetId: bigint): Promise<void> {
  // Get the AlgoKit-enhanced client
  const { algorand } = fixture.context;

  // Use the AlgoKit client for reliable asset opt-in and confirmation
  await algorand.send.assetOptIn({
    sender: account.addr,
    assetId: assetId,
    suppressLog: true,
  });
}

/**
 * Fund an account with test assets
 */
export async function fundAccountWithAsset(
  fixture: AlgorandFixture,
  recipient: algosdk.Account,
  assetId: bigint, // <-- Now BigInt
  amount: bigint, // <-- Now BigInt
  assetCreator: algosdk.Account
): Promise<void> {
  const { algorand } = fixture.context;

  await optIntoAsset(fixture, recipient, assetId);

  await algorand.send.assetTransfer({
    sender: assetCreator.addr,
    receiver: recipient.addr,
    assetId: assetId,
    amount: amount,
    suppressLog: true,
  });
}

/**
 * Freeze an account's asset holdings (for compliance testing)
 */
export async function freezeAssetForAccount(
  fixture: AlgorandFixture,
  account: algosdk.Account,
  assetId: bigint, // Changed to bigint for consistency
  assetCreator: algosdk.Account,
  frozen: boolean
): Promise<void> {
  const { algorand } = fixture.context; // Get AlgoKit client

  // Replace all manual signing/sending/waiting with one robust call
  await algorand.send.assetFreeze({
    sender: assetCreator.addr, // The freezing address (creator) is the sender/signer
    assetId: assetId,
    account: account.addr,
    frozen: frozen,
    suppressLog: true,
  });
}

/**
 * Get an account's asset balance
 */
export async function getAssetBalance(fixture: AlgorandFixture, account: algosdk.Account, assetId: number): Promise<bigint | 0> {
  const algodClient = fixture.context.algod;
  const accountInfo = await algodClient.accountInformation(account.addr).do();

  const assetHolding = accountInfo.assets?.find((a: any) => a["asset-id"] === assetId);
  return assetHolding?.amount || 0;
}

/**
 * Check if an account's asset is frozen
 */
export async function isAssetFrozen(fixture: AlgorandFixture, account: algosdk.Account, assetId: bigint): Promise<boolean> {
  const algodClient = fixture.context.algod;
  const accountInfo = await algodClient.accountInformation(account.addr).do();

  const assetHolding = accountInfo.assets?.find((a: any) => a["asset-id"] === assetId);
  return assetHolding?.isFrozen || false;
}
