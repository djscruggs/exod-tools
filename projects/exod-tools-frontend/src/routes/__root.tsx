import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import Navigation from '../components/Navigation'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
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
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  )
}
