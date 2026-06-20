import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Briefcase, Eye, EyeOff, ArrowRight } from 'lucide-react'

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#070B14' }}>
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-600/30 mb-4">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="card-glass">{children}</div>
      </div>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ email: '', password: '' })
  const [show, setShow]   = useState(false)
  const [busy, setBusy]   = useState(false)

  const handle = async e => {
    e.preventDefault()
    setBusy(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password')
    } finally { setBusy(false) }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your CareerTwin">
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="label">Email address</label>
          <input className="input" type="email" placeholder="you@college.edu"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-10" type={show ? 'text' : 'password'}
              placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            <button type="button" onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center mt-2">
          {busy ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600 mt-5">
        No account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </AuthShell>
  )
}

export function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ email: '', full_name: '', password: '', target_role: '' })
  const [busy, setBusy] = useState(false)

  const ROLES = ['Java Backend Developer','Full Stack Developer','DevOps Engineer',
                 'Data Engineer','AI/ML Engineer','Frontend Developer','Cloud Engineer']

  const handle = async e => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setBusy(true)
    try {
      await register(form)
      toast.success('Account created! Let\'s set up your profile.')
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setBusy(false) }
  }

  return (
    <AuthShell title="Create your Twin" subtitle="Start your AI career journey">
      <form onSubmit={handle} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input className="input" placeholder="Rahul Sharma"
            value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Email address</label>
          <input className="input" type="email" placeholder="you@college.edu"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="Min 6 characters"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Target Role <span className="text-slate-600">(optional)</span></label>
          <select className="input" value={form.target_role}
            onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))}>
            <option value="">Select your target role</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary w-full justify-center mt-2">
          {busy ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</> : <>Create Digital Twin <ArrowRight size={15} /></>}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600 mt-5">
        Have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign in</Link>
      </p>
    </AuthShell>
  )
}

export default Login
