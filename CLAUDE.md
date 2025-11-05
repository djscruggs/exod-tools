## Algorand Protocol Engineer Career Plan
This document outlines a high-priority, seven-step plan to secure a job as a senior Solidity/Protocol Developer by demonstrating real-world Total Value Locked (TVL) management experience on the **Algorand** blockchain, leveraging my strong **PyTeal/Beaker** expertise.

My strategy focuses on building a **non-trivial, compliance-aware DeFi primitive** centered around the NYSE-listed, tokenized **EXOD ASA** to immediately gain credibility in the Real-World Asset (RWA) space.

---

## ✅ PHASE 1: STRATEGIC PLAN (The 7 Steps)

My goal is to transition from a developer to a **Protocol Founder** temporarily, then re-enter the job market as a highly experienced developer who has successfully managed a live protocol economy.

| Step | Goal | Status |
| :--- | :--- | :--- |
| **1. The Build** | Develop the **EXOD-Backed Compliant Borrowing Vault (e.g., ExoLeverage)** using Beaker/PyTeal. | ⏳ **WIP** (This is the current task for Claude). |
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
* **Technology:** PyTeal / Beaker SDK
* **Asset:** EXOD ASA (NYSE-listed, tokenized security).
* **Goal:** Allow verified users to deposit EXOD (a regulated asset) as collateral and borrow an unregulated stablecoin (e.g., USDCa or STBL) against it.

### 2. Core Non-Trivial Challenge: Compliance-Aware TEAL Logic

The security and complexity of this protocol hinge on leveraging Algorand's Layer-1 features to maintain RWA compliance.

| Feature | TEAL/PyTeal Mechanism | Complexity Proof |
| :--- | :--- | :--- |
| **Collateral Check** | **`AssetHolding.frozen`:** On every deposit/claim, the protocol must check the user's ASA holdings. If the asset has been **frozen** by the regulator (indicating a compliance failure), the user is blocked from interacting. | Demonstrates programmatic awareness of **ASA Layer-1 controls** for RWA. |
| **Vault Liquidation** | **Inner Transactions:** When a loan is under-collateralized, the liquidation function must use a PyTeal Inner Transaction (`itxn`) to seize the EXOD collateral from the borrower and transfer it to a separate, whitelisted treasury account. | Proves expertise in **complex group transactions** and **escrow management** using the Application Account. |
| **State Management** | **Beaker Boxes:** Use Algorand's **Boxes** feature to store user-specific loan data (collateral amount, borrowed amount, LTV ratio) efficiently, which is cheaper and more scalable than local state. | Demonstrates mastery of **modern Algorand scaling patterns** and data structures. |

---

## 💻 PHASE 3: CLAUDE ASSIGNMENT (Starting Step 1)

My current focus is building the core application logic. I need a foundational Beaker smart contract.

**Primary Task:** Draft the initial Python file for the Beaker application that implements the `deposit_collateral` and `liquidate_loan` methods, demonstrating the use of `AssetHolding.frozen` and Inner Transactions.

### **Required Code Structure & Pointers:**

1.  **Framework:** Use the **Beaker SDK** for application scaffolding.
2.  **ASA ID:** Use a placeholder `ASA_ID = 12345` for the EXOD asset.
3.  **Deposit Logic (`deposit_collateral`):**
    * Must verify that the user's EXOD collateral is **NOT** frozen using `AssetHolding.frozen`.
    * Must verify the transaction group includes the necessary **ASA Transfer Txn** (from sender to app address).
    * Must update the user's loan data stored in a **Box** (use a placeholder Box key like `Txn.sender()`).
4.  **Liquidation Logic (`liquidate_loan`):**
    * Must include logic for **Inner Transactions (`itxn`)** to seize and transfer the collateral out of the vault to a hardcoded `LIQUIDATION_ADDRESS`.

**Please generate the Beaker/PyTeal code for this initial contract shell. Focus on the PyTeal expressions for checking the ASA status and executing the inner transfer.**
