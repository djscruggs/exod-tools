import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'

const Borrow: React.FC = () => {
  const { activeAddress } = useWallet()
  const [amount, setAmount] = useState<string>('')

  const handleBorrow = async () => {
    // TODO: Implement borrow logic
    console.log('Borrowing:', amount)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Borrow Stablecoins</h1>

      {!activeAddress ? (
        <div className="alert alert-warning">
          <span>Please connect your wallet to borrow</span>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Borrow Against Your Collateral</h2>

            {/* Warning Banner */}
            <div className="alert alert-warning mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm">Ensure you maintain a healthy collateral ratio to avoid liquidation</span>
            </div>

            {/* Collateral Status */}
            <div className="mb-4 p-4 bg-base-200 rounded-lg">
              <h3 className="font-semibold mb-2">Your Collateral</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Collateral:</span>
                <span className="font-bold">0.00 EXOD</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>Collateral Value:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>Available to Borrow:</span>
                <span className="font-bold text-success">$0.00</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount to Borrow (USDC)</span>
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

            {/* Borrow Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h3 className="font-semibold mb-2">Borrow Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Amount to Borrow:</span>
                    <span>{amount} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest Rate (APR):</span>
                    <span>5.00%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Health Factor:</span>
                    <span className="font-bold text-success">2.5</span>
                  </div>
                  <div className="divider my-1"></div>
                  <div className="flex justify-between font-bold">
                    <span>You Will Receive:</span>
                    <span className="text-primary">{amount} USDC</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={handleBorrow}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Borrow Stablecoins
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Borrow
