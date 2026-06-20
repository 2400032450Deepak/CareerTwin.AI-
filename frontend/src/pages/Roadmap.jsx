// ─── Roadmap.jsx ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { roadmapAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Map, BookOpen, Code2, Award, Zap, Clock, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { PageHeader, AILoader, EmptyState, Spinner } from '../components/UI'
import clsx from 'clsx'

const TYPE_META = {
  skill:         { icon: Zap,      color: 'badge-blue',  label: 'Skill' },
  project:       { icon: Code2,    color: 'badge-cyan',  label: 'Project' },
  dsa:           { icon: Code2,    color: 'badge-amber', label: 'DSA' },
  certification: { icon: Award,    color: 'badge-green', label: 'Cert' },
  course:        { icon: BookOpen, color: 'badge-gray',  label: 'Course' },
}
const PLANS = [
  { key: '30_day', label: '30 Days', color: 'text-success-400' },
  { key: '60_day', label: '60 Days', color: 'text-warning-400' },
  { key: '90_day', label: '90 Days', color: 'text-primary-400' },
]

function TaskCard({ task }) {
  const [open, setOpen] = useState(false)
  const meta = TYPE_META[task.type] || TYPE_META.skill
  return (
    <div className="card-elevated border border-white/5 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center gap-3 p-4 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-slate-200">{task.title}</span>
            <span className={clsx('badge', meta.color)}>{meta.label}</span>
            <span className={clsx('badge', task.priority === 'high' ? 'badge-rose' : task.priority === 'medium' ? 'badge-amber' : 'badge-gray')}>
              {task.priority}
            </span>
          </div>
          <p className="text-xs text-slate-600">{task.day_range} · ~{task.estimated_hours}h</p>
        </div>
        {open ? <ChevronUp size={14} className="text-slate-700 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-700 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2">
          <p className="text-sm text-slate-400 leading-relaxed">{task.description}</p>
          {task.impact && <p className="text-xs text-success-400 flex items-center gap-1"><Zap size={11} />{task.impact}</p>}
          {task.resource && (
            <a href={task.resource.startsWith('http') ? task.resource : '#'} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-400 hover:underline">📚 {task.resource}</a>
          )}
        </div>
      )}
    </div>
  )
}

export function Roadmap() {
  const [active,    setActive]    = useState('30_day')
  const [roadmaps,  setRoadmaps]  = useState({})
  const [loading,   setLoading]   = useState(true)
  const [aiStep,    setAiStep]    = useState(0)
  const [generating,setGenerating]= useState(false)
  const AI_STEPS = ['Analyzing your skill gaps…','Planning weekly milestones…','Selecting resources…','Building your roadmap…']

  useEffect(() => {
    roadmapAPI.getHistory().then(res => {
      const m = {}
      res.data.forEach(r => { if (!m[r.plan_type]) m[r.plan_type] = r })
      setRoadmaps(m)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    setGenerating(true); setAiStep(0)
    const t = setInterval(() => setAiStep(s => Math.min(s + 1, AI_STEPS.length - 1)), 3000)
    try {
      const res = await roadmapAPI.generate(active)
      setRoadmaps(p => ({ ...p, [active]: res.data }))
      toast.success('Roadmap generated! 🗺️')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed. Generate your Digital Twin first.') }
    finally { clearInterval(t); setGenerating(false) }
  }

  const current = roadmaps[active]
  const byWeek  = current?.tasks?.reduce((acc, t) => {
    const w = `Week ${t.week}`; if (!acc[w]) acc[w] = []; acc[w].push(t); return acc
  }, {}) || {}

  return (
    <div>
      <PageHeader title="AI Roadmap Generator" subtitle="Personalized 30/60/90-day learning plans"
        icon={Map} color="#A78BFA"
        action={<button onClick={generate} disabled={generating} className="btn btn-primary btn-sm">
          {generating ? <Spinner size={14} color="border-white" /> : <Map size={14} />}
          {generating ? 'Generating…' : `Generate ${active.replace('_day','-day')}`}
        </button>}
      />
      <div className="flex gap-2 mb-6">
        {PLANS.map(p => (
          <button key={p.key} onClick={() => setActive(p.key)}
            className={clsx('px-4 py-2 rounded-xl text-sm font-medium border transition-all',
              active === p.key ? `${p.color} border-current bg-white/4` : 'border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/16'
            )}>
            {p.label} {roadmaps[p.key] && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-success-500 inline-block align-middle" />}
          </button>
        ))}
      </div>
      {generating && <AILoader steps={AI_STEPS} current={aiStep} />}
      {!generating && loading && <div className="flex justify-center py-16"><Spinner size={32} /></div>}
      {!generating && !loading && !current && (
        <EmptyState icon={Map} color="primary" title={`No ${active.replace('_day','-day')} plan yet`}
          description="Generate a personalized roadmap based on your skill gaps."
          action={<button onClick={generate} className="btn btn-primary btn-sm">Generate Roadmap</button>} />
      )}
      {!generating && current && (
        <div className="space-y-6 animate-in">
          <div className="grid grid-cols-3 gap-4">
            {[['Total Tasks', current.total_tasks, 'text-white'],
              ['Est. Hours', current.tasks?.reduce((s,t)=>s+(t.estimated_hours||0),0)||0, 'text-primary-400'],
              ['Weeks', Object.keys(byWeek).length, 'text-success-400']
            ].map(([l,v,c]) => (
              <div key={l} className="card text-center py-5">
                <p className={clsx('stat-number text-3xl font-bold', c)}>{v}</p>
                <p className="text-xs text-slate-600 mt-1">{l}</p>
              </div>
            ))}
          </div>
          {Object.entries(byWeek).map(([week, tasks]) => (
            <div key={week}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-dark-700 border border-white/8 flex items-center justify-center">
                  <Clock size={14} className="text-primary-400" />
                </div>
                <h3 className="font-semibold text-slate-200">{week}</h3>
                <span className="text-xs text-slate-600">· {tasks.length} tasks</span>
              </div>
              <div className="space-y-2 pl-11">
                {tasks.map((t, i) => <TaskCard key={i} task={t} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Simulation.jsx ───────────────────────────────────────────────────────────
import { simulationAPI } from '../services/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer as RC } from 'recharts'
import { Zap as ZapIcon, Send, History, TrendingUp as TrendingUpIcon } from 'lucide-react'

const PRESETS = [
  'What if I learn Docker and Kubernetes?',
  'What if I complete AWS Solutions Architect?',
  'What if I solve 200 LeetCode problems?',
  'What if I build a Kafka-based project?',
  'What if I contribute to open source?',
  'What if I add Redis to my projects?',
]

function SimCard({ sim }) {
  const improvement = Number(sim.improvement || 0).toFixed(1)
  const chartData = sim.milestones?.map(m => ({ week: `W${m.week}`, score: Math.round(m.expected_score) })) || []
  return (
    <div className="card space-y-4 animate-in">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-200 leading-relaxed flex-1">{sim.scenario}</p>
        <span className={clsx('stat-number text-2xl font-bold flex-shrink-0', Number(improvement) > 0 ? 'text-success-400' : 'text-danger-400')}>+{improvement}%</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[['Current', Math.round(sim.current_score||0), 'text-slate-300'],
          ['Projected', Math.round(sim.projected_score||0), 'text-success-400'],
          ['Timeline', `${sim.timeline_weeks}w`, 'text-primary-400']
        ].map(([l,v,c]) => (
          <div key={l} className="card-elevated p-3 text-center">
            <p className="text-2xs text-slate-600 mb-1">{l}</p>
            <p className={clsx('stat-number font-bold text-lg', c)}>{v}</p>
          </div>
        ))}
      </div>
      {chartData.length > 1 && (
        <RC width="100%" height={90}>
          <AreaChart data={chartData}>
            <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient></defs>
            <XAxis dataKey="week" tick={{ fill:'#475569', fontSize:10 }} axisLine={false} tickLine={false} />
            <RTooltip />
            <Area type="monotone" dataKey="score" stroke="#3B82F6" fill="url(#g)" strokeWidth={2} />
          </AreaChart>
        </RC>
      )}
      {sim.reasoning && <p className="text-sm text-slate-500 leading-relaxed border-t border-white/5 pt-3">{sim.reasoning}</p>}
      {sim.key_actions?.length > 0 && (
        <div><p className="text-xs text-slate-600 uppercase tracking-wider mb-2">Key Actions</p>
          {sim.key_actions.slice(0,3).map((a,i) => (
            <p key={i} className="text-sm text-slate-400 flex items-start gap-2 mb-1">
              <span className="text-primary-500 mt-0.5 flex-shrink-0">→</span>{a}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export function Simulation() {
  const [scenario, setScenario] = useState('')
  const [result,   setResult]   = useState(null)
  const [history,  setHistory]  = useState([])
  const [running,  setRunning]  = useState(false)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    simulationAPI.getHistory().then(r => setHistory(r.data||[])).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const run = async () => {
    if (!scenario.trim()) return toast.error('Enter a scenario first')
    setRunning(true); setResult(null)
    try {
      const res = await simulationAPI.run({ scenario: scenario.trim() })
      setResult(res.data); setHistory(p => [res.data, ...p.slice(0,9)])
      toast.success('Simulation complete!')
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed — generate your Digital Twin first.') }
    finally { setRunning(false) }
  }

  return (
    <div>
      <PageHeader title="Career Simulation Engine" subtitle="Predict your future score with 'What If' scenarios" icon={ZapIcon} color="#FBB124" />
      <div className="card mb-6">
        <label className="label mb-2">Describe your scenario</label>
        <div className="flex gap-3">
          <textarea className="input flex-1 resize-none" rows={2}
            placeholder='"What if I learn Docker and get AWS certified?"'
            value={scenario} onChange={e => setScenario(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter'&&!e.shiftKey){e.preventDefault();run()} }} />
          <button onClick={run} disabled={running||!scenario.trim()} className="btn btn-primary self-start">
            {running ? <Spinner size={15} color="border-white"/> : <Send size={15}/>}
            {running ? 'Running…' : 'Run'}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs text-slate-600 mb-2">Quick scenarios:</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p} onClick={() => setScenario(p)}
                className="text-xs bg-white/4 hover:bg-white/8 text-slate-500 hover:text-slate-300 px-3 py-1.5 rounded-full transition-all border border-white/5">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      {running && <AILoader steps={['Analyzing profile…','Calculating impact…','Building timeline…','Generating milestones…']} current={0} />}
      {result && !running && (
        <div className="mb-5">
          <p className="text-xs text-slate-600 mb-3 flex items-center gap-1"><TrendingUpIcon size={12}/> Latest Result</p>
          <SimCard sim={result} />
        </div>
      )}
      {!loading && history.length > 0 && (
        <div>
          <p className="text-xs text-slate-600 mb-3 flex items-center gap-1"><History size={12}/> Previous Simulations</p>
          <div className="space-y-4">
            {history.slice(result?1:0, 6).map((s,i) => <SimCard key={s.id||i} sim={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CompanyMatch.jsx ─────────────────────────────────────────────────────────
import { companyAPI } from '../services/api'
import { Building2, Search, CheckCircle as CheckIcon, XCircle, Lightbulb as LightIcon } from 'lucide-react'

const COMPANIES = [
  {n:'Amazon',    e:'🟠'},{n:'Google',    e:'🔵'},{n:'Flipkart',e:'🟡'},{n:'Razorpay',e:'🟣'},
  {n:'Paytm',     e:'🔵'},{n:'Swiggy',    e:'🟠'},{n:'Zomato',  e:'🔴'},{n:'CRED',    e:'⚫'},
  {n:'PhonePe',   e:'🟣'},{n:'Meesho',    e:'🟢'},{n:'Atlassian',e:'🔵'},{n:'Microsoft',e:'⬛'},
]

function ScoreArc({ score }) {
  const c = score>=75?'#10B981':score>=50?'#F59E0B':'#F43F5E'
  const label = score>=75?'Strong Match':score>=50?'Moderate Match':'Needs Work'
  return (
    <div className="flex flex-col items-center py-6">
      <svg width={180} height={110} viewBox="0 0 180 110">
        <path d="M 10 95 A 80 80 0 0 1 170 95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round"/>
        <path d="M 10 95 A 80 80 0 0 1 170 95" fill="none" stroke={c} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={`${(score/100)*251.2} 251.2`} style={{transition:'stroke-dasharray 1s ease'}}/>
      </svg>
      <div style={{marginTop:-60}} className="text-center">
        <p className="stat-number text-5xl font-extrabold" style={{color:c}}>{Math.round(score)}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  )
}

export function CompanyMatch() {
  const [co,      setCo]      = useState('')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)

  const match = async (name) => {
    const t = name||co.trim(); if(!t) return toast.error('Enter a company')
    setLoading(true); setResult(null)
    try {
      const res = await companyAPI.match({company_name:t}); setResult(res.data)
    } catch(err){ toast.error(err.response?.data?.detail||'Failed — upload resume first.') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Company Match Engine" subtitle="Get your compatibility score for any tech company" icon={Building2} color="#FB7185" />
      <div className="card mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"/>
            <input className="input pl-9" placeholder="Type any company…" value={co}
              onChange={e=>setCo(e.target.value)} onKeyDown={e=>e.key==='Enter'&&match()}/>
          </div>
          <button onClick={()=>match()} disabled={loading||!co.trim()} className="btn btn-primary">
            {loading?<Spinner size={14} color="border-white"/>:<Building2 size={14}/>}
            {loading?'Analyzing…':'Match'}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs text-slate-600 mb-2">Popular:</p>
          <div className="flex flex-wrap gap-2">
            {COMPANIES.map(c=>(
              <button key={c.n} onClick={()=>match(c.n)} disabled={loading}
                className="flex items-center gap-1.5 bg-white/4 hover:bg-white/8 border border-white/5 text-slate-400 hover:text-slate-200 text-sm px-3 py-1.5 rounded-full transition-all disabled:opacity-40">
                <span>{c.e}</span>{c.n}
              </button>
            ))}
          </div>
        </div>
      </div>
      {loading && <AILoader steps={['Reading your profile…','Checking company requirements…','Calculating compatibility…']} current={0} />}
      {result && !loading && (
        <div className="space-y-4 animate-in">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{COMPANIES.find(c=>c.n.toLowerCase()===result.company?.toLowerCase())?.e||'🏢'}</span>
              <div><p className="font-bold text-white text-xl">{result.company}</p><p className="text-xs text-slate-500">Compatibility Analysis</p></div>
            </div>
            <ScoreArc score={result.compatibility_score}/>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="card">
              <p className="text-sm font-semibold text-success-400 mb-3 flex items-center gap-2"><CheckIcon size={14}/>Matching Skills</p>
              <div className="flex flex-wrap gap-2">{result.matching_skills?.map(s=><SkillChip key={s} name={s} type="success"/>)||<p className="text-sm text-slate-600">None detected</p>}</div>
            </div>
            <div className="card">
              <p className="text-sm font-semibold text-danger-400 mb-3 flex items-center gap-2"><XCircle size={14}/>Missing Skills</p>
              <div className="flex flex-wrap gap-2">{result.missing_skills?.map(s=><SkillChip key={s} name={s} type="missing"/>)||<p className="text-sm text-slate-600">No critical gaps!</p>}</div>
            </div>
          </div>
          {result.suggestions?.length>0&&(
            <div className="card">
              <p className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><LightIcon size={14} className="text-warning-400"/>Improvement Plan</p>
              {result.suggestions.map((s,i)=>(
                <p key={i} className="text-sm text-slate-400 flex items-start gap-2 mb-2">
                  <span className="text-primary-500 font-bold mt-0.5 flex-shrink-0">{i+1}.</span>{s}
                </p>
              ))}
            </div>
          )}
          {result.interview_tips?.length>0&&(
            <div className="card" style={{borderColor:'rgba(59,130,246,0.2)'}}>
              <p className="text-sm font-semibold text-white mb-3">🎯 Interview Tips for {result.company}</p>
              {result.interview_tips.map((t,i)=>(
                <p key={i} className="text-sm text-slate-400 flex items-start gap-2 mb-2">
                  <span className="text-success-500 mt-0.5 flex-shrink-0">✓</span>{t}
                </p>
              ))}
            </div>
          )}
          {result.reasoning&&<div className="card-elevated p-4"><p className="text-xs text-slate-600 mb-1">AI Analysis</p><p className="text-sm text-slate-400 leading-relaxed">{result.reasoning}</p></div>}
        </div>
      )}
    </div>
  )
}

// ─── Interview.jsx ────────────────────────────────────────────────────────────
import { interviewAPI } from '../services/api'
import { MessageSquare, Plus, X, ChevronDown as CD, ChevronUp as CU } from 'lucide-react'

export function Interview() {
  const [history, setHistory]  = useState([])
  const [loading, setLoading]  = useState(true)
  const [showForm,setShowForm] = useState(false)
  const [saving,  setSaving]   = useState(false)
  const [form,    setForm]     = useState({ company:'',role:'',outcome:'',overall_feedback:'',technical_rating:'',communication_rating:'',behavioral_rating:'' })

  useEffect(()=>{
    interviewAPI.getHistory().then(r=>setHistory(r.data||[])).catch(()=>{}).finally(()=>setLoading(false))
  },[])

  const save = async () => {
    if(!form.company||!form.outcome) return toast.error('Company and outcome are required')
    setSaving(true)
    try {
      await interviewAPI.log({...form,rounds:[],technical_rating:Number(form.technical_rating)||null,communication_rating:Number(form.communication_rating)||null,behavioral_rating:Number(form.behavioral_rating)||null})
      toast.success('Interview logged!')
      setShowForm(false)
      const r = await interviewAPI.getHistory(); setHistory(r.data||[])
      setForm({company:'',role:'',outcome:'',overall_feedback:'',technical_rating:'',communication_rating:'',behavioral_rating:''})
    } catch(err){toast.error(err.response?.data?.detail||'Failed')}
    finally{setSaving(false)}
  }

  const OUTCOMES = [{v:'cleared',l:'Cleared ✅'},{v:'rejected',l:'Rejected ❌'},{v:'pending',l:'Pending ⏳'},{v:'no_show',l:'No Show'}]
  const outcomeColor = o => o==='cleared'?'badge-green':o==='rejected'?'badge-rose':o==='pending'?'badge-amber':'badge-gray'

  return (
    <div>
      <PageHeader title="Interview Tracker" subtitle="Log experiences, detect patterns, improve"
        icon={MessageSquare} color="#38BDF8"
        action={<button onClick={()=>setShowForm(v=>!v)} className="btn btn-primary btn-sm">
          {showForm?<X size={14}/>:<Plus size={14}/>} {showForm?'Cancel':'Log Interview'}
        </button>}
      />
      {showForm && (
        <div className="card mb-6 animate-in">
          <p className="text-sm font-semibold text-slate-200 mb-5">Log New Interview</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Company *</label><input className="input" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} placeholder="Amazon, Flipkart…"/></div>
            <div><label className="label">Role</label><input className="input" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} placeholder="SDE-1, Backend Engineer…"/></div>
            <div><label className="label">Outcome *</label>
              <select className="input" value={form.outcome} onChange={e=>setForm(f=>({...f,outcome:e.target.value}))}>
                <option value="">Select outcome</option>
                {OUTCOMES.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div><label className="label">Technical Rating (1-10)</label><input className="input" type="number" min="1" max="10" value={form.technical_rating} onChange={e=>setForm(f=>({...f,technical_rating:e.target.value}))} placeholder="7"/></div>
            <div><label className="label">Communication Rating</label><input className="input" type="number" min="1" max="10" value={form.communication_rating} onChange={e=>setForm(f=>({...f,communication_rating:e.target.value}))} placeholder="8"/></div>
            <div><label className="label">Behavioral Rating</label><input className="input" type="number" min="1" max="10" value={form.behavioral_rating} onChange={e=>setForm(f=>({...f,behavioral_rating:e.target.value}))} placeholder="6"/></div>
          </div>
          <div className="mt-4"><label className="label">Overall Feedback / Notes</label>
            <textarea className="input" rows={3} value={form.overall_feedback} onChange={e=>setForm(f=>({...f,overall_feedback:e.target.value}))} placeholder="What questions were asked? What went well? What to improve?"/>
          </div>
          <button onClick={save} disabled={saving} className="btn btn-primary btn-sm mt-4">
            {saving?<Spinner size={14} color="border-white"/>:<Plus size={14}/>} {saving?'Saving…':'Save Interview'}
          </button>
        </div>
      )}
      {loading && <div className="flex justify-center py-16"><Spinner size={32}/></div>}
      {!loading && history.length === 0 && (
        <EmptyState icon={MessageSquare} color="cyan" title="No interviews logged yet"
          description="Log your interview experiences to detect patterns and improve your preparation."
          action={<button onClick={()=>setShowForm(true)} className="btn btn-primary btn-sm"><Plus size={14}/>Log First Interview</button>}/>
      )}
      {!loading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((iv,i)=>(
            <div key={iv.id||i} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-200">{iv.company}</p>
                    {iv.role&&<span className="text-xs text-slate-600">· {iv.role}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx('badge', outcomeColor(iv.outcome))}>{iv.outcome}</span>
                    <span className="text-xs text-slate-600">{new Date(iv.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                {iv.technical_rating&&(
                  <div className="text-right">
                    <p className="text-xs text-slate-600 mb-1">Technical</p>
                    <p className={clsx('stat-number font-bold', iv.technical_rating>=7?'text-success-400':iv.technical_rating>=5?'text-warning-400':'text-danger-400')}>{iv.technical_rating}/10</p>
                  </div>
                )}
              </div>
              {iv.overall_feedback&&<p className="text-sm text-slate-500 mt-3 leading-relaxed border-t border-white/5 pt-3">{iv.overall_feedback}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Profile.jsx ──────────────────────────────────────────────────────────────
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Save, Github, Linkedin, Code2, User, Briefcase as BriefcaseIcon, GraduationCap } from 'lucide-react'

export function Profile() {
  const { user, updateUser } = useAuth()
  const [form,  setForm]  = useState({
    full_name: user?.full_name||'', target_role: user?.target_role||'',
    github_url: user?.github_url||'', linkedin_url: user?.linkedin_url||'',
    leetcode_username: user?.leetcode_username||'', college: user?.college||'',
    graduation_year: user?.graduation_year||'', experience_years: user?.experience_years||0,
  })
  const [saving, setSaving] = useState(false)
  const ROLES = ['Java Backend Developer','Full Stack Developer','DevOps Engineer','Data Engineer','AI/ML Engineer','Frontend Developer','Cloud Engineer','Site Reliability Engineer']

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const res = await authAPI.update(form); updateUser(res.data); toast.success('Profile updated!')
    } catch(err){toast.error(err.response?.data?.detail||'Update failed')}
    finally{setSaving(false)}
  }

  const s = k => e => setForm(f=>({...f,[k]:e.target.value}))

  return (
    <div>
      <PageHeader title="Profile Settings" subtitle="Keep your profile updated for accurate AI analysis" icon={User} color="#60A5FA" />
      <form onSubmit={save} className="space-y-5 max-w-xl">
        <div className="card">
          <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><User size={14} className="text-primary-400"/>Personal</p>
          <div className="space-y-4">
            <div><label className="label">Full Name</label><input className="input" value={form.full_name} onChange={s('full_name')} placeholder="Your full name"/></div>
            <div><label className="label">Email</label><input className="input opacity-40 cursor-not-allowed" value={user?.email} disabled/></div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><BriefcaseIcon size={14} className="text-primary-400"/>Career</p>
          <div className="space-y-4">
            <div><label className="label">Target Role</label>
              <select className="input" value={form.target_role} onChange={s('target_role')}>
                <option value="">Select role</option>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="label">Experience</label>
              <select className="input" value={form.experience_years} onChange={s('experience_years')}>
                {[0,1,2,3,4,5].map(y=><option key={y} value={y}>{y===0?'Fresher (0 years)':`${y} year${y>1?'s':''}`}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><GraduationCap size={14} className="text-primary-400"/>Education</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="label">College</label><input className="input" value={form.college} onChange={s('college')} placeholder="IIT, NIT, BITS…"/></div>
            <div><label className="label">Graduation Year</label>
              <select className="input" value={form.graduation_year} onChange={s('graduation_year')}>
                <option value="">Year</option>{[2024,2025,2026,2027,2028].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-slate-300 mb-4">Profile Links</p>
          <div className="space-y-4">
            <div><label className="label flex items-center gap-1.5"><Github size={12}/>GitHub URL</label><input className="input" value={form.github_url} onChange={s('github_url')} placeholder="https://github.com/username"/></div>
            <div><label className="label flex items-center gap-1.5"><Linkedin size={12}/>LinkedIn URL</label><input className="input" value={form.linkedin_url} onChange={s('linkedin_url')} placeholder="https://linkedin.com/in/you"/></div>
            <div><label className="label flex items-center gap-1.5"><Code2 size={12}/>LeetCode Username</label><input className="input" value={form.leetcode_username} onChange={s('leetcode_username')} placeholder="your_username"/></div>
          </div>
        </div>
        <div className="card-elevated p-4 border border-primary-500/20">
          <p className="text-sm text-primary-300">💡 After updating, regenerate your Digital Twin for accurate scores.</p>
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving?<Spinner size={14} color="border-white"/>:<Save size={14}/>}{saving?'Saving…':'Save Changes'}
        </button>
      </form>
    </div>
  )
}

export default Roadmap
