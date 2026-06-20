import { Outlet } from 'react-router-dom'
import { DesktopSidebar, MobileSidebar } from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />
      <MobileSidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-8 pt-16 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
