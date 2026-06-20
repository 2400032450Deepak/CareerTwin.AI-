import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Resume from './pages/Resume'
import DigitalTwin from './pages/DigitalTwin'
import Roadmap from './pages/Roadmap'
import Simulation from './pages/Simulation'
import CompanyMatch from './pages/CompanyMatch'
import Interview from './pages/Interview'
import Profile from './pages/Profile'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B14' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="resume"     element={<Resume />} />
        <Route path="twin"       element={<DigitalTwin />} />
        <Route path="roadmap"    element={<Roadmap />} />
        <Route path="simulation" element={<Simulation />} />
        <Route path="company"    element={<CompanyMatch />} />
        <Route path="interview"  element={<Interview />} />
        <Route path="profile"    element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
