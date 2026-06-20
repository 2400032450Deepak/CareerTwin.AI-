import { useState, useEffect } from 'react'
import { twinAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Cpu, RefreshCw, TrendingUp, Shield, Lightbulb } from 'lucide-react'
import { PageHeader, ScoreRing, ScoreBar, SkillChip, AILoader, EmptyState, Spinner } from '../components/UI'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

const AI_STEPS = [
  'Reading your resume and profile…',
  'Calculating employability score…',
  'Analyzing skill gaps…',
  'Generating readiness scores…',
  'Building your Digital Twin…',
]

export default function DigitalTwin() {
  const [twin,       setTwin]       = useState(null)
  const [snapshots,  setSnapshots]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [generating, setGenerating] = useState(false)
  const [aiStep,     setAiStep]     = useState(0)

  const load = async () => {
    try {
      const [t, s] = await Promise.all([twinAPI.getMe(), twinAPI.getSnapshots()])
      setTwin(t.data); setSnapshots(s.data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const generate = async () => {
    setGenerating(true); setAiStep(0)
    const timer = setInterval(() => setAiStep(s => Math.min(s + 1, AI_STEPS.length - 1)), 2500)
    try {
      const res = await twinAPI.generate()
      setTwin(res.data)
      const s = await twinAPI.getSnapshots()
      setSnapshots(s.data || [])
      toast.success('Digital Twin updated! 🤖')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed — upload resume first.')
    } finally { clearInterval(timer); setGenerating(false) }
  }

  const chartData = snapshots.map(s => ({
    date:  new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    score: Math.round(s.score),
  }))

  if (loading) return (
    <div>
      <PageHeader title="Digital Twin Engine" subtitle="Your AI career intelligence profile" icon={Cpu} color="#22D3EE" />
      <div className="flex justify-center py-20"><Spinner size={40} /></div>
    </div>
  )

  return (
    <div>
      <PageHeader
        title="Digital Twin Engine"
        subtitle="Your AI career intelligence profile — regenerate anytime"
        action={
          <button onClick={generate} disabled={generating} className="btn btn-primary btn-sm">
            {generating ? <Spinner size={15} color="border-white" /> : <RefreshCw size={14} />}
            {generating ? 'Generating…' : twin ? 'Regenerate' : 'Generate Twin'}
          </button>
        }
      />

      {generating && <AILoader steps={AI_STEPS} current={aiStep} />}

      {!generating && !twin && (
        <EmptyState
          icon={Cpu}
          color="cyan"
          title="Digital Twin not created yet"
          description="Upload your resume, then click Generate Twin to build your AI career profile."
          action={<button onClick={generate} className="btn btn-primary btn-sm">Generate My Twin</button>}
        />
      )}

      {!generating && twin && (
        <div className="space-y-5 animate-in">
          {/* Hero score */}
          <div className="card flex flex-col items-center py-10">
            <ScoreRing score={twin.employability_score} size={180} thickness={14} label="Overall Employability" />
            {twin.score_reasoning && (
              <p className="text-sm text-slate-500 max-w-xl text-center mt-5 leading-relaxed">{twin.score_reasoning}</p>
            )}
          </div>

          {/* Progress history */}
          {chartData.length > 1 && (
            <div className="card">
              <p className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-success-400" /> Score History
              </p>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0,100]} hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5}
                    dot={{ fill: '#3B82F6', r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#60A5FA' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Readiness grid */}
          <div className="card">
            <p className="text-sm font-semibold text-slate-300 mb-5">🎯 Role Readiness Breakdown</p>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(twin.readiness_scores).map(([k, v]) => (
                <ScoreBar key={k}
                  label={k.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
                  score={v}
                />
              ))}
            </div>
          </div>

          {/* Skills & Gaps */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm font-semibold text-success-400 mb-3 flex items-center gap-2">
                <Shield size={14} /> Your Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {twin.detected_skills?.slice(0, 20).map(s => <SkillChip key={s} name={s} type="success" />)}
              </div>
            </div>
            <div className="card">
              <p className="text-sm font-semibold text-danger-400 mb-3 flex items-center gap-2">
                <Shield size={14} /> Skill Gaps
              </p>
              <div className="space-y-2.5">
                {(twin.missing_skills || []).slice(0, 7).map((s, i) => {
                  const name  = typeof s === 'object' ? s.name  : s
                  const boost = typeof s === 'object' ? s.employability_boost : null
                  const imp   = typeof s === 'object' ? s.importance : 'medium'
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <SkillChip name={name} type={imp === 'critical' ? 'critical' : 'missing'} />
                      {boost && <span className="text-success-400 text-xs font-mono font-semibold">+{boost}%</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {twin.recommendations?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Lightbulb size={14} className="text-warning-400" /> AI Recommendations
              </p>
              <div className="space-y-3">
                {twin.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-dark-700 border border-white/4">
                    <span className="w-6 h-6 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                    <p className="text-sm text-slate-400 leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
