import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/withdraw')({
  component: Withdraw,
})

import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'

function Withdraw() {
  const { activeAddress } = useWallet()
  const [amount, setAmount] = useState<string>('')

  const handleWithdraw = async () => {
    // TODO: Implement withdraw logic
    console.log('Withdrawing:', amount)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Withdraw Collateral</h1>

      {!activeAddress ? (
        <div className="alert alert-warning">
          <span>Please connect your wallet to withdraw</span>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-4">Withdraw Your EXOD Collateral</h2>

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
              <span className="text-sm">
                Withdrawing collateral will reduce your health factor. Ensure you maintain sufficient collateralization.
              </span>
            </div>

            {/* Collateral Status */}
            <div className="mb-4 p-4 bg-base-200 rounded-lg">
              <h3 className="font-semibold mb-2">Your Position</h3>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Collateral:</span>
                <span className="font-bold">0.00 EXOD</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>Borrowed Amount:</span>
                <span>0.00 USDC</span>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                <span>Health Factor:</span>
                <span className="font-bold text-success">∞</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span>Available to Withdraw:</span>
                <span className="font-bold text-primary">0.00 EXOD</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Amount to Withdraw (EXOD)</span>
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
              <label className="label">
                <span className="label-text-alt text-gray-500">
                  You can only withdraw excess collateral not required for your loan
                </span>
              </label>
            </div>

            {/* Withdrawal Summary */}
            {amount && parseFloat(amount) > 0 && (
              <div className="mt-4 p-4 bg-base-200 rounded-lg">
                <h3 className="font-semibold mb-2">Withdrawal Summary</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Withdrawal Amount:</span>
                    <span>{amount} EXOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Collateral:</span>
                    <span>0.00 EXOD</span>
                  </div>
                  <div className="divider my-1"></div>
                  <div className="flex justify-between font-bold">
                    <span>Remaining Collateral:</span>
                    <span className="text-primary">0.00 EXOD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Health Factor:</span>
                    <span className="font-bold text-success">∞</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={handleWithdraw}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Withdraw Collateral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

