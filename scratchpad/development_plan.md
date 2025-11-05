# EXOD Vault - Development Plan

**Project:** Compliance-Aware DeFi Lending Protocol on Algorand
**Status:** Phase 1 - Frontend Complete, Smart Contract Development Next
**Last Updated:** 2025-11-05

---

## Project Overview

EXOD Vault is a DeFi lending protocol built on Algorand that enables collateralized borrowing against EXOD ASA (NYSE-listed tokenized security). The protocol leverages Algorand's native asset freeze functionality to maintain Real-World Asset (RWA) compliance.

### Key Features
- **Collateralized Lending:** Users deposit EXOD tokens as collateral to borrow stablecoins
- **Compliance Checks:** Automated verification of asset freeze status before transactions
- **Liquidation Engine:** Automated liquidation of under-collateralized positions
- **Box Storage:** Scalable per-user loan data management using Algorand Boxes

---

## Technology Stack

### Smart Contracts
- **Language:** Algorand TypeScript (Puya-TS)
- **Framework:** AlgoKit with `@algorandfoundation/algorand-typescript`
- **Storage:** Box Storage for scalable per-user data
- **Compliance:** Native `assetBalance().frozen` checks

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS v4 with DaisyUI
- **Routing:** React Router v7
- **Wallet:** @txnlab/use-wallet-react (Pera, Defly, KMD support)
- **Build Tool:** Vite with `@tailwindcss/vite` plugin

### Development Tools
- AlgoKit CLI for project orchestration
- TypeScript for type safety
- ESLint & Prettier for code quality
- Git for version control

---

## Work Completed ✅

### 1. Documentation & Planning (Commits: c9acf4b, 90a3be9)

**CLAUDE.md Updated:**
- Removed all Solidity/PyTeal references
- Updated to Algorand TypeScript (Puya-TS) strategy
- Specified complete lending lifecycle methods:
  - `depositCollateral(payTxn: AssetTransferTxn)`
  - `borrowStablecoin(amount: uint64)`
  - `repayLoan(payTxn: AssetTransferTxn)`
  - `withdrawCollateral(amount: uint64)`
  - `liquidateLoan(borrower: Address)`
- Defined `LoanData` struct with `BoxMap<Address, LoanData>` storage
- Documented compliance checks using `this.txn.sender.assetBalance(assetId).frozen`

**README.md Updated:**
- Added clear project description and purpose
- Outlined core functionality
- Updated technology stack to reflect Algorand TypeScript
- Organized tools by category (Smart Contracts, Frontend, Dev Tools)
- Added key features and project structure

### 2. Frontend Implementation (Commits: 8129c6e, 2c0df38)

**Routing Structure:**
- Implemented React Router v7 with nested routes
- Created Layout component with Navigation and Footer
- All routes render with wallet connection integration

**Pages Created:**
- **Dashboard (`/`):** Position overview with collateral, borrowed, health factor cards
- **Deposit (`/deposit`):** EXOD collateral deposit interface with compliance warnings
- **Borrow (`/borrow`):** Borrow stablecoins with health factor preview
- **Repay (`/repay`):** Loan repayment with interest calculation display
- **Withdraw (`/withdraw`):** Collateral withdrawal with safety checks
- **Liquidate (`/liquidate`):** Liquidation interface with position list

**Components:**
- Navigation: Responsive navbar with wallet button, route highlighting
- Layout: Consistent page wrapper with navigation and footer
- All existing wallet components preserved (ConnectWallet, Account, etc.)

**Package Scripts:**
- `npm run dev:ui-only` - Run frontend without contract generation (for current development)
- `npm run dev` - Full dev mode with contract client generation (for post-contract phase)

### 3. UI/UX Enhancements (Commits: c87163d, 7b06a14)

**Tailwind CSS v4 Integration:**
- Upgraded to Tailwind v4 with modern Vite plugin approach
- Uses `@import "tailwindcss"` and `@plugin "daisyui"` in CSS
- Configured via `vite.config.ts` with `@tailwindcss/vite`
- No separate PostCSS or Tailwind config files needed

**Custom Styling:**
- Custom animations: fade-in page transitions
- Custom utilities: scrollbar styling, card hover effects
- Custom component classes: stat-value helpers, badge-status
- Gradient text effects for branding (EXOD + Vault)
- Color-coded stat cards (primary/secondary/success themes)

**Enhanced Components:**
- Dashboard with gradient cards, icons, stats row
- Navigation with sticky header, backdrop blur, icons
- Heroicons SVG icons throughout
- Responsive mobile menu with icons
- Smooth transitions and hover effects

---

## Current State

### ✅ Completed
1. Project documentation and technical specifications
2. Complete frontend UI with all lending operation pages
3. Routing structure and navigation
4. Wallet integration
5. Modern styling with Tailwind v4 + DaisyUI
6. Development workflow setup

### 🔄 In Progress
- None currently

### ⏳ Not Started
1. Smart contract implementation (still Hello World placeholder)
2. Box storage data structures
3. Contract method implementations
4. Frontend-contract integration
5. Testing and deployment

---

## Next Steps: Smart Contract Development

### Phase 2A: Core Data Structures

**File:** `projects/exod-tools-contracts/smart_contracts/exod_tools/contract.algo.ts`

#### 1. Define LoanData Struct
```typescript
class LoanData {
  collateralAmount: uint64
  borrowedAmount: uint64
  lastUpdateTime: uint64
}
```

#### 2. Add State Variables
```typescript
export class ExodTools extends Contract {
  // Configuration
  EXOD_ASSET_ID = GlobalState<uint64>({ key: 'exod_asset' })
  USDC_ASSET_ID = GlobalState<uint64>({ key: 'usdc_asset' })
  LIQUIDATION_ADDRESS = GlobalState<Address>({ key: 'liq_addr' })
  COLLATERAL_RATIO = GlobalState<uint64>({ key: 'col_ratio' })

  // User loan data
  loans = BoxMap<Address, LoanData>({ prefix: 'loan' })
}
```

### Phase 2B: Contract Methods Implementation

#### Priority 1: Deposit Collateral
- Verify sender's EXOD is not frozen using `this.txn.sender.assetBalance(EXOD_ASSET_ID).frozen`
- Verify ASA Transfer transaction in group
- Update or create user's LoanData in BoxMap
- Emit event/log

#### Priority 2: Borrow Stablecoin
- Check user has sufficient collateral
- Calculate available borrow amount based on collateral ratio
- Verify requested amount doesn't exceed limit
- Send inner transaction to transfer USDC to user
- Update borrowedAmount in user's LoanData
- Update lastUpdateTime

#### Priority 3: Repay Loan
- Verify payment transaction in group
- Calculate interest (if applicable)
- Update borrowedAmount in user's LoanData
- Emit repayment event

#### Priority 4: Withdraw Collateral
- Check user has excess collateral (more than required for current debt)
- Calculate available withdrawal amount
- Send inner transaction to transfer EXOD back to user
- Update collateralAmount in user's LoanData

#### Priority 5: Liquidate Position
- Check if target position is under-collateralized (health factor < 1.0)
- Calculate liquidation amount and bonus
- Send inner transaction to transfer collateral to liquidator
- Update or clear target user's LoanData
- Emit liquidation event

### Phase 2C: Helper Functions

```typescript
// Calculate health factor
calculateHealthFactor(collateral: uint64, debt: uint64): uint64

// Check if asset is frozen
isAssetFrozen(address: Address, assetId: uint64): bool

// Get asset balance
getAssetBalance(address: Address, assetId: uint64): uint64
```

### Phase 2D: Testing & Deployment

#### Local Testing
1. Deploy contract to LocalNet
2. Create test EXOD ASA with freeze capabilities
3. Test each method with AlgoKit testing framework
4. Test compliance checks (frozen asset rejection)
5. Test liquidation scenarios

#### TestNet Deployment
1. Deploy to Algorand TestNet
2. Integration testing with frontend
3. End-to-end user flow testing
4. Security review

---

## Phase 3: Frontend-Contract Integration

### 3A: Contract Client Generation
- Build smart contracts: `algokit project run build`
- Generate TypeScript clients: `algokit project link --all`
- Clients auto-generated to `frontend/src/contracts/`

### 3B: Replace Placeholder Handlers

**Files to Update:**
- `src/pages/Deposit.tsx` - Replace `handleDeposit()`
- `src/pages/Borrow.tsx` - Replace `handleBorrow()`
- `src/pages/Repay.tsx` - Replace `handleRepay()`
- `src/pages/Withdraw.tsx` - Replace `handleWithdraw()`
- `src/pages/Liquidate.tsx` - Replace `handleLiquidate()`

**Pattern:**
```typescript
import { ExodToolsClient } from '../contracts/ExodTools'

const handleDeposit = async () => {
  const client = new ExodToolsClient({...})
  await client.depositCollateral({
    payTxn: // construct ASA transfer
  })
}
```

### 3C: Add Real Data Fetching

**Dashboard Updates:**
- Fetch user's LoanData from Box storage
- Calculate real-time health factor
- Display actual collateral and borrowed amounts
- Check compliance status via asset freeze check

**Real-Time Updates:**
- Subscribe to account changes
- Update UI when transactions complete
- Show loading states during transactions

---

## Phase 4: Price Oracle Integration

Currently not implemented. Future considerations:
- Integrate Gora or Folks Finance oracle for EXOD/USD price
- Add oracle price to health factor calculations
- Display real USD values instead of mock "$0.00"

---

## Phase 5: Testing & Launch

### Testing Checklist
- [ ] Unit tests for all contract methods
- [ ] Integration tests for frontend-contract interaction
- [ ] End-to-end user flow tests
- [ ] Compliance check testing (frozen assets)
- [ ] Liquidation scenario testing
- [ ] Security audit (if grant funded)

### Launch Checklist
- [ ] Deploy to MainNet
- [ ] Set up monitoring
- [ ] Create user documentation
- [ ] Launch announcement
- [ ] Begin TVL tracking for career goal

---

## Project Structure

```
exod-tools/
├── CLAUDE.md                           # Technical specifications & career plan
├── README.md                           # Project overview
├── scratchpad/                         # Working documents (this file)
│   └── development_plan.md
├── projects/
│   ├── exod-tools-contracts/           # Smart contracts
│   │   └── smart_contracts/
│   │       └── exod_tools/
│   │           └── contract.algo.ts    # Main contract (currently Hello World)
│   └── exod-tools-frontend/            # React frontend
│       ├── src/
│       │   ├── pages/                  # Route pages (6 pages complete)
│       │   ├── components/             # React components
│       │   └── styles/
│       │       └── App.css             # Tailwind v4 config + custom styles
│       └── package.json                # Frontend dependencies
```

---

## Key Technical Decisions

### 1. Algorand TypeScript over PyTeal
**Rationale:** Modern, type-safe, better developer experience, official direction for Algorand

### 2. Box Storage over Global/Local State
**Rationale:** More scalable, cheaper for per-user data, better for production

### 3. Tailwind v4 with Vite Plugin
**Rationale:** Latest approach, no separate config files, cleaner setup

### 4. React Router v7 Nested Routes
**Rationale:** Better code organization, shared layouts, easier maintenance

---

## Running the Project

### Frontend Only (Current Phase)
```bash
cd projects/exod-tools-frontend
npm install
npm run dev:ui-only
# Opens at http://localhost:5173
```

### Full Stack (After Contract Implementation)
```bash
# Terminal 1: Start LocalNet
algokit localnet start

# Terminal 2: Build & deploy contracts
cd projects/exod-tools-contracts
algokit project run build
algokit project deploy localnet

# Terminal 3: Run frontend
cd projects/exod-tools-frontend
npm run dev
# Opens at http://localhost:5173
```

---

## Career Goal Context

This project is **Step 1 ("The Build")** of a 7-step career plan to become a senior Protocol/DeFi Developer:

1. ✅ **The Build** - Develop EXOD vault (in progress)
2. **The Funding** - Secure Algorand grant
3. **The Vetting** - Security audit
4. **The Launch Prep** - Token & liquidity pool
5. **The Lure** - Launch incentive program
6. **The Proof** - Achieve measurable TVL
7. **The Payday** - Apply for senior dev roles with proven TVL experience

---

## Notes & Considerations

### Compliance
- EXOD ASA freeze functionality must be configured by asset issuer
- Regulatory implications of using real NYSE-listed security
- Consider using testnet ASA for development

### Security
- Smart contract audit critical before mainnet
- Careful testing of liquidation logic
- Oracle manipulation risks (if price oracle added)

### Economics
- Interest rate model not yet defined
- Liquidation penalty/bonus percentages TBD
- Collateral ratio configuration (currently undefined)

---

## Quick Reference: Git Workflow

```bash
# Current branch
git status

# Pull latest changes
git pull origin claude/review-cla-011CUq383k1ggUenUhc8pfSF

# Commit and push
git add .
git commit -m "Your message"
git push -u origin claude/review-cla-011CUq383k1ggUenUhc8pfSF
```

---

**Next Immediate Action:** Implement Phase 2A - Core data structures in `contract.algo.ts`
