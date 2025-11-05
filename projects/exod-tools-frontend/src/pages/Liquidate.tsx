import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'

const Liquidate: React.FC = () => {
  const { activeAddress } = useWallet()
  const [borrowerAddress, setBorrowerAddress] = useState<string>('')

  const handleLiquidate = async () => {
    // TODO: Implement liquidation logic
    console.log('Liquidating borrower:', borrowerAddress)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Liquidations</h1>

      {!activeAddress ? (
        <div className="alert alert-warning">
          <span>Please connect your wallet to participate in liquidations</span>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Liquidation Interface */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Liquidate Position</h2>

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
                <span className="text-sm">
                  Liquidate under-collateralized positions and earn a liquidation bonus
                </span>
              </div>

              {/* Borrower Address Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Borrower Address to Liquidate</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Algorand address"
                  className="input input-bordered font-mono text-sm"
                  value={borrowerAddress}
                  onChange={(e) => setBorrowerAddress(e.target.value)}
                />
              </div>

              {/* Position Info (shown when address is entered) */}
              {borrowerAddress && (
                <div className="mt-4 p-4 bg-base-200 rounded-lg">
                  <h3 className="font-semibold mb-2">Position Details</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Health Factor:</span>
                      <span className="font-bold text-error">0.85</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Collateral:</span>
                      <span>100.00 EXOD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Debt:</span>
                      <span>50.00 USDC</span>
                    </div>
                    <div className="divider my-1"></div>
                    <div className="flex justify-between">
                      <span>Liquidation Bonus:</span>
                      <span className="font-bold text-success">5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Potential Profit:</span>
                      <span className="font-bold text-success">2.50 USDC</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="card-actions justify-end mt-6">
                <button
                  className="btn btn-error"
                  onClick={handleLiquidate}
                  disabled={!borrowerAddress}
                >
                  Liquidate Position
                </button>
              </div>
            </div>
          </div>

          {/* Available Liquidations List */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Under-Collateralized Positions</h2>

              <div className="text-sm text-gray-500 mb-4">
                Positions with health factor {'<'} 1.0 can be liquidated
              </div>

              {/* Mock liquidation opportunities */}
              <div className="space-y-2">
                <div className="alert shadow-sm">
                  <div className="flex-1">
                    <div className="text-xs font-mono mb-1">ADDR...XYZ123</div>
                    <div className="flex gap-4 text-xs">
                      <span>HF: <span className="font-bold text-error">0.92</span></span>
                      <span>Debt: <span className="font-bold">25 USDC</span></span>
                      <span className="text-success">+1.25 USDC</span>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-error">Liquidate</button>
                </div>

                <div className="alert shadow-sm">
                  <div className="flex-1">
                    <div className="text-xs font-mono mb-1">ADDR...ABC456</div>
                    <div className="flex gap-4 text-xs">
                      <span>HF: <span className="font-bold text-error">0.78</span></span>
                      <span>Debt: <span className="font-bold">100 USDC</span></span>
                      <span className="text-success">+5.00 USDC</span>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-error">Liquidate</button>
                </div>

                <div className="alert shadow-sm">
                  <div className="flex-1">
                    <div className="text-xs font-mono mb-1">ADDR...DEF789</div>
                    <div className="flex gap-4 text-xs">
                      <span>HF: <span className="font-bold text-error">0.88</span></span>
                      <span>Debt: <span className="font-bold">50 USDC</span></span>
                      <span className="text-success">+2.50 USDC</span>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-error">Liquidate</button>
                </div>
              </div>

              {/* Empty state placeholder */}
              {/* <div className="text-center py-8 text-gray-500">
                <p>No positions available for liquidation</p>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Liquidate
