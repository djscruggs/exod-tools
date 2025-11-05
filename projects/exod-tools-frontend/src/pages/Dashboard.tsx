import { useWallet } from '@txnlab/use-wallet-react'
import React from 'react'

const Dashboard: React.FC = () => {
  const { activeAddress } = useWallet()

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-base-content/60 mt-2">Overview of your lending position</p>
      </div>

      {!activeAddress ? (
        <div className="alert alert-info shadow-lg">
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
          <span>Please connect your wallet to view your position</span>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Collateral Card */}
            <div className="card bg-gradient-to-br from-primary/10 to-primary/5 shadow-xl card-hover border border-primary/20">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-primary">Your Collateral</h2>
                  <div className="badge badge-primary badge-outline">EXOD</div>
                </div>
                <div className="stat-value text-4xl font-bold text-primary mt-4">0.00</div>
                <p className="text-sm text-base-content/60 mt-1">EXOD Tokens</p>
                <div className="divider my-2"></div>
                <div className="flex justify-between text-xs">
                  <span className="text-base-content/60">USD Value:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
              </div>
            </div>

            {/* Borrowed Card */}
            <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 shadow-xl card-hover border border-secondary/20">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-secondary">Borrowed</h2>
                  <div className="badge badge-secondary badge-outline">USDC</div>
                </div>
                <div className="stat-value text-4xl font-bold text-secondary mt-4">0.00</div>
                <p className="text-sm text-base-content/60 mt-1">USDC</p>
                <div className="divider my-2"></div>
                <div className="flex justify-between text-xs">
                  <span className="text-base-content/60">Interest Rate:</span>
                  <span className="font-semibold">0.00% APR</span>
                </div>
              </div>
            </div>

            {/* Health Factor Card */}
            <div className="card bg-gradient-to-br from-success/10 to-success/5 shadow-xl card-hover border border-success/20">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-success">Health Factor</h2>
                  <div className="badge badge-success badge-outline">Safe</div>
                </div>
                <div className="stat-value text-4xl font-bold text-success mt-4">∞</div>
                <p className="text-sm text-base-content/60 mt-1">Excellent</p>
                <div className="divider my-2"></div>
                <div className="flex justify-between text-xs">
                  <span className="text-base-content/60">Liquidation at:</span>
                  <span className="font-semibold text-error">&lt; 1.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="stats stats-vertical lg:stats-horizontal shadow-xl w-full mb-8">
            <div className="stat">
              <div className="stat-title">Collateral Ratio</div>
              <div className="stat-value text-2xl text-primary">N/A</div>
              <div className="stat-desc">No active position</div>
            </div>

            <div className="stat">
              <div className="stat-title">Available to Borrow</div>
              <div className="stat-value text-2xl text-accent">$0.00</div>
              <div className="stat-desc">At current collateral</div>
            </div>

            <div className="stat">
              <div className="stat-title">Compliance Status</div>
              <div className="stat-value text-2xl">
                <span className="badge badge-success badge-lg gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Verified
                </span>
              </div>
              <div className="stat-desc">Assets not frozen</div>
            </div>
          </div>

          {/* Account Details */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Account Details
              </h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <tbody>
                    <tr className="hover">
                      <td className="font-semibold w-1/3">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                          </svg>
                          Address
                        </div>
                      </td>
                      <td className="font-mono text-sm break-all">{activeAddress}</td>
                    </tr>
                    <tr className="hover">
                      <td className="font-semibold">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                          </svg>
                          Total Position Value
                        </div>
                      </td>
                      <td><span className="text-lg font-semibold">$0.00</span></td>
                    </tr>
                    <tr className="hover">
                      <td className="font-semibold">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                          Compliance Status
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-success gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-4 h-4 stroke-current">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Verified - Assets Not Frozen
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
