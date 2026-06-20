import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { twinAPI } from '../services/api'
import { ScoreRing, ScoreBar, SkeletonDashboard, PageHeader, EmptyState, SkillChip } from '../components/UI'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
         LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { Cpu, FileText, Map, Zap, ArrowRight, TrendingUp, Shield,
         Target, Award, ChevronRight, BarChart2 } from 'lucide-react'
import clsx from 'clsx'

const QUICK_ACTIONS = [
  { to: '/roadmap',    icon: Map,     label: 'Generate Roadmap', desc: '30/60/90-day plan', color: 'text-primary-400',  bg: 'bg-primary-500/10' },
  { to: '/simulation', icon: Zap,     label: 'Run Simulation',   desc: 'What-if scenarios',  color: 'text-warning-400',  bg: 'bg-warning-500/10' },
  { to: '/company',    icon: Target,  label: 'Match Companies',  desc: 'Check your fit',     color: 'text-success-400',  bg: 'bg-success-500/10' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [twin, setTwin] = useState(null)
  const [snapshots, setSnapshots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      twinAPI.getMe().then(r => setTwin(r.data)).catch(() => {}),
      twinAPI.getSnapshots().then(r => setSnapshots(r.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const radarData = twin ? [
    { subject: 'Technical',  A: twin.category_scores.technical },
    { subject: 'Projects',   A: twin.category_scores.projects },
    { subject: 'DSA',        A: twin.category_scores.dsa },
    { subject: 'Industry',   A: twin.category_scores.industry_relevance },
    { subject: 'Resume',     A: twin.category_scores.resume_quality },
    { subject: 'Experience', A: twin.category_scores.experience },
  ] : []

  const chartData = snapshots.map(s => ({
    date: new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    score: Math.round(s.score),
  }))

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return <SkeletonDashboard />

  if (!twin) {
    return (
      <div>
        <PageHeader
          title={`${greeting()}, ${user?.full_name?.split(' ')[0]} 👋`}
          subtitle="Let's build your Digital Career Twin"
        />

        {/* Onboarding checklist */}
        <div className="card mb-5" style={{ borderColor: 'rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.04)' }}>
          <p className="text-sm font-semibold text-primary-300 mb-4">🚀 Get started — 3 steps to your Career Twin</p>
          <div className="space-y-3">
            {[
              { step: 1, label: 'Upload your resume', to: '/resume', done: false },
              { step: 2, label: 'Generate your Digital Twin', to: '/twin', done: false },
              { step: 3, label: 'Explore your roadmap', to: '/roadmap', done: false },
            ].map(item => (
              <Link key={item.step} to={item.to}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/2 hover:bg-white/4 border border-white/4 hover:border-white/8 transition-all group">
                <div className="w-8 h-8 rounded-full bg-dark-700 border border-white/8 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                  {item.step}
                </div>
                <span className="text-sm text-slate-300 flex-1">{item.label}</span>
                <ArrowRight size={15} className="text-slate-600 group-hover:text-primary-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        <EmptyState
          icon={Cpu}
          color="cyan"
          title="Digital Twin not created yet"
          description="Upload your resume first, then generate your AI-powered Digital Twin to see your Employability Score, skill gaps, and personalized roadmap."
          action={
            <div className="flex gap-3">
              <Link to="/resume" className="btn btn-secondary btn-sm">
                <FileText size={14} /> Upload Resume
              </Link>
              <Link to="/twin" className="btn btn-primary btn-sm">
                <Cpu size={14} /> Generate Twin
              </Link>
            </div>
          }
        />
      </div>
    )
  }

  const topGaps = (twin.missing_skills || []).slice(0, 4)
  const scoreColor = twin.employability_score >= 70 ? 'text-success-400' : twin.employability_score >= 45 ? 'text-warning-400' : 'text-danger-400'

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title={`${greeting()}, ${user?.full_name?.split(' ')[0]} 👋`}
        subtitle={`Targeting: ${user?.target_role || 'Set your target role in Profile'}`}
        action={
          <Link to="/twin" className="btn btn-secondary btn-sm">
            <Cpu size={14} /> Refresh Twin
          </Link>
        }
      />

      {/* Score Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Main score */}
        <div className="card flex flex-col items-center justify-center py-6 md:py-8">
          <ScoreRing
            score={twin.employability_score}
            size={150}
            label="Employability Score"
          />
        </div>

        {/* Radar chart */}
        <div className="card md:col-span-2">
          <p className="text-sm font-medium text-slate-400 mb-4">Skill Dimension Radar</p>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject"
                tick={{ fill: '#64748B', fontSize: 11 }} />
              <Radar dataKey="A" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress chart */}
      {chartData.length > 1 && (
        <div className="card">
          <p className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-success-400" /> Score History
          </p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0,100]} hide />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5}
                dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#60A5FA' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category scores */}
      <div className="card">
        <p className="text-sm font-medium text-slate-400 mb-5">Category Breakdown</p>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(twin.category_scores).map(([k, v]) => (
            <ScoreBar key={k}
              label={k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
              score={v}
            />
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, color, bg }) => (
          <Link key={to} to={to} className="card-hover group">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-4', bg)}>
              <Icon size={20} className={color} />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{label}</h3>
            <p className="text-xs text-slate-600 mb-3">{desc}</p>
            <div className="flex items-center gap-1 text-xs text-primary-400">
              Go <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Gaps + Strengths */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-sm font-semibold text-danger-400 mb-4 flex items-center gap-2">
            <Shield size={14} /> Top Skill Gaps
          </p>
          {topGaps.length > 0 ? (
            <div className="space-y-3">
              {topGaps.map((s, i) => {
                const name = typeof s === 'object' ? s.name : s
                const boost = typeof s === 'object' ? s.employability_boost : null
                return (
                  <div key={i} className="flex items-center justify-between">
                    <SkillChip name={name} type={s.importance === 'critical' ? 'critical' : 'missing'} />
                    {boost && <span className="text-success-400 text-xs font-mono font-semibold">+{boost}%</span>}
                  </div>
                )
              })}
              <Link to="/twin" className="text-xs text-primary-400 hover:text-primary-300 mt-2 inline-block">
                View all gaps →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No significant gaps detected.</p>
          )}
        </div>

        <div className="card">
          <p className="text-sm font-semibold text-success-400 mb-4 flex items-center gap-2">
            <Award size={14} /> Your Strengths
          </p>
          <ul className="space-y-2">
            {(twin.strengths || []).slice(0,4).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-success-500 mt-0.5 flex-shrink-0">✓</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
