import React from 'react'
import { Outlet } from 'react-router-dom'
import Navigation from './Navigation'

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <Navigation />
      <main>
        <Outlet />
      </main>
      <footer className="footer footer-center p-4 bg-base-100 text-base-content mt-8">
        <div>
          <p>EXOD Vault - Compliance-Aware DeFi Lending on Algorand</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
