import clsx from 'clsx'

// ── Score Ring ────────────────────────────────────────────────────────────────
export function ScoreRing({ score = 0, size = 140, thickness = 12, label, sublabel }) {
  const r = (size - thickness) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(score, 100) / 100) * circ
  const color = score >= 70 ? '#10B981' : score >= 45 ? '#F59E0B' : '#F43F5E'
  const grade = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Work'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={thickness}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25,0.46,0.45,0.94)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="stat-number text-3xl font-bold" style={{ color }}>{Math.round(score)}</span>
          <span className="text-2xs text-slate-500 mt-0.5">{grade}</span>
        </div>
      </div>
      {label && <p className="text-sm font-medium text-slate-300">{label}</p>}
      {sublabel && <p className="text-xs text-slate-600">{sublabel}</p>}
    </div>
  )
}

// ── Score Bar ─────────────────────────────────────────────────────────────────
export function ScoreBar({ label, score = 0, className }) {
  const color = score >= 70 ? 'bg-success-500' : score >= 45 ? 'bg-warning-500' : 'bg-danger-500'
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="stat-number text-sm font-semibold text-slate-200">{Math.round(score)}</span>
      </div>
      <div className="score-track">
        <div className={clsx('score-fill', color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ title, value, subtitle, icon: Icon, color = 'text-primary-400', trend }) {
  return (
    <div className="card animate-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">{title}</p>
          <p className={clsx('stat-number text-3xl font-bold', color)}>{value}</p>
          {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-dark-700 border border-white/5 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className={color} />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className={clsx('flex items-center gap-1 mt-3 text-xs font-medium',
          trend >= 0 ? 'text-success-400' : 'text-danger-400'
        )}>
          <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
          <span className="text-slate-600">vs last week</span>
        </div>
      )}
    </div>
  )
}

// ── Skill Chip ────────────────────────────────────────────────────────────────
export function SkillChip({ name, type = 'default' }) {
  const styles = {
    default:  'badge-blue',
    missing:  'badge-rose',
    critical: 'badge-amber',
    success:  'badge-green',
    neutral:  'badge-gray',
  }
  return <span className={clsx('badge', styles[type] || styles.default)}>{name}</span>
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action, compact = false, color = 'primary' }) {
  const glows = {
    primary: { bg: 'rgba(59,130,246,0.12)', ring: 'rgba(59,130,246,0.25)', icon: '#60A5FA', glow: 'rgba(59,130,246,0.25)' },
    success: { bg: 'rgba(16,185,129,0.12)', ring: 'rgba(16,185,129,0.25)', icon: '#34D399', glow: 'rgba(16,185,129,0.25)' },
    warning: { bg: 'rgba(245,158,11,0.12)', ring: 'rgba(245,158,11,0.25)', icon: '#FBB124', glow: 'rgba(245,158,11,0.25)' },
    cyan:    { bg: 'rgba(6,182,212,0.12)',  ring: 'rgba(6,182,212,0.25)',  icon: '#22D3EE', glow: 'rgba(6,182,212,0.25)' },
  }
  const c = glows[color] || glows.primary

  return (
    <div className={clsx('card flex flex-col items-center text-center animate-in relative overflow-hidden',
      compact ? 'py-10' : 'py-20'
    )}>
      {/* ambient glow behind icon */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`, filter: 'blur(20px)' }} />

      {Icon && (
        <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: c.bg, boxShadow: `0 0 0 1px ${c.ring}, 0 8px 24px ${c.glow}` }}>
          <Icon size={28} style={{ color: c.icon }} />
        </div>
      )}
      <h3 className="relative text-base font-semibold text-slate-100 mb-2">{title}</h3>
      {description && <p className="relative text-sm text-slate-500 max-w-xs leading-relaxed mb-6">{description}</p>}
      <div className="relative">{action}</div>
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action, icon: Icon, color = '#3B82F6' }) {
  return (
    <div className="flex items-start justify-between mb-7 gap-4">
      <div className="flex items-start gap-3.5">
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${color}1F`, boxShadow: `0 0 0 1px ${color}33, 0 4px 16px ${color}26` }}>
            <Icon size={18} style={{ color }} />
          </div>
        )}
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
          <div className="h-0.5 w-10 rounded-full mt-2.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ── Skeleton Loading ──────────────────────────────────────────────────────────
export function Skeleton({ className, ...props }) {
  return <div className={clsx('skeleton', className)} {...props} />
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-4/5" />
      <Skeleton className="h-2 w-3/5" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      {/* Main area */}
      <div className="grid md:grid-cols-3 gap-4">
        <Skeleton className="h-64 rounded-2xl md:col-span-1" />
        <Skeleton className="h-64 rounded-2xl md:col-span-2" />
      </div>
    </div>
  )
}

export function SkeletonResume() {
  return (
    <div className="space-y-6 animate-in">
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
      <Skeleton className="h-24 rounded-2xl" />
      <div className="card space-y-3">
        <Skeleton className="h-4 w-40" />
        <div className="flex flex-wrap gap-2">
          {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="h-6 w-16 rounded-full" />)}
        </div>
      </div>
    </div>
  )
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'border-primary-500' }) {
  return (
    <div
      className={clsx('border-2 border-t-transparent rounded-full animate-spin', color)}
      style={{ width: size, height: size }}
    />
  )
}

// ── Step Progress ─────────────────────────────────────────────────────────────
export function StepProgress({ current, total, labels }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={clsx('step-dot', i < current ? 'done' : i === current ? 'active' : '')} />
          {labels?.[i] && i === current && (
            <span className="text-xs text-slate-400">{labels[i]}</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── AI Loading Indicator ──────────────────────────────────────────────────────
export function AILoader({ steps, current }) {
  return (
    <div className="card py-12 flex flex-col items-center gap-6 animate-in">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-600/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-400 animate-pulse-slow" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.5 8.5 2.1 2.1M5.6 18.4l2.1-2.1m8.5-8.5 2.1-2.1" />
          </svg>
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-primary-600/20 animate-ping opacity-30" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-200 mb-1">AI is analyzing…</p>
        <p className="text-sm text-slate-500">This takes about 10–15 seconds</p>
      </div>
      {steps && (
        <div className="space-y-2 w-full max-w-xs">
          {steps.map((step, i) => (
            <div key={i} className={clsx('flex items-center gap-3 text-sm transition-all',
              i < current ? 'text-success-400' :
              i === current ? 'text-primary-400' : 'text-slate-600'
            )}>
              <span className="w-4 h-4 flex-shrink-0">
                {i < current ? '✓' : i === current ? (
                  <span className="inline-block w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                ) : '○'}
              </span>
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Info Tooltip ──────────────────────────────────────────────────────────────
export function InfoTag({ text, type = 'info' }) {
  const styles = {
    info:    'bg-primary-500/10 text-primary-300 border-primary-500/20',
    success: 'bg-success-500/10 text-success-300 border-success-500/20',
    warning: 'bg-warning-500/10 text-warning-300 border-warning-500/20',
    danger:  'bg-danger-500/10  text-danger-300  border-danger-500/20',
  }
  return (
    <div className={clsx('rounded-xl px-4 py-3 border text-sm leading-relaxed', styles[type])}>
      {text}
    </div>
  )
}
