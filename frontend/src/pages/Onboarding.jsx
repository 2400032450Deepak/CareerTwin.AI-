import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Briefcase, User, Target, Github, ArrowRight, Check, Linkedin, Code2 } from 'lucide-react'
import clsx from 'clsx'

const ROLES = [
  'Java Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
  'Data Engineer', 'AI/ML Engineer', 'Frontend Developer',
  'Cloud Engineer', 'Mobile Developer', 'Site Reliability Engineer',
]

const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Target Role', icon: Target },
  { label: 'Profiles', icon: Github },
  { label: 'Ready', icon: Check },
]

export default function Onboarding() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name:         user?.full_name || '',
    college:           user?.college || '',
    graduation_year:   user?.graduation_year || '',
    experience_years:  user?.experience_years || 0,
    target_role:       user?.target_role || '',
    github_url:        user?.github_url || '',
    linkedin_url:      user?.linkedin_url || '',
    leetcode_username: user?.leetcode_username || '',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const saveAndNext = async () => {
    if (step === STEPS.length - 2) {
      // Save on last real step
      setSaving(true)
      try {
        const res = await authAPI.update(form)
        updateUser(res.data)
      } catch { toast.error('Failed to save — you can update later in Profile') }
      finally { setSaving(false) }
    }
    setStep(s => s + 1)
  }

  const finish = () => navigate('/resume')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: '#070B14' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Briefcase size={17} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">CareerTwin AI</span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={clsx(
                'flex items-center justify-center rounded-full transition-all duration-300 text-xs font-medium',
                i < step  ? 'w-7 h-7 bg-success-500 text-white' :
                i === step ? 'w-7 h-7 bg-primary-600 text-white ring-2 ring-primary-600/30' :
                             'w-7 h-7 bg-dark-700 text-slate-600 border border-white/5'
              )}>
                {i < step ? <Check size={13} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={clsx('w-8 h-0.5 rounded transition-all duration-500',
                  i < step ? 'bg-success-500' : 'bg-white/5'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card-glass slide-up" key={step}>

          {/* Step 0 — Personal info */}
          {step === 0 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Let's set up your profile</h2>
                <p className="text-sm text-slate-500">This helps the AI give you accurate scores</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" value={form.full_name} onChange={set('full_name')} placeholder="Rahul Sharma" />
                </div>
                <div>
                  <label className="label">College / University</label>
                  <input className="input" value={form.college} onChange={set('college')} placeholder="IIT Delhi, NIT Trichy, BITS Pilani…" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Graduation Year</label>
                    <select className="input" value={form.graduation_year} onChange={set('graduation_year')}>
                      <option value="">Select</option>
                      {[2024,2025,2026,2027,2028].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Experience</label>
                    <select className="input" value={form.experience_years} onChange={set('experience_years')}>
                      {[0,1,2,3,4,5].map(y => <option key={y} value={y}>{y === 0 ? 'Fresher' : `${y} yr${y > 1 ? 's' : ''}`}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Target role */}
          {step === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">What role are you targeting?</h2>
                <p className="text-sm text-slate-500">All scores and skill gaps are calibrated for this role</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => setForm(f => ({ ...f, target_role: role }))}
                    className={clsx(
                      'flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all',
                      form.target_role === role
                        ? 'bg-primary-600/15 border-primary-600/40 text-primary-300'
                        : 'border-white/6 text-slate-400 hover:border-white/12 hover:text-slate-200 hover:bg-white/3'
                    )}
                  >
                    {role}
                    {form.target_role === role && <Check size={15} className="text-primary-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Profile links */}
          {step === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Connect your profiles</h2>
                <p className="text-sm text-slate-500">Optional — helps us analyze your projects and DSA skills</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Github size={13} /> GitHub URL
                  </label>
                  <input className="input" value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/yourusername" />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Linkedin size={13} /> LinkedIn URL
                  </label>
                  <input className="input" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/yourprofile" />
                </div>
                <div>
                  <label className="label flex items-center gap-1.5">
                    <Code2 size={13} /> LeetCode Username
                  </label>
                  <input className="input" value={form.leetcode_username} onChange={set('leetcode_username')} placeholder="your_leetcode_username" />
                </div>
                <p className="text-xs text-slate-600">You can add these later in Profile settings.</p>
              </div>
            </div>
          )}

          {/* Step 3 — All done */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-2xl bg-success-500/15 border border-success-500/20 flex items-center justify-center mx-auto mb-5">
                <Check size={28} className="text-success-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">You're all set! 🚀</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Next step: upload your resume PDF. The AI will analyze it and generate your Digital Twin with a full Employability Score.
              </p>
              <div className="card-elevated p-4 text-left mb-6 space-y-2">
                {[
                  'Upload your resume (30 sec)',
                  'AI analyzes and scores it (15 sec)',
                  'Generate your Digital Twin',
                  'See your gaps and roadmap',
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center text-xs flex-shrink-0 font-bold">{i + 1}</div>
                    {s}
                  </div>
                ))}
              </div>
              <button onClick={finish} className="btn btn-primary btn-lg w-full justify-center">
                Upload My Resume <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 3 && (
            <div className={clsx('flex mt-8', step === 0 ? 'justify-end' : 'justify-between')}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost btn-sm">
                  ← Back
                </button>
              )}
              <button
                onClick={saveAndNext}
                disabled={saving || (step === 1 && !form.target_role)}
                className="btn btn-primary btn-sm"
              >
                {saving ? 'Saving…' : step === STEPS.length - 2 ? 'Save & Finish' : 'Continue'}
                {!saving && <ArrowRight size={14} />}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          You can skip any step and update your profile later.
        </p>
      </div>
    </div>
  )
}
