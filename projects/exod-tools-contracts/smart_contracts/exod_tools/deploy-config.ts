import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { ExodToolsFactory } from '../artifacts/exod_tools/ExodToolsClient'

/**
 * Deploy the EXOD-Backed Compliant Borrowing Vault
 *
 * This deployment script:
 * 1. Deploys the ExodTools smart contract
 * 2. Configures it with EXOD and stablecoin asset IDs
 * 3. Sets up liquidation parameters
 * 4. Opts the contract into assets
 * 5. Funds the vault with initial stablecoin liquidity
 */
export async function deploy() {
  console.log('=== Deploying EXOD-Backed Compliant Borrowing Vault ===')

  const algorand = AlgorandClient.fromEnvironment()
  const deployer = await algorand.account.fromEnvironment('DEPLOYER')

  // Configuration parameters
  // TODO: Replace these with actual asset IDs for your environment
  const EXOD_ASSET_ID = 12345n // Placeholder - replace with actual EXOD ASA ID
  const STABLECOIN_ASSET_ID = 31566704n // USDCa on Algorand TestNet (use actual ID for your network)
  const LIQUIDATION_ADDRESS = deployer.addr // For testing, use deployer address
  const COLLATERALIZATION_RATIO = 15000n // 150% - borrower must have $1.50 of collateral per $1.00 borrowed
  const LIQUIDATION_THRESHOLD = 12000n // 120% - liquidation triggered when collateral drops below $1.20 per $1.00 borrowed

  console.log('Configuration:')
  console.log(`  EXOD Asset ID: ${EXOD_ASSET_ID}`)
  console.log(`  Stablecoin Asset ID: ${STABLECOIN_ASSET_ID}`)
  console.log(`  Liquidation Address: ${LIQUIDATION_ADDRESS}`)
  console.log(`  Collateralization Ratio: ${COLLATERALIZATION_RATIO / 100n}%`)
  console.log(`  Liquidation Threshold: ${LIQUIDATION_THRESHOLD / 100n}%`)

  // Create factory for the ExodTools contract
  const factory = algorand.client.getTypedAppFactory(ExodToolsFactory, {
    defaultSender: deployer.addr,
  })

  console.log('\n1. Deploying contract...')
  const { appClient, result } = await factory.deploy({
    onUpdate: 'append',
    onSchemaBreak: 'append',
    createParams: {
      args: {
        exodAssetId: EXOD_ASSET_ID,
        stablecoinAssetId: STABLECOIN_ASSET_ID,
        liquidationAddress: LIQUIDATION_ADDRESS,
        collateralizationRatio: COLLATERALIZATION_RATIO,
        liquidationThreshold: LIQUIDATION_THRESHOLD,
      },
    },
  })

  console.log(`   ✓ Contract deployed with App ID: ${appClient.appClient.appId}`)
  console.log(`   ✓ Contract address: ${appClient.appAddress}`)
  console.log(`   ✓ Operation: ${result.operationPerformed}`)

  // Fund the app account if it was just created
  if (['create', 'replace'].includes(result.operationPerformed)) {
    console.log('\n2. Funding contract account...')
    const fundingAmount = (0.5).algo() // Fund with 0.5 ALGO for MBR and transaction fees
    await algorand.send.payment({
      amount: fundingAmount,
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
    console.log(`   ✓ Funded contract with ${fundingAmount.microAlgo / 1_000_000} ALGO`)

    // Opt the contract into assets
    console.log('\n3. Opting contract into assets...')
    try {
      await appClient.send.optIntoAssets({
        args: {},
      })
      console.log('   ✓ Contract opted into EXOD and stablecoin assets')
    } catch (error) {
      console.log('   ⚠ Asset opt-in failed. You may need to:')
      console.log('     1. Create test assets if they don\'t exist')
      console.log('     2. Update the asset IDs in this config')
      console.log('     3. Call optIntoAssets() manually after setup')
      console.log(`   Error: ${error}`)
    }

    // TODO: Fund the vault with initial stablecoin liquidity
    // This would require a separate transaction group in production
    console.log('\n4. Initial vault funding (manual step required):')
    console.log('   To fund the vault with stablecoin liquidity:')
    console.log('   a. Transfer stablecoin to the contract address')
    console.log('   b. Call fundVault() method in a transaction group')
  }

  // Test: Get loan info for deployer (should return zeros initially)
  console.log('\n5. Testing contract methods...')
  try {
    const loanInfo = await appClient.send.getLoanInfo({
      args: { user: deployer.addr },
    })
    console.log(`   ✓ getLoanInfo test: [${loanInfo.return?.join(', ')}]`)
  } catch (error) {
    console.log(`   ⚠ getLoanInfo test failed: ${error}`)
  }

  // Test: Check if deployer's EXOD is frozen
  try {
    const isFrozen = await appClient.send.isExodFrozen({
      args: { user: deployer.addr },
    })
    console.log(`   ✓ isExodFrozen test: ${isFrozen.return}`)
  } catch (error) {
    console.log(`   ⚠ isExodFrozen test failed: ${error}`)
  }

  console.log('\n=== Deployment Complete ===')
  console.log(`\nContract App ID: ${appClient.appClient.appId}`)
  console.log(`Contract Address: ${appClient.appAddress}`)
  console.log('\nNext steps:')
  console.log('1. Update EXOD_ASSET_ID and STABLECOIN_ASSET_ID with actual values')
  console.log('2. Create test assets if needed for local testing')
  console.log('3. Fund the vault with stablecoin liquidity')
  console.log('4. Test deposit, borrow, repay, and liquidation flows')

  return appClient
}
