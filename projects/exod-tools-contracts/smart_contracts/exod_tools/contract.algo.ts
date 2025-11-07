import type { uint64, bytes } from '@algorandfoundation/algorand-typescript'
import {
  Contract,
  assert,
  GlobalState,
  BoxMap,
  Txn,
  Global,
  gtxn,
  itxn,
  abimethod,
  Bytes,
  Account,
  Asset,
  Uint64,
} from '@algorandfoundation/algorand-typescript'
import { itob, btoi, concat, substring } from '@algorandfoundation/algorand-typescript/op';


/**
 * EXOD-Backed Compliant Borrowing Vault
 *
 * This contract implements a DeFi borrowing protocol that:
 * - Accepts EXOD (NYSE-listed tokenized security) as collateral
 * - Allows borrowing of stablecoins against EXOD collateral
 * - Enforces compliance checks using Algorand's ASA frozen status
 * - Manages liquidations via inner transactions
 * - Uses Box storage for scalable user loan data management
 */
export class ExodTools extends Contract {
  // Global state variables
  exodAssetId = GlobalState<Asset>()
  stablecoinAssetId = GlobalState<Asset>()
  liquidationAddress = GlobalState<Account>()
  collateralizationRatio = GlobalState<uint64>() // e.g., 15000 = 150%
  liquidationThreshold = GlobalState<uint64>() // e.g., 12000 = 120%

  // Box storage for user loan data (maps Account -> LoanData)
  // Each box contains 24 bytes: collateral(8) + borrowed(8) + timestamp(8)
  loans = BoxMap<Account, bytes>({ keyPrefix: Bytes() })

  /**
   * Initialize the vault contract
   */
  @abimethod({ onCreate: 'require' })
  createApplication(
    exodAssetId: Asset,
    stablecoinAssetId: Asset,
    liquidationAddress: Account,
    collateralizationRatio: uint64,
    liquidationThreshold: uint64
  ): void {
    this.exodAssetId.value = exodAssetId
    this.stablecoinAssetId.value = stablecoinAssetId
    this.liquidationAddress.value = liquidationAddress
    this.collateralizationRatio.value = collateralizationRatio
    this.liquidationThreshold.value = liquidationThreshold
  }

  /**
   * Opt the contract into receiving EXOD and stablecoin assets
   */
  @abimethod()
  optIntoAssets(): void {
    assert(Txn.sender === Global.creatorAddress, 'Only creator can opt in')

    // Opt into EXOD asset
    itxn
      .assetTransfer({
        xferAsset: this.exodAssetId.value,
        assetReceiver: Global.currentApplicationAddress,
        assetAmount: 0,
      })
      .submit()

    // Opt into stablecoin asset
    itxn
      .assetTransfer({
        xferAsset: this.stablecoinAssetId.value,
        assetReceiver: Global.currentApplicationAddress,
        assetAmount: 0,
      })
      .submit()
  }

  /**
   * Helper to encode loan data into bytes
   */
  private encodeLoanData(collateral: uint64, borrowed: uint64, timestamp: uint64): bytes {
    // Pack three uint64 values into 24 bytes
    return concat(concat(itob(collateral), itob(borrowed)), itob(timestamp));
  }

  /**
   * Helper to decode loan data from bytes
   */
  private decodeLoanData(data: bytes): [uint64, uint64, uint64] {
    // Unpack 24 bytes into three uint64 values
    const collateral = btoi(substring(data, 0, 8));
    const borrowed = btoi(substring(data, 8, 16));
    const timestamp = btoi(substring(data, 16, 24));
    return [collateral, borrowed, timestamp];
  }

  /**
   * Deposit EXOD collateral into the vault
   * Must be called in a group with an asset transfer transaction
   */
  @abimethod()
  depositCollateral(payTxn: gtxn.AssetTransferTxn): void {
    // Verify the collateral transfer transaction
    assert(payTxn.sender === Txn.sender, 'Collateral must come from caller')
    assert(payTxn.assetReceiver === Global.currentApplicationAddress, 'Collateral must go to contract')
    assert(payTxn.xferAsset === this.exodAssetId.value, 'Must transfer EXOD asset')
    assert(payTxn.assetAmount > 0, 'Collateral amount must be positive')

    // COMPLIANCE NOTE: In production, frozen status should be checked off-chain
    // The Algorand protocol will automatically reject transfers from frozen accounts

    // Get or initialize user loan data
    let collateral: uint64
    let borrowed: uint64
    const loanBox = this.loans(Txn.sender)

    if (loanBox.exists) {
      const [collateralAmount, borrowedAmount] = this.decodeLoanData(loanBox.value)
      collateral = collateralAmount + payTxn.assetAmount
      borrowed = borrowedAmount
    } else {
      collateral = payTxn.assetAmount
      borrowed = 0
    }

    // Save updated loan data
    loanBox.value = this.encodeLoanData(collateral, borrowed, Global.latestTimestamp)
  }

  /**
   * Borrow stablecoin against EXOD collateral
   */
  @abimethod()
  borrowStablecoin(borrowAmount: uint64, exodPrice: uint64): void {
    // Verify user has a loan record
    const loanBox = this.loans(Txn.sender)
    assert(loanBox.exists, 'No collateral deposited')

    const [collateralAmount, borrowedAmount] = this.decodeLoanData(loanBox.value)

    // Calculate current collateral value in stablecoin
    const collateralValue: uint64 = (collateralAmount * exodPrice) / 1_000_000

    // Calculate new total borrowed amount
    const newBorrowedAmount: uint64 = borrowedAmount + borrowAmount

    // Verify collateralization ratio is maintained
    const requiredCollateral: uint64 = (newBorrowedAmount * this.collateralizationRatio.value) / 10_000
    assert(collateralValue >= requiredCollateral, 'Insufficient collateral for borrow amount')

    // Update loan data
    loanBox.value = this.encodeLoanData(
      collateralAmount,
      newBorrowedAmount,
      Global.latestTimestamp
    )

    // Transfer stablecoin to borrower via inner transaction
    itxn
      .assetTransfer({
        xferAsset: this.stablecoinAssetId.value,
        assetReceiver: Txn.sender,
        assetAmount: borrowAmount,
      })
      .submit()
  }

  /**
   * Repay borrowed stablecoin
   */
  @abimethod()
  repayLoan(payTxn: gtxn.AssetTransferTxn): void {
    // Verify the repayment transfer transaction
    assert(payTxn.sender === Txn.sender, 'Repayment must come from caller')
    assert(payTxn.assetReceiver === Global.currentApplicationAddress, 'Repayment must go to contract')
    assert(payTxn.xferAsset === this.stablecoinAssetId.value, 'Must transfer stablecoin')
    assert(payTxn.assetAmount > 0, 'Repayment amount must be positive')

    // Verify user has a loan record
    const loanBox = this.loans(Txn.sender)
    assert(loanBox.exists, 'No active loan')

    const [collateralAmount, borrowedAmount] = this.decodeLoanData(loanBox.value)
    assert(borrowedAmount >= payTxn.assetAmount, 'Repayment exceeds borrowed amount')

    // Update loan data
    loanBox.value = this.encodeLoanData(
      collateralAmount,
      borrowedAmount - payTxn.assetAmount,
      Global.latestTimestamp
    )
  }

  /**
   * Withdraw collateral (full or partial)
   */
  @abimethod()
  withdrawCollateral(withdrawAmount: uint64, exodPrice: uint64): void {
    // Verify user has a loan record
    const loanBox = this.loans(Txn.sender)
    assert(loanBox.exists, 'No collateral deposited')

    const [collateralAmount, borrowedAmount] = this.decodeLoanData(loanBox.value)
    assert(collateralAmount >= withdrawAmount, 'Insufficient collateral balance')

    // Calculate remaining collateral after withdrawal
    const remainingCollateral: uint64 = collateralAmount - withdrawAmount
    const remainingCollateralValue: uint64 = (remainingCollateral * exodPrice) / 1_000_000

    // If user has borrowed funds, verify collateralization is maintained
    if (borrowedAmount > 0) {
      const requiredCollateral: uint64 = (borrowedAmount * this.collateralizationRatio.value) / 10_000
      assert(remainingCollateralValue >= requiredCollateral, 'Withdrawal would under-collateralize loan')
    }

    // Update loan data
    loanBox.value = this.encodeLoanData(remainingCollateral, borrowedAmount, Global.latestTimestamp)

    // Transfer collateral back to user via inner transaction
    itxn
      .assetTransfer({
        xferAsset: this.exodAssetId.value,
        assetReceiver: Txn.sender,
        assetAmount: withdrawAmount,
      })
      .submit()
  }

  /**
   * Liquidate an under-collateralized loan
   */
  @abimethod()
  liquidateLoan(borrower: Account, exodPrice: uint64): void {
    // Verify borrower has a loan record
    const loanBox = this.loans(borrower)
    assert(loanBox.exists, 'No active loan for borrower')

    const [collateralAmount, borrowedAmount] = this.decodeLoanData(loanBox.value)

    // Verify there is an outstanding loan to liquidate
    assert(borrowedAmount > 0, 'No outstanding loan')
    assert(collateralAmount > 0, 'No collateral to liquidate')

    // Calculate current collateral value
    const collateralValue: uint64 = (collateralAmount * exodPrice) / 1_000_000

    // Calculate liquidation threshold value
    const thresholdValue: uint64 = (borrowedAmount * this.liquidationThreshold.value) / 10_000

    // Verify loan is under-collateralized (below liquidation threshold)
    assert(collateralValue < thresholdValue, 'Loan is sufficiently collateralized')

    // Use inner transaction to seize and transfer collateral
    itxn
      .assetTransfer({
        xferAsset: this.exodAssetId.value,
        assetReceiver: this.liquidationAddress.value,
        assetAmount: collateralAmount,
      })
      .submit()

    // Clear the loan data (liquidation complete)
    loanBox.value = this.encodeLoanData(0, 0, Global.latestTimestamp)
  }

  /**
   * Get loan information for a user
   */
  @abimethod({ readonly: true })
  getLoanInfo(user: Account): [uint64, uint64, uint64] {
    const loanBox = this.loans(user)
    if (loanBox.exists) {
      return this.decodeLoanData(loanBox.value)
    } else {
      return [0, 0, 0]
    }
  }

  /**
   * Admin function to update liquidation parameters
   */
  @abimethod()
  updateLiquidationParams(newThreshold: uint64, newRatio: uint64): void {
    assert(Txn.sender === Global.creatorAddress, 'Only creator can update parameters')
    assert(newThreshold > 10_000, 'Threshold must be > 100%')
    assert(newRatio > newThreshold, 'Collateralization ratio must be > liquidation threshold')

    this.liquidationThreshold.value = newThreshold
    this.collateralizationRatio.value = newRatio
  }

  /**
   * Admin function to fund the vault with stablecoin liquidity
   */
  @abimethod()
  fundVault(payTxn: gtxn.AssetTransferTxn): void {
    // Verify the funding transfer transaction
    assert(payTxn.sender === Txn.sender, 'Funding must come from caller')
    assert(payTxn.assetReceiver === Global.currentApplicationAddress, 'Funding must go to contract')
    assert(payTxn.xferAsset === this.stablecoinAssetId.value, 'Must transfer stablecoin')
    assert(payTxn.assetAmount > 0, 'Funding amount must be positive')
  }
}
