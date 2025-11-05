# Build Guide for ExodTools

This guide explains how to build both the smart contracts and frontend in the correct order.

## Prerequisites

- Node.js 22+
- AlgoKit CLI 2.5+
- Git

## Build Order (Important!)

The frontend depends on the smart contracts, so you **must build in this order**:

1. Smart Contracts (generates TypeScript client)
2. Frontend (uses generated client)

---

## Part 1: Build Smart Contracts

### Navigate to Contracts

```bash
cd /Users/djscruggs/VSCode/exod-tools/projects/exod-tools-contracts
```

### Install Dependencies

```bash
npm install
```

**Note**: If you see network errors downloading Puya compiler, retry the install.

### Build Contracts

```bash
npm run build
```

This command:
1. **Compiles** Algorand TypeScript → TEAL bytecode
2. **Generates** ARC32 application specification
3. **Creates** TypeScript client at `artifacts/exod_tools/ExodToolsClient.ts`

### Verify Build

```bash
ls artifacts/exod_tools/
```

You should see:
- `ExodTools.arc32.json` - Contract specification
- `ExodToolsClient.ts` - Generated TypeScript client
- `ExodTools.approval.teal` - Approval program
- `ExodTools.clear.teal` - Clear program

---

## Part 2: Build Frontend

### Navigate to Frontend

```bash
cd ../exod-tools-frontend
```

### Pull Latest Changes

```bash
git pull origin claude/testing-framework-setup-011CUqXPS8LTjKTdS9mQzoQe
```

This includes the dependency fixes:
- `react-helmet-async` - For Helmet component
- `@types/better-sqlite3` - SQLite type definitions

### Install Dependencies

```bash
npm install
```

### Build Frontend

```bash
npm run build
```

This command:
1. **Generates** contract clients (links to contract artifacts)
2. **Type-checks** TypeScript
3. **Bundles** with Vite

### Verify Build

```bash
ls dist/
```

You should see the built frontend files ready for deployment.

---

## Development Mode

For development with hot-reload:

### Terminal 1: Start LocalNet (for testing)

```bash
algokit localnet start
```

### Terminal 2: Frontend Dev Server

```bash
cd projects/exod-tools-frontend
npm run dev
```

This will:
- Generate contract clients
- Start Vite dev server
- Auto-reload on file changes

Visit: http://localhost:5173

---

## Troubleshooting

### Issue: "AlgoKit not found"

**Solution**: Install AlgoKit CLI

```bash
# macOS
brew install algorandfoundation/tap/algokit

# Linux/WSL
pipx install algokit

# Windows
winget install algorandfoundation.algokit
```

Verify installation:
```bash
algokit --version
```

### Issue: "Cannot find module '../contracts/ExodTools'"

**Cause**: Contracts haven't been built yet.

**Solution**: Build contracts first (see Part 1 above)

### Issue: Network error downloading Puya compiler

**Cause**: GitHub download failed during npm install.

**Solution**:
```bash
cd projects/exod-tools-contracts
rm -rf node_modules
npm install
```

If it persists, check your internet connection and retry.

### Issue: Helmet/HelmetProvider type errors

**Cause**: Missing `react-helmet-async` dependency.

**Solution**: Already fixed in latest commit. Pull changes:
```bash
git pull origin claude/testing-framework-setup-011CUqXPS8LTjKTdS9mQzoQe
npm install
```

### Issue: "Could not find declaration file for 'better-sqlite3'"

**Cause**: Missing type definitions.

**Solution**: Already fixed in latest commit. Pull changes and reinstall:
```bash
git pull origin claude/testing-framework-setup-011CUqXPS8LTjKTdS9mQzoQe
npm install
```

### Issue: Build works but tests fail

**Cause**: LocalNet not running.

**Solution**:
```bash
algokit localnet start
```

---

## Testing the Contracts

After building, you can run the comprehensive test suite:

```bash
cd projects/exod-tools-contracts

# Start LocalNet
algokit localnet start

# Run tests
npm test

# Or watch mode
npm run test:watch

# Or with coverage
npm run test:coverage
```

See `TESTING_GUIDE.md` for details on the testing framework.

---

## Project Structure

```
exod-tools/
├── projects/
│   ├── exod-tools-contracts/          # Smart contracts
│   │   ├── smart_contracts/
│   │   │   └── exod_tools/
│   │   │       └── contract.algo.ts   # Main contract
│   │   ├── artifacts/                 # Generated after build
│   │   │   └── exod_tools/
│   │   │       ├── ExodTools.arc32.json
│   │   │       └── ExodToolsClient.ts # Used by frontend
│   │   ├── tests/                     # Test suite
│   │   └── package.json
│   │
│   └── exod-tools-frontend/           # Frontend
│       ├── src/
│       │   ├── components/
│       │   ├── routes/
│       │   └── contracts/             # Links to contract clients
│       └── package.json
```

---

## Build Scripts Reference

### Contracts (`projects/exod-tools-contracts/package.json`)

```json
{
  "scripts": {
    "build": "algokit compile ts smart_contracts && algokit generate client ...",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Frontend (`projects/exod-tools-frontend/package.json`)

```json
{
  "scripts": {
    "generate:app-clients": "algokit project link --all",
    "dev": "npm run generate:app-clients && vite",
    "build": "npm run generate:app-clients && tsc && vite build"
  }
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Contracts built successfully
- [ ] All tests passing (`npm test` in contracts)
- [ ] Frontend builds without errors
- [ ] Tested on LocalNet
- [ ] Tested on TestNet
- [ ] Security audit completed (for production)
- [ ] Environment variables configured
- [ ] AlgoKit configuration reviewed

---

## Quick Reference

### Full Clean Build

```bash
# Clean everything
cd projects/exod-tools-contracts
rm -rf node_modules artifacts
npm install
npm run build

cd ../exod-tools-frontend
rm -rf node_modules dist
npm install
npm run build
```

### Development Workflow

```bash
# Terminal 1: LocalNet
algokit localnet start

# Terminal 2: Frontend dev
cd projects/exod-tools-frontend
npm run dev

# Terminal 3: Tests (optional)
cd projects/exod-tools-contracts
npm run test:watch
```

---

## Next Steps

After successful build:

1. **Test on LocalNet**: `algokit localnet start` + `npm run dev`
2. **Run Contract Tests**: `npm test` in contracts directory
3. **Deploy to TestNet**: Update deployment configuration
4. **Security Review**: Run audits before MainNet
5. **Update Documentation**: Document deployment addresses

---

## Getting Help

- **Build Issues**: Check this guide's troubleshooting section
- **Testing**: See `projects/exod-tools-contracts/TESTING_GUIDE.md`
- **Algorand TypeScript**: https://github.com/algorandfoundation/puya-ts
- **AlgoKit Docs**: https://github.com/algorandfoundation/algokit-cli

---

## Summary

**Correct Build Order**:
1. ✅ Build contracts → generates client
2. ✅ Build frontend → uses generated client

**Key Commands**:
```bash
# Contracts
cd projects/exod-tools-contracts
npm install && npm run build

# Frontend
cd ../exod-tools-frontend
npm install && npm run build
```

**Development**:
```bash
algokit localnet start  # Terminal 1
npm run dev             # Terminal 2 (in frontend dir)
```

That's it! You're ready to build and test the ExodTools protocol. 🚀
