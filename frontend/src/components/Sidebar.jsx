import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, FileText, Cpu, Map, Zap, Building2,
  User, LogOut, Briefcase, ChevronRight, Menu, X, MessageSquare
} from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',    color: '#60A5FA' },
  { to: '/resume',     icon: FileText,        label: 'Resume AI',    color: '#34D399' },
  { to: '/twin',       icon: Cpu,             label: 'Digital Twin', color: '#22D3EE' },
  { to: '/roadmap',    icon: Map,             label: 'Roadmap',      color: '#A78BFA' },
  { to: '/simulation', icon: Zap,             label: 'Simulation',   color: '#FBB124' },
  { to: '/company',    icon: Building2,       label: 'Companies',    color: '#FB7185' },
  { to: '/interview',  icon: MessageSquare,   label: 'Interviews',   color: '#38BDF8' },
]

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const initial = user?.full_name?.[0]?.toUpperCase() || '?'

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B9CFF, #2DD4F4)', boxShadow: '0 4px 16px rgba(79,141,255,0.5)' }}>
              <Briefcase size={15} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-white tracking-tight">CareerTwin AI</p>
              <p className="text-2xs text-slate-600">v2.0 · Pro</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="btn-ghost btn-sm p-1.5">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* User profile */}
      <NavLink to="/profile" onClick={onClose}
        className="mx-3 mt-3 px-3 py-3 rounded-xl hover:bg-white/4 transition-all group cursor-pointer border border-transparent hover:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5B9CFF, #A78BFA)', boxShadow: '0 4px 14px rgba(79,141,255,0.4)' }}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.target_role || 'Set your target role →'}</p>
          </div>
          <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto no-scrollbar">
        <p className="px-3 py-2 text-2xs text-slate-600 font-medium uppercase tracking-widest">Navigation</p>
        {NAV.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx('nav-item', isActive && 'active')
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="nav-icon" style={{ color: isActive ? color : undefined }} />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-left hover:text-danger-400 hover:bg-danger-500/8"
        >
          <LogOut className="nav-icon" />
          Sign out
        </button>
      </div>
    </div>
  )
}

// Desktop sidebar
export function DesktopSidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-64 min-h-screen flex-shrink-0"
      style={{ background: 'linear-gradient(180deg, #131A2B 0%, #0F1422 100%)', borderRight: '1px solid rgba(79,141,255,0.12)' }}
    >
      <SidebarContent />
    </aside>
  )
}

// Mobile sidebar (drawer)
export function MobileSidebar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 rounded-xl bg-dark-800 border border-white/8 flex items-center justify-center shadow-lg"
      >
        <Menu size={18} className="text-slate-300" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={clsx(
          'md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #131A2B 0%, #0F1422 100%)', borderRight: '1px solid rgba(79,141,255,0.12)' }}
      >
        <SidebarContent onClose={() => setOpen(false)} />
      </aside>
    </>
  )
}

export default DesktopSidebar
