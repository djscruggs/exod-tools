import algosdk from "algosdk";
import type { AlgorandFixture } from "@algorandfoundation/algokit-utils/types/testing";
import { TestAssets, TestConfig, waitForConfirmation } from "./test-fixtures";

/**
 * Deployed contract instance information
 */
export interface DeployedContract {
  appId: number;
  appAddress: string;
  creator: algosdk.Account;
}

/**
 * Deploy the ExodTools smart contract to LocalNet
 *
 * Note: This is a placeholder that will work once the contract is compiled.
 * For now, we'll need to compile the contract first using:
 * `npm run build`
 */
export async function deployExodToolsContract(
  fixture: AlgorandFixture,
  testAssets: TestAssets,
  config: TestConfig
): Promise<DeployedContract> {
  // Create a deployer account
  const creator = algosdk.generateAccount();

  // Fund the creator
  await fixture.algorand.send.payment({
    sender: fixture.context.testAccount.addr,
    receiver: creator.addr,
    amount: algosdk.algosToMicroalgos(10),
  });

  // For now, return a mock deployment
  // This will be replaced with actual deployment logic after compilation
  const appId = 1000; // Placeholder
  const appAddress = algosdk.getApplicationAddress(appId);

  return {
    appId,
    appAddress,
    creator,
  };
}

/**
 * Helper to create an asset transfer transaction
 */
export function createAssetTransferTxn(
  from: string,
  to: string,
  assetId: number,
  amount: number,
  suggestedParams: algosdk.SuggestedParams
): algosdk.Transaction {
  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from,
    to,
    assetIndex: assetId,
    amount,
    suggestedParams,
  });
}

/**
 * Helper to create an application call transaction
 */
export function createAppCallTxn(
  from: string,
  appId: number,
  method: string,
  args: any[],
  suggestedParams: algosdk.SuggestedParams,
  accounts?: string[],
  foreignAssets?: number[]
): algosdk.Transaction {
  return algosdk.makeApplicationNoOpTxnFromObject({
    from,
    appIndex: appId,
    appArgs: [new TextEncoder().encode(method), ...args],
    accounts,
    foreignAssets,
    suggestedParams,
  });
}

/**
 * Helper to create and send a grouped transaction
 */
export async function sendGroupedTransactions(
  fixture: AlgorandFixture,
  transactions: algosdk.Transaction[],
  signers: algosdk.Account[]
): Promise<string> {
  // Group transactions
  const groupedTxns = algosdk.assignGroupID(transactions);

  // Sign each transaction with its corresponding signer
  const signedTxns = groupedTxns.map((txn, index) => {
    return txn.signTxn(signers[index].sk);
  });

  // Send grouped transactions
  const algodClient = fixture.context.algod;
  const { txId } = await algodClient.sendRawTransaction(signedTxns).do();

  // Wait for confirmation
  await waitForConfirmation(fixture, txId);

  return txId;
}

/**
 * Helper to read application global state
 */
export async function readAppGlobalState(fixture: AlgorandFixture, appId: number): Promise<Map<string, any>> {
  const algodClient = fixture.context.algod;
  const appInfo = await algodClient.getApplicationByID(appId).do();

  const globalState = new Map<string, any>();

  if (appInfo.params["globalState"]) {
    for (const item of appInfo.params["globalState"]) {
      const key = Buffer.from(item.key, "base64").toString();
      let value: any;

      if (item.value.type === 1) {
        // bytes
        value = Buffer.from(item.value.bytes, "base64");
      } else {
        // uint
        value = item.value.uint;
      }

      globalState.set(key, value);
    }
  }

  return globalState;
}

/**
 * Helper to read application box storage
 */
export async function readBoxValue(fixture: AlgorandFixture, appId: number, boxName: Uint8Array): Promise<Uint8Array | null> {
  try {
    const algodClient = fixture.context.algod;
    const boxValue = await algodClient.getApplicationBoxByName(appId, boxName).do();
    return new Uint8Array(boxValue.value);
  } catch (error) {
    return null;
  }
}

/**
 * Helper to decode loan data from box storage
 */
export function decodeLoanData(data: Uint8Array): {
  collateralAmount: bigint;
  borrowedAmount: bigint;
  lastUpdateTime: bigint;
} {
  // LoanData structure: collateralAmount (8 bytes) + borrowedAmount (8 bytes) + lastUpdateTime (8 bytes)
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

  return {
    collateralAmount: view.getBigUint64(0, false),
    borrowedAmount: view.getBigUint64(8, false),
    lastUpdateTime: view.getBigUint64(16, false),
  };
}

/**
 * Helper to get loan info for a user
 */
export async function getUserLoanInfo(
  fixture: AlgorandFixture,
  appId: number,
  userAddress: string
): Promise<{
  collateralAmount: bigint;
  borrowedAmount: bigint;
  lastUpdateTime: bigint;
} | null> {
  // Box name is the user's address (32 bytes)
  const boxName = algosdk.decodeAddress(userAddress).publicKey;

  const boxData = await readBoxValue(fixture, appId, boxName);

  if (!boxData) {
    return null;
  }

  return decodeLoanData(boxData);
}
