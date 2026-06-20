import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { resumeAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, AlertCircle, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { PageHeader, SkillChip, AILoader, SkeletonResume, InfoTag } from '../components/UI'
import clsx from 'clsx'

function ImprovementCard({ imp, index }) {
  const [open, setOpen] = useState(index === 0)
  const isObj = imp && typeof imp === 'object'
  const section    = isObj ? imp.section    : ''
  const issue      = isObj ? imp.issue      : ''
  const suggestion = isObj ? imp.suggestion : String(imp)

  return (
    <div className="card-elevated border border-white/5 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-warning-500/15 flex items-center justify-center flex-shrink-0">
            <span className="text-warning-400 text-xs font-bold">{index + 1}</span>
          </div>
          <span className="text-sm font-medium text-slate-200">{section || `Suggestion ${index + 1}`}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-600" /> : <ChevronDown size={15} className="text-slate-600" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-white/5 pt-3">
          {issue && <p className="text-sm text-danger-300 flex items-start gap-2"><AlertCircle size={14} className="mt-0.5 flex-shrink-0" />{issue}</p>}
          <p className="text-sm text-success-300 flex items-start gap-2"><CheckCircle size={14} className="mt-0.5 flex-shrink-0" />{suggestion}</p>
        </div>
      )}
    </div>
  )
}

export default function Resume() {
  const [resume,  setResume]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [aiStep, setAiStep]   = useState(0)

  const AI_STEPS = ['Extracting text from PDF…','Identifying skills and projects…','Running ATS analysis…','Generating improvement report…']

  useEffect(() => {
    resumeAPI.getActive()
      .then(r => setResume(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const onDrop = useCallback(async files => {
    const file = files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    setAiStep(0)
    // Simulate step progress while waiting
    const timer = setInterval(() => setAiStep(s => Math.min(s + 1, AI_STEPS.length - 1)), 3500)
    try {
      const res = await resumeAPI.upload(fd)
      setResume(res.data)
      toast.success('Resume analyzed! 🎉')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Upload failed')
    } finally {
      clearInterval(timer)
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1, disabled: uploading,
  })

  const scoreColor = s => s >= 70 ? 'text-success-400' : s >= 45 ? 'text-warning-400' : 'text-danger-400'
  const scoreLabel = s => s >= 70 ? 'Good'  : s >= 45 ? 'Fair'  : 'Needs Work'

  return (
    <div>
      <PageHeader title="Resume Intelligence" subtitle="AI-powered analysis · ATS scoring · Improvement suggestions" icon={FileText} color="#34D399" />

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'card mb-6 border-2 border-dashed cursor-pointer transition-all duration-200 text-center py-10',
          isDragActive ? 'border-primary-500/60 bg-primary-500/5' : 'border-white/8 hover:border-white/16 hover:bg-white/2',
          uploading && 'pointer-events-none'
        )}
      >
        <input {...getInputProps()} />
        {!uploading ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-dark-700 border border-white/8 flex items-center justify-center mx-auto mb-4">
              <Upload size={22} className="text-slate-500" />
            </div>
            <p className="font-medium text-slate-300 mb-1">
              {isDragActive ? 'Drop your PDF here' : 'Drop your resume PDF here'}
            </p>
            <p className="text-sm text-slate-600">or click to browse · PDF only · Max 5 MB</p>
            {resume && <p className="text-xs text-primary-400 mt-3">← Re-upload to refresh analysis</p>}
          </>
        ) : (
          <AILoader steps={AI_STEPS} current={aiStep} />
        )}
      </div>

      {/* Loading skeleton */}
      {loading && <SkeletonResume />}

      {/* Results */}
      {!loading && resume && (
        <div className="space-y-5 animate-in">
          {/* Score cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Resume Score', value: resume.resume_score },
              { label: 'ATS Score',    value: resume.ats_score },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center py-7">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{label}</p>
                <p className={clsx('stat-number text-5xl font-extrabold', scoreColor(value))}>{Math.round(value)}</p>
                <span className={clsx('badge mt-3', value >= 70 ? 'badge-green' : value >= 45 ? 'badge-amber' : 'badge-rose')}>
                  {scoreLabel(value)}
                </span>
              </div>
            ))}
          </div>

          {/* AI Summary */}
          {resume.ai_summary && (
            <InfoTag text={`💡 ${resume.ai_summary}`} type="info" />
          )}

          {/* Skills detected */}
          {resume.extracted_skills?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <CheckCircle size={15} className="text-success-400" />
                Detected Skills <span className="badge badge-gray ml-1">{resume.extracted_skills.length}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {resume.extracted_skills.map(s => <SkillChip key={s} name={s} type="success" />)}
              </div>
            </div>
          )}

          {/* Missing keywords */}
          {resume.missing_keywords?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <AlertCircle size={15} className="text-danger-400" />
                Missing Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {resume.missing_keywords.map(k => <SkillChip key={k} name={k} type="missing" />)}
              </div>
            </div>
          )}

          {/* Improvements */}
          {resume.improvements?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-3">💡 AI Improvement Suggestions</p>
              <div className="space-y-2">
                {resume.improvements.map((imp, i) => <ImprovementCard key={i} imp={imp} index={i} />)}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.extracted_projects?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-slate-300 mb-4">🛠 Extracted Projects</p>
              <div className="space-y-3">
                {resume.extracted_projects.map((p, i) => (
                  <div key={i} className="card-elevated p-4">
                    <p className="font-medium text-slate-200 mb-1">{p.name || `Project ${i + 1}`}</p>
                    {p.description && <p className="text-sm text-slate-500 mb-2 leading-relaxed">{p.description}</p>}
                    {p.impact && <p className="text-xs text-success-400 mb-2">Impact: {p.impact}</p>}
                    {p.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.technologies.map(t => <SkillChip key={t} name={t} />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {resume.extracted_experience?.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold text-slate-300 mb-4">💼 Experience</p>
              <div className="space-y-3">
                {resume.extracted_experience.map((e, i) => (
                  <div key={i} className="card-elevated p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-slate-200">{e.role}</p>
                        <p className="text-sm text-slate-500">{e.company}</p>
                      </div>
                      {e.duration && <span className="badge badge-gray text-xs">{e.duration}</span>}
                    </div>
                    {e.highlights?.length > 0 && (
                      <ul className="space-y-1">
                        {e.highlights.map((h, j) => (
                          <li key={j} className="text-xs text-slate-500 flex items-start gap-2">
                            <span className="text-slate-700 mt-1">•</span>{h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* No resume yet */}
      {!loading && !resume && !uploading && (
        <div className="card text-center py-10">
          <FileText size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium mb-1">No resume uploaded yet</p>
          <p className="text-sm text-slate-600">Upload your PDF above to get started</p>
        </div>
      )}
    </div>
  )
}
