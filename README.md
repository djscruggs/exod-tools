# EXOD Tools

A compliance-aware DeFi lending protocol on Algorand that enables collateralized borrowing against EXOD ASA (NYSE-listed tokenized security).

## What This Project Does

This protocol allows users to:
- Deposit EXOD (a regulated tokenized asset) as collateral
- Borrow stablecoins against their EXOD holdings
- Manage loans with automated compliance checks using Algorand's native asset freeze functionality
- Liquidate under-collateralized positions

The smart contracts leverage Algorand's Layer-1 features to maintain Real-World Asset (RWA) compliance by checking asset freeze status before allowing interactions.

## Setup

### Initial setup
1. Clone this repository to your local machine.
2. Ensure [Docker](https://www.docker.com/) is installed and operational. Then, install `AlgoKit` following this [guide](https://github.com/algorandfoundation/algokit-cli#install).
3. Run `algokit project bootstrap all` in the project directory. This command sets up your environment by installing necessary dependencies, setting up a Python virtual environment, and preparing your `.env` file.
4. In the case of a smart contract project, execute `algokit generate env-file -a target_network localnet` from the `exod-tools-contracts` directory to create a `.env.localnet` file with default configuration for `localnet`.
5. To build your project, execute `algokit project run build`. This compiles your project and prepares it for running.
6. For project-specific instructions, refer to the READMEs of the child projects:
   - Smart Contracts: [exod-tools-contracts](projects/exod-tools-contracts/README.md)
   - Frontend Application: [exod-tools-frontend](projects/exod-tools-frontend/README.md)

> This project is structured as a monorepo, refer to the [documentation](https://github.com/algorandfoundation/algokit-cli/blob/main/docs/features/project/run.md) to learn more about custom command orchestration via `algokit project run`.

### Subsequently

1. If you update to the latest source code and there are new dependencies, you will need to run `algokit project bootstrap all` again.
2. Follow step 3 above.

## Technologies

### Smart Contracts
- **Algorand TypeScript** (Puya-TS) - Modern, type-safe smart contract language
- **AlgoKit** - Development toolchain and framework
- **Box Storage** - Efficient on-chain storage for user loan data

### Frontend
- **React** - UI framework
- **AlgoKit Utils** - Algorand integration utilities
- **Tailwind CSS & daisyUI** - Styling
- **use-wallet** - Wallet connectivity

### Development Tools
- TypeScript, npm, jest, playwright
- ESLint, Prettier for code quality
- GitHub Actions for CI/CD

### VS Code

It has also been configured to have a productive dev experience out of the box in [VS Code](https://code.visualstudio.com/), see the [backend .vscode](./backend/.vscode) and [frontend .vscode](./frontend/.vscode) folders for more details.

## Integrating with smart contracts and application clients

Refer to the [exod-tools-contracts](projects/exod-tools-contracts/README.md) folder for overview of working with smart contracts, [projects/exod-tools-frontend](projects/exod-tools-frontend/README.md) for overview of the React project and the [projects/exod-tools-frontend/contracts](projects/exod-tools-frontend/src/contracts/README.md) folder for README on adding new smart contracts from backend as application clients on your frontend. The templates provided in these folders will help you get started.
When you compile and generate smart contract artifacts, your frontend component will automatically generate typescript application clients from smart contract artifacts and move them to `frontend/src/contracts` folder, see [`generate:app-clients` in package.json](projects/exod-tools-frontend/package.json). Afterwards, you are free to import and use them in your frontend application.

The frontend starter also provides an example of interactions with your ExodToolsClient in [`AppCalls.tsx`](projects/exod-tools-frontend/src/components/AppCalls.tsx) component by default.

## Project Structure

- **`projects/exod-tools-contracts/`** - Algorand TypeScript smart contracts implementing the lending vault logic
- **`projects/exod-tools-frontend/`** - React frontend for interacting with the protocol

## Key Features

- **Compliance Checks**: Automated verification of asset freeze status before transactions
- **Collateralized Lending**: Secure borrowing against EXOD token holdings
- **Liquidation Engine**: Automated liquidation of under-collateralized positions
- **Box Storage**: Scalable per-user loan data management
