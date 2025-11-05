## Algorand Protocol Engineer Career Plan
This document outlines a high-priority, seven-step plan to secure a job as a senior Protocol/DeFi Developer by demonstrating real-world Total Value Locked (TVL) management experience on the **Algorand** blockchain, leveraging **Algorand TypeScript** (the modern, official smart contract language).

My strategy focuses on building a **non-trivial, compliance-aware DeFi primitive** centered around the NYSE-listed, tokenized **EXOD ASA** to immediately gain credibility in the Real-World Asset (RWA) space.

---

## ✅ PHASE 1: STRATEGIC PLAN (The 7 Steps)

My goal is to transition from a developer to a **Protocol Founder** temporarily, then re-enter the job market as a highly experienced developer who has successfully managed a live protocol economy.

| Step | Goal | Status |
| :--- | :--- | :--- |
| **1. The Build** | Develop the **EXOD-Backed Compliant Borrowing Vault (e.g., ExoLeverage)** using Algorand TypeScript. | ⏳ **WIP** (This is the current task for Claude). |
| **2. The Funding** | Secure a grant (e.g., Algorand Accelerator) using the completed MVP and business plan. | 🔜 Pending Step 1. |
| **3. The Vetting** | Use grant funds for a cheap, private security audit to gain credibility. | 🔜 Pending Step 2. |
| **4. The Launch Prep** | Mint a new utility token and seed a liquidity pool with grant funds. | 🔜 Pending Step 3. |
| **5. The Lure** | Launch an ASA reward/incentive program to attract initial users. | 🔜 Pending Step 4. |
| **6. The Proof** | Achieve and sustain measurable **TVL** (Total Value Locked) on the platform. | 🔜 Pending Step 5. |
| **7. The Payday** | Apply for senior developer roles with verified TVL management experience. | 🏆 Goal. |

---

## 🛠️ PHASE 2: NON-TRIVIAL PROJECT SPECIFICATIONS

### 1. Project: EXOD-Backed Compliant Borrowing Vault
* **Target Chain:** Algorand
* **Technology:** Algorand TypeScript (Puya-TS) - Modern, type-safe smart contract language
* **Framework:** AlgoKit with `@algorandfoundation/algorand-typescript`
* **Asset:** EXOD ASA (NYSE-listed, tokenized security).
* **Goal:** Allow verified users to deposit EXOD (a regulated asset) as collateral and borrow an unregulated stablecoin (e.g., USDCa or STBL) against it.

### 2. Core Non-Trivial Challenge: Compliance-Aware TEAL Logic

The security and complexity of this protocol hinge on leveraging Algorand's Layer-1 features to maintain RWA compliance.

| Feature | Algorand TypeScript Mechanism | Complexity Proof |
| :--- | :--- | :--- |
| **Collateral Check** | **`this.txn.sender.assetBalance(assetId).frozen`:** On every deposit/claim, the protocol must check the user's ASA holdings using TypeScript's native asset balance API. If the asset has been **frozen** by the regulator (indicating a compliance failure), the user is blocked from interacting. | Demonstrates programmatic awareness of **ASA Layer-1 controls** for RWA using modern type-safe syntax. |
| **Vault Liquidation** | **Inner Transactions:** When a loan is under-collateralized, the liquidation function must use TypeScript's `sendAssetTransfer()` method to seize the EXOD collateral from the borrower and transfer it to a separate, whitelisted treasury account. | Proves expertise in **complex group transactions** and **escrow management** using the Application Account with type-safe transaction building. |
| **State Management** | **Box Storage:** Use Algorand's **Boxes** feature via TypeScript's `BoxMap<K, V>` and `Box<T>` types to store user-specific loan data (collateral amount, borrowed amount, LTV ratio) efficiently, which is cheaper and more scalable than local state. | Demonstrates mastery of **modern Algorand scaling patterns** and data structures with compile-time type safety. |

---

## 💻 PHASE 3: CLAUDE ASSIGNMENT (Starting Step 1)

My current focus is building the core application logic. I need a foundational Algorand TypeScript smart contract.

**Primary Task:** Implement the TypeScript smart contract that includes `depositCollateral` and `liquidateLoan` methods, demonstrating the use of asset frozen checks and Inner Transactions.

### **Required Code Structure & Pointers:**

1.  **Framework:** Use **Algorand TypeScript** (`@algorandfoundation/algorand-typescript`) with the existing AlgoKit project structure.
2.  **ASA ID:** Use a placeholder constant `EXOD_ASSET_ID = 12345` for the EXOD asset.
3.  **Deposit Logic (`depositCollateral`):**
    * Must verify that the user's EXOD collateral is **NOT** frozen using `this.txn.sender.assetBalance(assetId).frozen`.
    * Must verify the transaction group includes the necessary **ASA Transfer Txn** (from sender to app address).
    * Must update the user's loan data stored in a **Box** using `BoxMap<Address, LoanData>` for efficient per-user storage.
4.  **Liquidation Logic (`liquidateLoan`):**
    * Must include logic for **Inner Transactions** using `sendAssetTransfer()` to seize the EXOD collateral from the borrower and transfer it to a hardcoded `LIQUIDATION_ADDRESS`.
    * Must verify loan is under-collateralized before allowing liquidation.

### **Additional Requirements:**

5.  **State Variables:**
    * Define a `LoanData` struct/class with: `collateralAmount`, `borrowedAmount`, `lastUpdateTime`
    * Use `BoxMap<Address, LoanData>` for scalable per-user loan storage
6.  **Complete Lending Lifecycle:**
    * `depositCollateral(payTxn: AssetTransferTxn)` - Deposit EXOD collateral
    * `borrowStablecoin(amount: uint64)` - Borrow against collateral
    * `repayLoan(payTxn: AssetTransferTxn)` - Repay borrowed amount
    * `withdrawCollateral(amount: uint64)` - Withdraw excess collateral
    * `liquidateLoan(borrower: Address)` - Liquidate underwater positions

**Please generate the Algorand TypeScript code for this contract. Focus on the TypeScript syntax for checking the ASA frozen status and executing inner transactions with proper type safety.**
