import { useWallet } from '@txnlab/use-wallet-react'
import React from 'react'

const Dashboard: React.FC = () => {
  const { activeAddress } = useWallet()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

      {!activeAddress ? (
        <div className="alert alert-info">
          <span>Please connect your wallet to view your position</span>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Collateral Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Your Collateral</h2>
              <div className="stat-value text-primary">0.00</div>
              <p className="text-sm text-gray-500">EXOD Tokens</p>
              <div className="text-xs mt-2">
                <p>Value: $0.00</p>
              </div>
            </div>
          </div>

          {/* Borrowed Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Borrowed</h2>
              <div className="stat-value text-secondary">0.00</div>
              <p className="text-sm text-gray-500">USDC</p>
              <div className="text-xs mt-2">
                <p>Interest: 0.00%</p>
              </div>
            </div>
          </div>

          {/* Health Factor Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Health Factor</h2>
              <div className="stat-value text-success">∞</div>
              <p className="text-sm text-gray-500">Safe</p>
              <div className="text-xs mt-2">
                <p>Liquidation threshold: &lt; 1.0</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Details */}
      {activeAddress && (
        <div className="mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Account Details</h2>
              <div className="overflow-x-auto">
                <table className="table table-compact w-full">
                  <tbody>
                    <tr>
                      <td className="font-semibold">Address</td>
                      <td className="font-mono text-sm">{activeAddress}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Collateral Ratio</td>
                      <td>N/A</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Available to Borrow</td>
                      <td>$0.00</td>
                    </tr>
                    <tr>
                      <td className="font-semibold">Compliance Status</td>
                      <td>
                        <span className="badge badge-success">Verified</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
