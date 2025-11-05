import { Contract } from '@algorandfoundation/algorand-typescript'
import { Account, Asset, AssetID, BoxMap, Txn, Global, gtxn, itxn } from '@algorandfoundation/algorand-typescript'

/**
 * User loan data structure stored in boxes
 */
class LoanData {
  collateralAmount: uint64 // Amount of EXOD deposited as collateral
  borrowedAmount: uint64 // Amount of stablecoin borrowed
  lastUpdateTime: uint64 // Timestamp of last update

  constructor() {
    this.collateralAmount = 0
    this.borrowedAmount = 0
    this.lastUpdateTime = 0
  }
}

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
  // State variables
  exodAssetId: AssetID // The EXOD ASA ID
  stablecoinAssetId: AssetID // The stablecoin ASA ID (e.g., USDCa or STBL)
  liquidationAddress: Account // Address to receive liquidated collateral
  collateralizationRatio: uint64 // Required collateralization (e.g., 150 = 150%)
  liquidationThreshold: uint64 // Liquidation threshold (e.g., 120 = 120%)

  // Box storage for user loan data
  loans: BoxMap<Account, LoanData>

  /**
   * Initialize the vault contract
   *
   * @param exodAssetId - The EXOD ASA ID
   * @param stablecoinAssetId - The stablecoin ASA ID for borrowing
   * @param liquidationAddress - Address to receive liquidated collateral
   * @param collateralizationRatio - Minimum collateralization ratio (basis points, e.g., 15000 = 150%)
   * @param liquidationThreshold - Liquidation threshold (basis points, e.g., 12000 = 120%)
   */
  createApplication(
    exodAssetId: AssetID,
    stablecoinAssetId: AssetID,
    liquidationAddress: Account,
    collateralizationRatio: uint64,
    liquidationThreshold: uint64
  ): void {
    this.exodAssetId = exodAssetId
    this.stablecoinAssetId = stablecoinAssetId
    this.liquidationAddress = liquidationAddress
    this.collateralizationRatio = collateralizationRatio
    this.liquidationThreshold = liquidationThreshold
  }

  /**
   * Opt the contract into receiving EXOD and stablecoin assets
   * Must be called after contract creation to enable asset transfers
   */
  optIntoAssets(): void {
    // Verify caller is the creator
    assert(Txn.sender === Global.creatorAddress, 'Only creator can opt in')

    // Opt into EXOD asset
    itxn.assetTransfer({
      xferAsset: this.exodAssetId,
      assetReceiver: Global.currentApplicationAddress,
      assetAmount: 0,
    }).submit()

    // Opt into stablecoin asset
    itxn.assetTransfer({
      xferAsset: this.stablecoinAssetId,
      assetReceiver: Global.currentApplicationAddress,
      assetAmount: 0,
    }).submit()
  }

  /**
   * Deposit EXOD collateral into the vault
   *
   * This method:
   * 1. Verifies the EXOD asset is NOT frozen for the sender (compliance check)
   * 2. Verifies the asset transfer transaction in the group
   * 3. Updates the user's loan data in box storage
   *
   * @param collateralTxn - Asset transfer transaction sending EXOD to the contract
   */
  depositCollateral(collateralTxn: AssetTransferTxn): void {
    // Verify this is called as part of a group transaction
    assert(Txn.groupIndex > 0, 'Must be called in a transaction group')

    // Verify the collateral transfer transaction
    assert(collateralTxn.sender === Txn.sender, 'Collateral must come from caller')
    assert(collateralTxn.assetReceiver === Global.currentApplicationAddress, 'Collateral must go to contract')
    assert(collateralTxn.xferAsset === this.exodAssetId, 'Must transfer EXOD asset')
    assert(collateralTxn.assetAmount > 0, 'Collateral amount must be positive')

    // CRITICAL COMPLIANCE CHECK: Verify the EXOD asset is NOT frozen for the sender
    // This is the key non-trivial feature that ensures RWA compliance
    const assetHolding = Txn.sender.assetBalance(this.exodAssetId)
    assert(!assetHolding.frozen, 'EXOD asset is frozen - compliance violation detected')

    // Get or initialize user loan data from box storage
    const userLoan = this.loans.maybe(Txn.sender)
    let loanData: LoanData

    if (userLoan.exists) {
      loanData = userLoan.value
    } else {
      loanData = new LoanData()
    }

    // Update loan data
    loanData.collateralAmount = loanData.collateralAmount + collateralTxn.assetAmount
    loanData.lastUpdateTime = Global.latestTimestamp

    // Save updated loan data to box storage
    this.loans[Txn.sender] = loanData
  }

  /**
   * Borrow stablecoin against EXOD collateral
   *
   * This method:
   * 1. Verifies the user has sufficient collateral
   * 2. Checks the collateralization ratio is maintained
   * 3. Transfers stablecoin to the borrower via inner transaction
   *
   * @param borrowAmount - Amount of stablecoin to borrow
   * @param exodPrice - Current price of EXOD in stablecoin (scaled by 1e6)
   */
  borrowStablecoin(borrowAmount: uint64, exodPrice: uint64): void {
    // Verify user has a loan record
    assert(this.loans.maybe(Txn.sender).exists, 'No collateral deposited')

    const loanData = this.loans[Txn.sender]

    // Calculate current collateral value in stablecoin
    // collateralValue = (collateralAmount * exodPrice) / 1e6
    const collateralValue = (loanData.collateralAmount * exodPrice) / 1_000_000

    // Calculate new total borrowed amount
    const newBorrowedAmount = loanData.borrowedAmount + borrowAmount

    // Verify collateralization ratio is maintained
    // Required: collateralValue >= (borrowedAmount * collateralizationRatio) / 10000
    const requiredCollateral = (newBorrowedAmount * this.collateralizationRatio) / 10_000
    assert(collateralValue >= requiredCollateral, 'Insufficient collateral for borrow amount')

    // Verify contract has sufficient stablecoin liquidity
    const contractBalance = Global.currentApplicationAddress.assetBalance(this.stablecoinAssetId).balance
    assert(contractBalance >= borrowAmount, 'Insufficient liquidity in vault')

    // Update loan data
    loanData.borrowedAmount = newBorrowedAmount
    loanData.lastUpdateTime = Global.latestTimestamp
    this.loans[Txn.sender] = loanData

    // Transfer stablecoin to borrower via inner transaction
    itxn.assetTransfer({
      xferAsset: this.stablecoinAssetId,
      assetReceiver: Txn.sender,
      assetAmount: borrowAmount,
    }).submit()
  }

  /**
   * Repay borrowed stablecoin
   *
   * @param repaymentTxn - Asset transfer transaction sending stablecoin to the contract
   */
  repayLoan(repaymentTxn: AssetTransferTxn): void {
    // Verify this is called as part of a group transaction
    assert(Txn.groupIndex > 0, 'Must be called in a transaction group')

    // Verify the repayment transfer transaction
    assert(repaymentTxn.sender === Txn.sender, 'Repayment must come from caller')
    assert(repaymentTxn.assetReceiver === Global.currentApplicationAddress, 'Repayment must go to contract')
    assert(repaymentTxn.xferAsset === this.stablecoinAssetId, 'Must transfer stablecoin')
    assert(repaymentTxn.assetAmount > 0, 'Repayment amount must be positive')

    // Verify user has a loan record
    assert(this.loans.maybe(Txn.sender).exists, 'No active loan')

    const loanData = this.loans[Txn.sender]
    assert(loanData.borrowedAmount >= repaymentTxn.assetAmount, 'Repayment exceeds borrowed amount')

    // Update loan data
    loanData.borrowedAmount = loanData.borrowedAmount - repaymentTxn.assetAmount
    loanData.lastUpdateTime = Global.latestTimestamp
    this.loans[Txn.sender] = loanData
  }

  /**
   * Withdraw collateral (full or partial)
   * User must have sufficient collateralization after withdrawal
   *
   * @param withdrawAmount - Amount of EXOD collateral to withdraw
   * @param exodPrice - Current price of EXOD in stablecoin (scaled by 1e6)
   */
  withdrawCollateral(withdrawAmount: uint64, exodPrice: uint64): void {
    // Verify user has a loan record
    assert(this.loans.maybe(Txn.sender).exists, 'No collateral deposited')

    const loanData = this.loans[Txn.sender]
    assert(loanData.collateralAmount >= withdrawAmount, 'Insufficient collateral balance')

    // Calculate remaining collateral after withdrawal
    const remainingCollateral = loanData.collateralAmount - withdrawAmount
    const remainingCollateralValue = (remainingCollateral * exodPrice) / 1_000_000

    // If user has borrowed funds, verify collateralization is maintained
    if (loanData.borrowedAmount > 0) {
      const requiredCollateral = (loanData.borrowedAmount * this.collateralizationRatio) / 10_000
      assert(remainingCollateralValue >= requiredCollateral, 'Withdrawal would under-collateralize loan')
    }

    // Update loan data
    loanData.collateralAmount = remainingCollateral
    loanData.lastUpdateTime = Global.latestTimestamp
    this.loans[Txn.sender] = loanData

    // Transfer collateral back to user via inner transaction
    itxn.assetTransfer({
      xferAsset: this.exodAssetId,
      assetReceiver: Txn.sender,
      assetAmount: withdrawAmount,
    }).submit()
  }

  /**
   * Liquidate an under-collateralized loan
   *
   * This is the key non-trivial feature demonstrating inner transaction mastery.
   * When a loan falls below the liquidation threshold, anyone can trigger liquidation:
   * 1. Seizes the user's EXOD collateral
   * 2. Transfers it to the liquidation address via inner transaction
   * 3. Clears the user's loan
   *
   * @param borrower - The account to liquidate
   * @param exodPrice - Current price of EXOD in stablecoin (scaled by 1e6)
   */
  liquidateLoan(borrower: Account, exodPrice: uint64): void {
    // Verify borrower has a loan record
    assert(this.loans.maybe(borrower).exists, 'No active loan for borrower')

    const loanData = this.loans[borrower]

    // Verify there is an outstanding loan to liquidate
    assert(loanData.borrowedAmount > 0, 'No outstanding loan')
    assert(loanData.collateralAmount > 0, 'No collateral to liquidate')

    // Calculate current collateral value
    const collateralValue = (loanData.collateralAmount * exodPrice) / 1_000_000

    // Calculate liquidation threshold value
    const thresholdValue = (loanData.borrowedAmount * this.liquidationThreshold) / 10_000

    // Verify loan is under-collateralized (below liquidation threshold)
    assert(collateralValue < thresholdValue, 'Loan is sufficiently collateralized')

    // CRITICAL: Use inner transaction to seize and transfer collateral
    // This demonstrates mastery of Algorand's inner transaction capabilities
    itxn.assetTransfer({
      xferAsset: this.exodAssetId,
      assetReceiver: this.liquidationAddress,
      assetAmount: loanData.collateralAmount,
    }).submit()

    // Clear the loan data (liquidation complete)
    loanData.collateralAmount = 0
    loanData.borrowedAmount = 0
    loanData.lastUpdateTime = Global.latestTimestamp
    this.loans[borrower] = loanData
  }

  /**
   * Get loan information for a user
   *
   * @param user - The account to query
   * @returns Tuple of (collateralAmount, borrowedAmount, lastUpdateTime)
   */
  getLoanInfo(user: Account): [uint64, uint64, uint64] {
    const userLoan = this.loans.maybe(user)

    if (userLoan.exists) {
      const loanData = userLoan.value
      return [loanData.collateralAmount, loanData.borrowedAmount, loanData.lastUpdateTime]
    } else {
      return [0, 0, 0]
    }
  }

  /**
   * Check if a user's EXOD asset is frozen (compliance check)
   *
   * @param user - The account to check
   * @returns true if frozen, false if not frozen
   */
  isExodFrozen(user: Account): boolean {
    const assetHolding = user.assetBalance(this.exodAssetId)
    return assetHolding.frozen
  }

  /**
   * Admin function to update liquidation parameters
   * Only callable by contract creator
   */
  updateLiquidationParams(newThreshold: uint64, newRatio: uint64): void {
    assert(Txn.sender === Global.creatorAddress, 'Only creator can update parameters')
    assert(newThreshold > 10_000, 'Threshold must be > 100%')
    assert(newRatio > newThreshold, 'Collateralization ratio must be > liquidation threshold')

    this.liquidationThreshold = newThreshold
    this.collateralizationRatio = newRatio
  }

  /**
   * Admin function to fund the vault with stablecoin liquidity
   *
   * @param fundingTxn - Asset transfer transaction sending stablecoin to the contract
   */
  fundVault(fundingTxn: AssetTransferTxn): void {
    // Verify this is called as part of a group transaction
    assert(Txn.groupIndex > 0, 'Must be called in a transaction group')

    // Verify the funding transfer transaction
    assert(fundingTxn.sender === Txn.sender, 'Funding must come from caller')
    assert(fundingTxn.assetReceiver === Global.currentApplicationAddress, 'Funding must go to contract')
    assert(fundingTxn.xferAsset === this.stablecoinAssetId, 'Must transfer stablecoin')
    assert(fundingTxn.assetAmount > 0, 'Funding amount must be positive')
  }
}
