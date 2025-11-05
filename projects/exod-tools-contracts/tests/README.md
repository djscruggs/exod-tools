# ExodTools Testing Framework

Complete testing framework for the EXOD-Backed Compliant Borrowing Vault smart contract.

## Overview

This testing framework allows you to test the ExodTools smart contract **without owning real EXOD tokens** by using AlgoKit's LocalNet with mock assets.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start LocalNet

```bash
algokit localnet start
```

### 3. Compile the Contract

```bash
npm run build
```

### 4. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup/                    # Test utilities and helpers
│   ├── test-fixtures.ts      # Base test fixtures and helpers
│   ├── test-assets.ts        # Mock asset creation (EXOD, stablecoin)
│   ├── contract-helpers.ts   # Contract deployment and interaction
│   └── index.ts              # Exports all utilities
│
├── unit/                     # Unit tests for individual functions
│   ├── deposit.test.ts       # Deposit and withdrawal tests
│   ├── borrow.test.ts        # Borrow and repay tests
│   ├── liquidation.test.ts   # Liquidation logic tests
│   └── compliance.test.ts    # Frozen asset compliance tests
│
├── integration/              # Integration tests for full workflows
│   └── full-lifecycle.test.ts # Complete lending lifecycle tests
│
└── README.md                 # This file
```

## Key Testing Capabilities

### 1. Mock Asset Creation

Create test versions of EXOD and stablecoins on LocalNet:

```typescript
import { createTestAssets } from './setup'

const testAssets = await createTestAssets(fixture)
// Returns: { exodAssetId, stablecoinAssetId, exodCreator, stablecoinCreator }
```

### 2. Account Funding

Generate and fund test accounts with mock assets:

```typescript
import { generateFundedAccount, fundAccountWithAsset } from './setup'

const borrower = await generateFundedAccount(fixture)
await fundAccountWithAsset(
  fixture,
  borrower,
  testAssets.exodAssetId,
  100_000_000, // 100 EXOD
  testAssets.exodCreator
)
```

### 3. Compliance Testing

Freeze and unfreeze accounts to simulate regulatory actions:

```typescript
import { freezeAssetForAccount, isAssetFrozen } from './setup'

// Freeze account (simulate compliance violation)
await freezeAssetForAccount(
  fixture,
  borrower,
  testAssets.exodAssetId,
  testAssets.exodCreator,
  true // frozen = true
)

// Verify frozen
const frozen = await isAssetFrozen(fixture, borrower, testAssets.exodAssetId)
expect(frozen).toBe(true)
```

### 4. Calculation Helpers

Test collateralization logic:

```typescript
import {
  calculateCollateralValue,
  calculateRequiredCollateral,
  isLoanUnderwater,
} from './setup'

// Calculate collateral value
const value = calculateCollateralValue(10_000_000, 10_000_000) // 10 EXOD at $10 = $100

// Calculate required collateral
const required = calculateRequiredCollateral(
  100_000_000, // $100 borrow
  15000, // 150% ratio
  10_000_000 // $10 EXOD price
) // Returns 15 EXOD

// Check if loan is underwater
const underwater = isLoanUnderwater(
  10_000_000, // collateral
  100_000_000, // borrowed
  8_000_000, // EXOD price dropped to $8
  12000 // 120% liquidation threshold
) // Returns true
```

## Test Categories

### Unit Tests

#### Deposit Tests (`unit/deposit.test.ts`)
- ✅ Successful deposit with unfrozen EXOD
- ✅ Reject deposit with frozen EXOD (compliance)
- ✅ Reject zero collateral
- ✅ Reject wrong asset
- ✅ Update loan data correctly
- ✅ Handle multiple deposits
- ✅ Verify transaction group requirements

#### Borrow Tests (`unit/borrow.test.ts`)
- ✅ Successful borrow with sufficient collateral
- ✅ Reject insufficient collateral
- ✅ Reject if no collateral deposited
- ✅ Reject if insufficient vault liquidity
- ✅ Handle multiple borrows
- ✅ Update loan data correctly

#### Liquidation Tests (`unit/liquidation.test.ts`)
- ✅ Successfully liquidate underwater loan
- ✅ Reject liquidation of healthy loan
- ✅ Anyone can trigger liquidation
- ✅ Transfer collateral via inner transaction
- ✅ Clear loan data after liquidation
- ✅ Handle price volatility scenarios

#### Compliance Tests (`unit/compliance.test.ts`)
- ✅ Allow operations when EXOD not frozen
- ✅ Block deposits when EXOD frozen
- ✅ Handle freeze/unfreeze cycles
- ✅ Allow liquidation even if borrower frozen
- ✅ Test real-world compliance scenarios

### Integration Tests

#### Full Lifecycle Tests (`integration/full-lifecycle.test.ts`)
- ✅ Complete borrow-repay lifecycle
- ✅ Multiple users simultaneously
- ✅ Partial operations (multiple deposits/borrows)
- ✅ Liquidation in full lifecycle
- ✅ Compliance interruptions
- ✅ Price volatility scenarios
- ✅ Admin functions
- ✅ Box storage scalability

## Testing Best Practices

### 1. Isolation

Each test should be independent:
- Use `beforeEach` to create fresh accounts
- Don't rely on state from previous tests
- Clean up after tests if needed

### 2. Descriptive Names

Test names should clearly describe what they test:
```typescript
// Good
test('should reject deposit when EXOD is frozen')

// Bad
test('test1')
```

### 3. Arrange-Act-Assert Pattern

Structure tests clearly:
```typescript
test('should calculate collateral value correctly', () => {
  // Arrange
  const collateralAmount = 10_000_000
  const exodPrice = 10_000_000

  // Act
  const value = calculateCollateralValue(collateralAmount, exodPrice)

  // Assert
  expect(value).toBe(100_000_000)
})
```

### 4. Test Edge Cases

Always test:
- Zero values
- Maximum values
- Boundary conditions
- Error paths
- State transitions

## Mock Asset Configuration

The test framework creates mock assets with these properties:

### EXOD Asset
- **Unit Name**: EXOD
- **Name**: EXOD Test Asset
- **Total Supply**: 1,000,000 EXOD (1,000,000,000,000 units with 6 decimals)
- **Decimals**: 6
- **Freeze Address**: Set (allows compliance testing)
- **Clawback Address**: Set

### Stablecoin Asset
- **Unit Name**: USDC
- **Name**: Test Stablecoin
- **Total Supply**: 10,000,000 USDC (10,000,000,000,000 units with 6 decimals)
- **Decimals**: 6
- **Freeze Address**: Set
- **Clawback Address**: Set

## Default Test Configuration

```typescript
{
  collateralizationRatio: 15000,  // 150%
  liquidationThreshold: 12000,    // 120%
  exodPrice: 10_000_000,          // $10 per EXOD (scaled by 1e6)
}
```

## Troubleshooting

### LocalNet not running
```bash
algokit localnet start
```

### Contract not compiled
```bash
npm run build
```

### Import errors
Make sure all dependencies are installed:
```bash
npm install
```

### Test timeouts
Tests have a 60-second timeout for blockchain operations. If tests timeout:
- Check LocalNet is running
- Verify contract is compiled
- Check for infinite loops in test code

## Adding New Tests

### 1. Create Test File

Create a new file in `tests/unit/` or `tests/integration/`:
```typescript
import { describe, test, expect, beforeAll, beforeEach } from 'vitest'
import { getAlgorandFixture, createTestAssets } from '../setup'

describe('My New Feature', () => {
  let fixture: AlgorandFixture
  let testAssets: TestAssets

  beforeAll(async () => {
    fixture = await getAlgorandFixture()
    testAssets = await createTestAssets(fixture)
  })

  test('should do something', async () => {
    // Test code here
  })
})
```

### 2. Run Your Tests

```bash
npm run test:watch
```

### 3. Add Documentation

Update this README with your new test category.

## Architecture Highlights

This testing framework demonstrates:

1. **No Real Tokens Needed**: All testing on LocalNet with mock assets
2. **Full Compliance Testing**: Freeze/unfreeze accounts for RWA compliance
3. **Comprehensive Coverage**: Unit, integration, and edge case tests
4. **Professional Tooling**: Vitest, AlgoKit Utils, TypeScript
5. **Real-World Scenarios**: Price volatility, liquidations, multi-user interactions

## Next Steps

After the contract is compiled and deployed, you'll need to:

1. Update `contract-helpers.ts` with actual deployment logic
2. Replace placeholder tests with real contract interactions
3. Run the full test suite
4. Generate coverage report
5. Document any issues found

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [AlgoKit Utils Testing](https://github.com/algorandfoundation/algokit-utils-ts)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [Algorand TypeScript](https://github.com/algorandfoundation/puya-ts)
