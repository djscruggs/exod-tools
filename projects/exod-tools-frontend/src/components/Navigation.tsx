import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ConnectWallet from './ConnectWallet'
import { ellipseAddress } from '../utils/ellipseAddress'

const Navigation: React.FC = () => {
  const { activeAddress } = useWallet()
  const location = useLocation()
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  return (
    <>
      <div className="navbar bg-base-100 shadow-lg">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <Link to="/" className={isActive('/') ? 'active' : ''}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/deposit" className={isActive('/deposit') ? 'active' : ''}>
                  Deposit
                </Link>
              </li>
              <li>
                <Link to="/borrow" className={isActive('/borrow') ? 'active' : ''}>
                  Borrow
                </Link>
              </li>
              <li>
                <Link to="/repay" className={isActive('/repay') ? 'active' : ''}>
                  Repay
                </Link>
              </li>
              <li>
                <Link to="/withdraw" className={isActive('/withdraw') ? 'active' : ''}>
                  Withdraw
                </Link>
              </li>
              <li>
                <Link to="/liquidate" className={isActive('/liquidate') ? 'active' : ''}>
                  Liquidate
                </Link>
              </li>
            </ul>
          </div>
          <Link to="/" className="btn btn-ghost normal-case text-xl">
            <span className="font-bold">EXOD</span>
            <span className="text-primary">Vault</span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link to="/" className={isActive('/') ? 'active' : ''}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/deposit" className={isActive('/deposit') ? 'active' : ''}>
                Deposit
              </Link>
            </li>
            <li>
              <Link to="/borrow" className={isActive('/borrow') ? 'active' : ''}>
                Borrow
              </Link>
            </li>
            <li>
              <Link to="/repay" className={isActive('/repay') ? 'active' : ''}>
                Repay
              </Link>
            </li>
            <li>
              <Link to="/withdraw" className={isActive('/withdraw') ? 'active' : ''}>
                Withdraw
              </Link>
            </li>
            <li>
              <Link to="/liquidate" className={isActive('/liquidate') ? 'active' : ''}>
                Liquidate
              </Link>
            </li>
          </ul>
        </div>

        <div className="navbar-end">
          {activeAddress ? (
            <button className="btn btn-primary btn-sm" onClick={toggleWalletModal}>
              {ellipseAddress(activeAddress)}
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={toggleWalletModal}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </>
  )
}

export default Navigation
