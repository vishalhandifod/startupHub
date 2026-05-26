import { Rocket, Eye, EyeOff, ArrowRight, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../components/common/Toast.jsx'
import { getErrorMessage } from '../utils/apiError.js'

/* ─── Animated counter hook ─── */
function useCounter(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return value
}

/* ─── Floating particle ─── */
function Particle({ style }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '2px',
        height: '2px',
        borderRadius: '50%',
        background: 'rgba(52,211,153,0.6)',
        animation: 'float 6s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

/* ─── Stat card ─── */
function StatCard({ icon: Icon, value, suffix, label, delay }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  const count = useCounter(value, 1600, visible)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      ref={ref}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        transitionDelay: `${delay}ms`,
        flex: 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          background: 'rgba(52,211,153,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} color="#34d399" />
        </div>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>{label}</span>
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
        {count.toLocaleString()}{suffix}
      </span>
    </div>
  )
}

/* ─── Testimonial ─── */
const testimonials = [
  { initials: 'AK', name: 'Arjun Kapoor', role: 'Co-founder, Novu · $2.4M Seed', text: 'Closed our seed round in 3 weeks after connecting with investors here. This network is genuinely unlike anything else.' },
  { initials: 'SR', name: 'Shreya Rao', role: 'CEO, Stackline · YC W23', text: 'The quality of conversations here is incredible. Met my CTO, two angels, and a design partner in my first month.' },
  { initials: 'MP', name: 'Marcus Park', role: 'Partner, Sequoia India', text: "We've sourced 4 portfolio companies from StartupHub. The founder quality is exceptional and unmatched." },
]

/* ─── Main Component ─── */
export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  function validate() {
    const errs = {}
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.password) errs.password = 'Password is required.'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmitting(true)
    try {
      await login(form)
      showToast({ title: 'Welcome back', message: 'Your founder dashboard is ready.', tone: 'success' })
      navigate('/feed')
    } catch (error) {
      showToast({ title: 'Sign in failed', message: getErrorMessage(error, 'Please check your credentials.'), tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const t = testimonials[testimonialIdx]

  const particles = [
    { top: '12%', left: '8%', animationDelay: '0s' },
    { top: '28%', left: '72%', animationDelay: '1.2s' },
    { top: '55%', left: '18%', animationDelay: '2.4s' },
    { top: '75%', left: '60%', animationDelay: '0.8s' },
    { top: '42%', left: '85%', animationDelay: '3.1s' },
    { top: '88%', left: '34%', animationDelay: '1.8s' },
  ]

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sh-page {
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          background: #070b12;
          font-family: var(--font-sans);
          overflow: hidden;
        }

        /* ── Left panel ── */
        .sh-left {
          flex: 1.2;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 60px;
          overflow: hidden;
        }
        .sh-left-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 15% 20%, rgba(52,211,153,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(99,102,241,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 30% 30% at 60% 10%, rgba(16,185,129,0.07) 0%, transparent 50%),
            #070b12;
        }
        .sh-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .sh-noise {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }

        /* ── Glow orbs ── */
        .sh-orb-1 {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 65%);
          top: -180px; left: -120px;
          pointer-events: none;
        }
        .sh-orb-2 {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%);
          bottom: 60px; right: -40px;
          pointer-events: none;
        }

        .sh-left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: space-between;
        }

        .sh-wordmark {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sh-wordmark-icon {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 24px rgba(52,211,153,0.35);
        }
        .sh-wordmark-text {
          font-family: var(--font-display);
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
        }

        .sh-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(52,211,153,0.08);
          border: 0.5px solid rgba(52,211,153,0.25);
          border-radius: 100px;
          padding: 5px 14px 5px 8px;
          width: fit-content;
          margin-bottom: 24px;
        }
        .sh-badge-pip {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 8px rgba(52,211,153,0.8);
          animation: pulse-pip 2s ease-in-out infinite;
        }
        .sh-badge-text {
          font-size: 11.5px;
          color: #34d399;
          letter-spacing: 0.04em;
          font-weight: 500;
        }

        .sh-headline {
          font-family: var(--font-display);
          font-size: clamp(36px, 3.5vw, 52px);
          font-weight: 800;
          line-height: 1.04;
          color: #fff;
          letter-spacing: -0.035em;
        }
        .sh-headline-accent {
          background: linear-gradient(90deg, #34d399, #6ee7b7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sh-desc {
          margin-top: 20px;
          font-size: 14.5px;
          color: rgba(255,255,255,0.4);
          line-height: 1.75;
          max-width: 340px;
          font-weight: 400;
        }

        .sh-feature-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 28px;
        }
        .sh-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          padding: 5px 12px;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        .sh-pill-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #34d399;
          flex-shrink: 0;
        }

        .sh-stats-row {
          display: flex;
          gap: 10px;
        }

        .sh-testimonial-box {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 22px 24px;
          margin-top: 16px;
          position: relative;
          overflow: hidden;
        }
        .sh-testimonial-box::before {
          content: '"';
          position: absolute;
          top: -8px; left: 16px;
          font-family: var(--font-display);
          font-size: 72px;
          font-weight: 800;
          color: rgba(52,211,153,0.12);
          line-height: 1;
          pointer-events: none;
        }
        .sh-testimonial-text {
          font-size: 13.5px;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          font-style: italic;
          font-weight: 400;
          position: relative;
          z-index: 1;
          transition: opacity 0.4s ease;
        }
        .sh-testimonial-author {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
        }
        .sh-avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #34d399 0%, #6366f1 100%);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          color: #fff;
          font-family: var(--font-display);
          flex-shrink: 0;
        }
        .sh-author-name {
          font-size: 12.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
        }
        .sh-author-role {
          font-size: 11px;
          color: rgba(255,255,255,0.42);
          margin-top: 1px;
        }
        .sh-dots {
          display: flex;
          gap: 5px;
          margin-top: 16px;
          justify-content: flex-end;
        }
        .sh-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          cursor: pointer;
          transition: background 0.3s, width 0.3s;
        }
        .sh-dot.active {
          background: #34d399;
          width: 18px;
          border-radius: 100px;
        }

        /* ── Right panel ── */
        .sh-right {
          flex: 0 0 480px;
          background: #0c111c;
          border-left: 0.5px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 52px;
          position: relative;
        }
        .sh-right-top-accent {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #34d399, #6366f1, transparent);
        }

        .sh-form-header { margin-bottom: 36px; }
        .sh-form-title {
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.025em;
        }
        .sh-form-sub {
          font-size: 13.5px;
          color: rgba(255,255,255,0.35);
          margin-top: 6px;
          font-weight: 400;
          line-height: 1.5;
        }

        .sh-field { margin-bottom: 20px; }
        .sh-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .sh-input-wrap { position: relative; }
        .sh-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.09);
          border-radius: 11px;
          padding: 13px 16px;
          font-size: 14px;
          color: #fff;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          caret-color: #34d399;
        }
        .sh-input::placeholder { color: rgba(255,255,255,0.18); }
        .sh-input:hover { border-color: rgba(255,255,255,0.15); }
        .sh-input:focus {
          border-color: rgba(52,211,153,0.45);
          background: rgba(52,211,153,0.04);
          box-shadow: 0 0 0 3px rgba(52,211,153,0.08);
        }
        .sh-input.has-suffix { padding-right: 46px; }
        .sh-input.error-state { border-color: rgba(248,113,113,0.5); }
        .sh-input.error-state:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.08); }

        .sh-eye-btn {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.25);
          display: flex; align-items: center;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s;
        }
        .sh-eye-btn:hover { color: rgba(255,255,255,0.65); }

        .sh-error-msg {
          display: block;
          font-size: 11.5px;
          color: #f87171;
          margin-top: 6px;
          font-weight: 400;
        }

        .sh-row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .sh-forgot {
          font-size: 12px;
          color: rgba(52,211,153,0.65);
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }
        .sh-forgot:hover { color: #34d399; }

        .sh-submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          border: none;
          border-radius: 11px;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          cursor: pointer;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(52,211,153,0.25);
          margin-top: 8px;
        }
        .sh-submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(52,211,153,0.35);
        }
        .sh-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .sh-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .sh-spinner {
          width: 17px; height: 17px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .sh-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0;
        }
        .sh-divider-line { flex: 1; height: 0.5px; background: rgba(255,255,255,0.07); }
        .sh-divider-text { font-size: 11px; color: rgba(255,255,255,0.2); white-space: nowrap; }

        .sh-social-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }
        .sh-social-btn {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 11px 8px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.5);
          font-family: var(--font-sans);
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          font-weight: 400;
        }
        .sh-social-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.85);
        }

        .sh-footer-text {
          text-align: center;
          font-size: 13px;
          color: rgba(255,255,255,0.28);
          margin-top: 28px;
        }
        .sh-footer-link {
          color: #34d399;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .sh-footer-link:hover { color: #6ee7b7; }

        .sh-terms {
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-top: 16px;
          line-height: 1.6;
        }
        .sh-terms a { color: rgba(255,255,255,0.5); text-decoration: none; }
        .sh-terms a:hover { color: rgba(255,255,255,0.6); }

        /* ── Animations ── */
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-14px) scale(1.4); opacity: 1; }
        }
        @keyframes pulse-pip {
          0%, 100% { box-shadow: 0 0 6px rgba(52,211,153,0.6); }
          50% { box-shadow: 0 0 14px rgba(52,211,153,1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sh-anim-0 { animation: fadeSlideUp 0.55s ease both; animation-delay: 0ms; }
        .sh-anim-1 { animation: fadeSlideUp 0.55s ease both; animation-delay: 80ms; }
        .sh-anim-2 { animation: fadeSlideUp 0.55s ease both; animation-delay: 160ms; }
        .sh-anim-3 { animation: fadeSlideUp 0.55s ease both; animation-delay: 240ms; }
        .sh-anim-4 { animation: fadeSlideUp 0.55s ease both; animation-delay: 320ms; }
        .sh-anim-5 { animation: fadeSlideUp 0.55s ease both; animation-delay: 400ms; }
        .sh-anim-6 { animation: fadeSlideUp 0.55s ease both; animation-delay: 480ms; }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .sh-left { display: none; }
          .sh-right { flex: 1; border-left: none; }
        }
      `}</style>

      <div className="sh-page">
        {/* ════ LEFT PANEL ════ */}
        <div className="sh-left">
          <div className="sh-left-bg" />
          <div className="sh-grid" />
          <div className="sh-noise" />
          <div className="sh-orb-1" />
          <div className="sh-orb-2" />

          {particles.map((p, i) => (
            <Particle key={i} style={{ top: p.top, left: p.left, animationDelay: p.animationDelay }} />
          ))}

          <div className="sh-left-content">
            {/* Top: wordmark */}
            <div className="sh-wordmark sh-anim-0">
              <div className="sh-wordmark-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Rocket size={18} color="#fff" />
              </div>
              <span className="sh-wordmark-text">StartupHub</span>
            </div>

            {/* Middle: hero copy */}
            <div>
              <div className="sh-badge sh-anim-1">
                <span className="sh-badge-pip" />
                <span className="sh-badge-text">42,000+ founders · live now</span>
              </div>
              <h1 className="sh-headline sh-anim-2">
                Raise attention<br />
                before you<br />
                <span className="sh-headline-accent">raise a round.</span>
              </h1>
              <p className="sh-desc sh-anim-3">
                StartupHub connects founders, operators, and angel investors in one premium network built entirely for startup momentum.
              </p>
              <div className="sh-feature-pills sh-anim-4">
                {['Deal flow', 'Co-founders', 'Angel access', 'Hiring', 'Product feedback'].map((f) => (
                  <span className="sh-pill" key={f}>
                    <span className="sh-pill-dot" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom: stats + testimonial */}
            <div>
              <div className="sh-stats-row">
                <StatCard icon={Users} value={42000} suffix="+" label="Founders" delay={600} />
                <StatCard icon={DollarSign} value={2100} suffix="M+" label="Raised" delay={750} />
                <StatCard icon={TrendingUp} value={8300} suffix="+" label="Investors" delay={900} />
              </div>
              <div className="sh-testimonial-box" style={{ marginTop: '16px' }}>
                <p className="sh-testimonial-text">{t.text}</p>
                <div className="sh-testimonial-author">
                  <div className="sh-avatar">{t.initials}</div>
                  <div>
                    <div className="sh-author-name">{t.name}</div>
                    <div className="sh-author-role">{t.role}</div>
                  </div>
                </div>
                <div className="sh-dots">
                  {testimonials.map((_, i) => (
                    <div
                      key={i}
                      className={`sh-dot${i === testimonialIdx ? ' active' : ''}`}
                      onClick={() => setTestimonialIdx(i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="sh-right">
          <div className="sh-right-top-accent" />

          {/* Form header */}
          <div className="sh-form-header sh-anim-0">
            <h2 className="sh-form-title">Welcome back</h2>
            <p className="sh-form-sub">Sign in to your founder network to continue.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="sh-field sh-anim-1">
              <label className="sh-label" htmlFor="sh-email">Email address</label>
              <div className="sh-input-wrap">
                <input
                  id="sh-email"
                  type="email"
                  className={`sh-input${errors.email ? ' error-state' : ''}`}
                  placeholder="you@startup.com"
                  value={form.email}
                  autoComplete="email"
                  onChange={(e) => {
                    setForm((f) => ({ ...f, email: e.target.value }))
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                  }}
                />
              </div>
              {errors.email && <span className="sh-error-msg">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="sh-field sh-anim-2">
              <div className="sh-row-between">
                <label className="sh-label" htmlFor="sh-password" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="sh-forgot">Forgot password?</Link>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div className="sh-input-wrap">
                  <input
                    id="sh-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`sh-input has-suffix${errors.password ? ' error-state' : ''}`}
                    placeholder="Enter your password"
                    value={form.password}
                    autoComplete="current-password"
                    onChange={(e) => {
                      setForm((f) => ({ ...f, password: e.target.value }))
                      if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
                    }}
                  />
                  <button
                    type="button"
                    className="sh-eye-btn "
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="sh-error-msg">{errors.password}</span>}
              </div>
            </div>

            {/* Submit */}
            <div className="sh-anim-3">
              <button
                type="submit"
                className="sh-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="sh-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to network
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="sh-divider sh-anim-4">
            <div className="sh-divider-line" />
            <span className="sh-divider-text">or continue with</span>
            <div className="sh-divider-line" />
          </div>

          {/* Social buttons */}
          <div className="sh-social-grid sh-anim-5">
            <button className="sh-social-btn" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="sh-social-btn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
            <button className="sh-social-btn" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.55)">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Footer */}
          <p className="sh-footer-text sh-anim-6">
            New to StartupHub?{' '}
            <Link to="/register" className="sh-footer-link">Create your account</Link>
          </p>
          <p className="sh-terms">
            By signing in, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </>
  )
}
