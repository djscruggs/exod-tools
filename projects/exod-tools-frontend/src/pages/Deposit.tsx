import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'

const Deposit: React.FC = () => {
  const { activeAddress } = useWallet()
  const [amount, setAmount] = useState<string>('')

  const handleDeposit = async () => {
    // TODO: Implement deposit logic
    console.log('Depositing:', amount)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Deposit Collateral</h1>

      {!activeAddress ? (
        <div className="alert alert-warning">
          <span>Please connect your wallet to deposit collateral</span>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Deposit EXOD as Collateral</h2>

            {/* Info Banner */}
            <div className="alert alert-info mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className="text-sm">EXOD tokens must not be frozen by regulators to be deposited</span>
            </div>

            {/* Balance Display */}
            <div className="mb-4 p-4 bg-base-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm">Available Balance:</span>
                <span className="font-bold">0.00 EXOD</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>Asset ID:</span>
                <span>12345 (Placeholder)</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount to Deposit</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  placeholder="0.00"
                  className="input input-bordered flex-1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <button className="btn btn-outline" onClick={() => setAmount('0')}>
                  MAX
                </button>
              </div>
            </div>

            {/* Deposit Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h3 className="font-semibold mb-2">Deposit Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{amount} EXOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Value:</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Collateral:</span>
                    <span className="font-bold">{amount} EXOD</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={handleDeposit}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Deposit Collateral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Deposit
