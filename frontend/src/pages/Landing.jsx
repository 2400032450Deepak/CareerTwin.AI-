import { Link } from 'react-router-dom'
import { ArrowRight, Briefcase, BarChart2, Target, Zap, Map, Building2,
         CheckCircle, Star, Users, TrendingUp, Award } from 'lucide-react'

const FEATURES = [
  {
    icon: BarChart2,
    color: 'text-primary-400',
    bg: 'bg-primary-500/10',
    title: 'Employability Score',
    desc: 'AI-powered scoring across 7 career dimensions — not just a number, but a detailed breakdown with actionable reasoning.',
  },
  {
    icon: Target,
    color: 'text-success-400',
    bg: 'bg-success-500/10',
    title: 'Skill Gap Prediction',
    desc: 'Know exactly which skills to learn next and their precise impact on your placement chances.',
  },
  {
    icon: Zap,
    color: 'text-warning-400',
    bg: 'bg-warning-500/10',
    title: 'Career Simulation',
    desc: '"What if I learn Docker?" — Simulate scenarios and see your future employability score before investing time.',
  },
  {
    icon: Building2,
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    title: 'Company Match Engine',
    desc: 'Get compatibility scores for Amazon, Flipkart, Razorpay and 50+ companies with specific improvement plans.',
  },
  {
    icon: Map,
    color: 'text-primary-300',
    bg: 'bg-primary-600/10',
    title: 'AI Roadmap Generator',
    desc: 'Personalized 30/60/90-day learning plans based on your gaps — with resources, projects, and DSA tasks.',
  },
  {
    icon: Award,
    color: 'text-success-300',
    bg: 'bg-success-600/10',
    title: 'Digital Twin Engine',
    desc: 'Your AI career profile tracks growth over time, showing how far you\'ve come and what\'s next.',
  },
]

const STATS = [
  { value: '10K+', label: 'Students Analyzed' },
  { value: '50+',  label: 'Companies Covered' },
  { value: '94%',  label: 'Accuracy Rate' },
  { value: '3x',   label: 'Placement Rate' },
]

const TESTIMONIALS = [
  {
    text: 'CareerTwin told me exactly what was missing from my profile. I added Docker + Redis, rebuilt my score from 58 to 79, and got placed at Razorpay.',
    name: 'Arjun Sharma', role: 'SDE-1 @ Razorpay', rating: 5,
  },
  {
    text: 'The simulation feature is insane. I simulated learning AWS before actually doing it and knew it would boost my score by 12 points. It did.',
    name: 'Priya Menon', role: 'Software Engineer @ Amazon', rating: 5,
  },
  {
    text: 'Finally a tool that\'s honest. It told me I was at 52/100 and exactly why. Brutal but fair. Placed at Swiggy 4 months later.',
    name: 'Rohit Kumar', role: 'Backend Engineer @ Swiggy', rating: 5,
  },
]

const STEPS = [
  { n: '01', title: 'Upload Resume', desc: 'PDF upload + instant AI analysis and ATS scoring' },
  { n: '02', title: 'Generate Twin',  desc: 'AI builds your Digital Career Twin with 14 readiness scores' },
  { n: '03', title: 'See Gaps',       desc: 'Know exactly what\'s missing and its impact on your chances' },
  { n: '04', title: 'Follow Roadmap', desc: 'Execute your personalized 90-day placement plan' },
]

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: '#070B14' }}>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
        style={{ background: 'rgba(7,11,20,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Briefcase size={15} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">CareerTwin AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started Free <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium mb-8 border border-primary-500/20"
            style={{ background: 'rgba(59,130,246,0.08)', color: '#60A5FA' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            Powered by Gemini 2.5 Flash · Made for Indian Placements
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white mb-6 tracking-tight">
            Your Digital Twin for<br />
            <span className="gradient-text">Placements & Career Growth</span>
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your resume. Get your AI-powered Employability Score. Know exactly what's missing.
            Get a personalized 90-day roadmap to land your dream role at Amazon, Flipkart, Razorpay.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link to="/register" className="btn btn-primary btn-lg w-full sm:w-auto">
              Build My Digital Twin — Free <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg w-full sm:w-auto">
              Sign in
            </Link>
          </div>
          <p className="text-xs text-slate-600">No credit card · 2 minutes setup · Works with any resume</p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="card text-center py-5">
              <p className="stat-number text-3xl font-extrabold text-primary-400 mb-1">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-primary-400 font-medium uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">From zero to job-ready in 4 steps</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {STEPS.map((step, i) => (
              <div key={i} className="card-glass text-center py-6 px-4">
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-600/20 flex items-center justify-center mx-auto mb-4">
                  <span className="stat-number text-sm font-bold text-primary-400">{step.n}</span>
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-primary-400 font-medium uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Your complete career operating system</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="card-hover">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-4', bg)}>
                  <Icon size={20} className={color} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-primary-400 font-medium uppercase tracking-widest mb-3">Success Stories</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Students who got placed</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card-glass">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-warning-400 fill-warning-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="max-w-xl mx-auto text-center">
          <div className="card-glass py-12 px-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-600/20 flex items-center justify-center mx-auto mb-6">
              <TrendingUp size={26} className="text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Know your score today</h2>
            <p className="text-sm text-slate-500 mb-8">
              2 minutes. Upload resume → Get Employability Score → Know what to do next.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg w-full justify-center">
              Start for Free <ArrowRight size={16} />
            </Link>
            <p className="text-xs text-slate-600 mt-4">
              <CheckCircle size={12} className="inline mr-1 text-success-500" />
              Free forever · No credit card required
            </p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs text-slate-700 border-t border-white/5">
        © 2025 CareerTwin AI · Built for B.Tech students targeting top Indian placements
      </footer>
    </div>
  )
}

function clsx(...args) {
  return args.filter(Boolean).join(' ')
}
