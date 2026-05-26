import { Rocket, Eye, EyeOff, ArrowRight, Check, Users, TrendingUp, DollarSign, Zap, Star, Building2, Globe } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../components/common/Toast.jsx'
import { getErrorMessage } from '../utils/apiError.js'

/* ─── Password strength engine ─── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: 'Enter a password', color: '#1e293b', pct: 0 }
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Too weak', color: '#ef4444', pct: 15 }
  if (score === 2) return { score, label: 'Weak', color: '#f97316', pct: 35 }
  if (score === 3) return { score, label: 'Fair', color: '#eab308', pct: 60 }
  if (score === 4) return { score, label: 'Strong', color: '#22c55e', pct: 85 }
  return { score, label: 'Excellent', color: '#34d399', pct: 100 }
}

/* ─── Requirement check row ─── */
function Req({ met, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
      <div style={{
        width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
        background: met ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)',
        border: `0.5px solid ${met ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.25s ease',
      }}>
        {met && <Check size={9} color="#34d399" strokeWidth={3} />}
      </div>
      <span style={{ fontSize: '12px', color: met ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)', transition: 'color 0.25s' }}>{label}</span>
    </div>
  )
}

/* ─── Floating dot ─── */
function Dot({ style }) {
  return <div style={{ position: 'absolute', width: '2px', height: '2px', borderRadius: '50%', background: 'rgba(52,211,153,0.5)', animation: 'sh-float 7s ease-in-out infinite', ...style }} />
}

/* ─── Role badge ─── */
function RoleBadge({ icon: Icon, label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        background: selected ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.03)',
        border: `0.5px solid ${selected ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '10px',
        padding: '10px 6px',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        transition: 'all 0.2s ease',
        outline: 'none',
      }}
    >
      <div style={{
        width: '30px', height: '30px', borderRadius: '8px',
        background: selected ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.2s',
      }}>
        <Icon size={15} color={selected ? '#34d399' : 'rgba(255,255,255,0.35)'} />
      </div>
      <span style={{ fontSize: '11px', color: selected ? '#34d399' : 'rgba(255,255,255,0.4)', fontWeight: selected ? 500 : 400, transition: 'color 0.2s', fontFamily: 'var(--font-sans)' }}>{label}</span>
    </button>
  )
}

const ROLES = [
  { id: 'founder', label: 'Founder', icon: Rocket },
  { id: 'investor', label: 'Investor', icon: TrendingUp },
  { id: 'operator', label: 'Operator', icon: Building2 },
  { id: 'builder', label: 'Builder', icon: Zap },
]

const PERKS = [
  { icon: Users, text: 'Access 42K+ vetted founders' },
  { icon: DollarSign, text: 'Connect with 8,300+ angel investors' },
  { icon: Star, text: 'Get early feedback from the community' },
  { icon: Globe, text: 'Go global — 140+ countries' },
]

/* ════ Main Component ════ */
export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showToast } = useToast()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('founder')
  const [focusedPw, setFocusedPw] = useState(false)
  const [step, setStep] = useState(1) // 1 = role pick, 2 = form

  const strength = useMemo(() => getStrength(form.password), [form.password])

  const pwReqs = [
    { met: form.password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(form.password), label: 'One uppercase letter' },
    { met: /[0-9]/.test(form.password), label: 'One number' },
    { met: /[^A-Za-z0-9]/.test(form.password), label: 'One special character' },
  ]

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required.'
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSubmitting(true)
    try {
      await register({ ...form, role })
      showToast({ title: 'Welcome to StartupHub 🚀', message: 'Your founder profile is live.', tone: 'success' })
      navigate('/feed')
    } catch (error) {
      showToast({ title: 'Registration failed', message: getErrorMessage(error, 'Your account could not be created.'), tone: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const dots = [
    { top: '8%', left: '6%', animationDelay: '0s' },
    { top: '22%', left: '80%', animationDelay: '1.5s' },
    { top: '60%', left: '12%', animationDelay: '2.8s' },
    { top: '78%', left: '68%', animationDelay: '0.9s' },
    { top: '45%', left: '90%', animationDelay: '3.5s' },
  ]

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sh-reg-page {
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          background: #070b12;
          font-family: var(--font-sans);
          overflow: hidden;
        }

        /* Left */
        .sh-reg-left {
          flex: 1.1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 60px;
          overflow: hidden;
        }
        .sh-reg-left-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 50% at 10% 15%, rgba(52,211,153,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 45% at 85% 75%, rgba(99,102,241,0.09) 0%, transparent 60%),
            #070b12;
        }
        .sh-reg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .sh-reg-orb {
          position: absolute;
          width: 460px; height: 460px; border-radius: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.09) 0%, transparent 65%);
          top: -160px; left: -100px; pointer-events: none;
        }
        .sh-reg-orb2 {
          position: absolute;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%);
          bottom: 40px; right: -20px; pointer-events: none;
        }
        .sh-reg-lc { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; justify-content: space-between; }

        /* Right */
        .sh-reg-right {
          flex: 0 0 500px;
          background: #0c111c;
          border-left: 0.5px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; justify-content: center;
          padding: 44px 52px;
          position: relative;
          overflow-y: auto;
        }
        .sh-reg-top-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #34d399, #6366f1, transparent);
        }

        /* Typography */
        .sh-reg-wordmark { display: flex; align-items: center; gap: 10px; }
        .sh-reg-wicon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(52,211,153,0.3);
        }
        .sh-reg-wtext { font-family: var(--font-display); font-size: 17px; font-weight: 700; color: #fff; letter-spacing: -0.01em; }

        .sh-reg-headline { font-family: var(--font-display); font-size: clamp(34px, 3vw, 48px); font-weight: 800; line-height: 1.05; color: #fff; letter-spacing: -0.03em; }
        .sh-reg-accent { background: linear-gradient(90deg, #34d399, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .sh-reg-desc { margin-top: 18px; font-size: 14px; color: rgba(255,255,255,0.38); line-height: 1.75; max-width: 340px; font-weight: 400; }

        .sh-reg-perks { display: flex; flex-direction: column; gap: 12px; margin-top: 28px; }
        .sh-reg-perk { display: flex; align-items: center; gap: 12px; }
        .sh-reg-perk-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: rgba(52,211,153,0.1);
          border: 0.5px solid rgba(52,211,153,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .sh-reg-perk-text { font-size: 13px; color: rgba(255,255,255,0.5); font-weight: 400; }

        .sh-reg-social-proof {
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 20px 22px;
        }
        .sh-reg-sp-label { font-size: 11px; color: rgba(255,255,255,0.38); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 14px; }
        .sh-reg-avatars { display: flex; align-items: center; gap: 0; }
        .sh-reg-av {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1.5px solid #0c111c;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; font-family: var(--font-display);
          color: #fff; flex-shrink: 0;
        }
        .sh-reg-joined { font-size: 12.5px; color: rgba(255,255,255,0.4); font-weight: 400; margin-left: 10px; }
        .sh-reg-joined strong { color: #34d399; font-weight: 500; }

        /* Form */
        .sh-reg-title { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
        .sh-reg-sub { font-size: 13px; color: rgba(255,255,255,0.32); margin-top: 5px; font-weight: 400; }

        .sh-reg-step-bar { display: flex; align-items: center; gap: 6px; margin-bottom: 28px; }
        .sh-reg-step-seg {
          flex: 1; height: 3px; border-radius: 100px;
          transition: background 0.3s ease;
        }

        .sh-reg-field { margin-bottom: 18px; }
        .sh-reg-label { display: block; font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.4); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 7px; }
        .sh-reg-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.09); border-radius: 11px;
          padding: 13px 16px; font-size: 14px; color: #fff;
          font-family: var(--font-sans); outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          caret-color: #34d399;
        }
        .sh-reg-input::placeholder { color: rgba(255,255,255,0.18); }
        .sh-reg-input:hover { border-color: rgba(255,255,255,0.14); }
        .sh-reg-input:focus { border-color: rgba(52,211,153,0.45); background: rgba(52,211,153,0.04); box-shadow: 0 0 0 3px rgba(52,211,153,0.08); }
        .sh-reg-input.err { border-color: rgba(248,113,113,0.5); }
        .sh-reg-input.err:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.08); }
        .sh-reg-input.has-sfx { padding-right: 46px; }

        .sh-reg-iw { position: relative; }
        .sh-reg-eye {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); display: flex; align-items: center;
          padding: 4px; border-radius: 6px; transition: color 0.2s;
        }
        .sh-reg-eye:hover { color: rgba(255,255,255,0.65); }

        .sh-reg-err { display: block; font-size: 11.5px; color: #f87171; margin-top: 5px; }

        .sh-reg-strength-bar {
          height: 4px; border-radius: 100px;
          background: rgba(255,255,255,0.06);
          margin-top: 10px; overflow: hidden;
        }
        .sh-reg-strength-fill {
          height: 100%; border-radius: 100px;
          transition: width 0.4s ease, background-color 0.4s ease;
        }
        .sh-reg-strength-label { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 5px; display: flex; justify-content: space-between; }
        .sh-reg-reqs { display: flex; flex-direction: column; gap: 5px; margin-top: 10px; padding: 12px 14px; background: rgba(255,255,255,0.02); border: 0.5px solid rgba(255,255,255,0.06); border-radius: 10px; }

        .sh-reg-roles { display: flex; gap: 8px; margin-bottom: 20px; }

        .sh-reg-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
          border: none; border-radius: 11px;
          font-family: var(--font-display); font-size: 15px; font-weight: 700;
          color: #fff; cursor: pointer; letter-spacing: -0.01em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(52,211,153,0.22);
          margin-top: 6px;
        }
        .sh-reg-btn:hover:not(:disabled) { opacity: 0.91; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(52,211,153,0.32); }
        .sh-reg-btn:active:not(:disabled) { transform: translateY(0); }
        .sh-reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .sh-reg-spinner { width: 17px; height: 17px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: sh-spin 0.7s linear infinite; flex-shrink: 0; }

        .sh-reg-divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .sh-reg-divline { flex: 1; height: 0.5px; background: rgba(255,255,255,0.07); }
        .sh-reg-divtxt { font-size: 11px; color: rgba(255,255,255,0.2); white-space: nowrap; }

        .sh-reg-social { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .sh-reg-sbtn {
          background: rgba(255,255,255,0.03); border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 10px 8px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-size: 12.5px; color: rgba(255,255,255,0.45); font-family: var(--font-sans);
          transition: background 0.2s, border-color 0.2s, color 0.2s;
        }
        .sh-reg-sbtn:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.16); color: rgba(255,255,255,0.8); }

        .sh-reg-footer { text-align: center; font-size: 13px; color: rgba(255,255,255,0.28); margin-top: 24px; }
        .sh-reg-flink { color: #34d399; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .sh-reg-flink:hover { color: #6ee7b7; }
        .sh-reg-terms { text-align: center; font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 14px; line-height: 1.6; }
        .sh-reg-terms a { color: rgba(255,255,255,0.48); text-decoration: none; }
        .sh-reg-terms a:hover { color: rgba(255,255,255,0.58); }

        /* Animations */
        @keyframes sh-float { 0%,100% { transform: translateY(0) scale(1); opacity: 0.5; } 50% { transform: translateY(-12px) scale(1.5); opacity: 1; } }
        @keyframes sh-spin { to { transform: rotate(360deg); } }
        @keyframes sh-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sh-pip { 0%,100% { box-shadow: 0 0 6px rgba(52,211,153,0.6); } 50% { box-shadow: 0 0 14px rgba(52,211,153,1); } }

        .sh-a0 { animation: sh-up 0.5s ease both 0ms; }
        .sh-a1 { animation: sh-up 0.5s ease both 70ms; }
        .sh-a2 { animation: sh-up 0.5s ease both 140ms; }
        .sh-a3 { animation: sh-up 0.5s ease both 210ms; }
        .sh-a4 { animation: sh-up 0.5s ease both 280ms; }
        .sh-a5 { animation: sh-up 0.5s ease both 350ms; }
        .sh-a6 { animation: sh-up 0.5s ease both 420ms; }
        .sh-a7 { animation: sh-up 0.5s ease both 490ms; }

        @media (max-width: 900px) { .sh-reg-left { display: none; } .sh-reg-right { flex: 1; border-left: none; } }
      `}</style>

      <div className="sh-reg-page">
        {/* ═══ LEFT ═══ */}
        <div className="sh-reg-left">
          <div className="sh-reg-left-bg" />
          <div className="sh-reg-grid" />
          <div className="sh-reg-orb" />
          <div className="sh-reg-orb2" />
          {dots.map((d, i) => <Dot key={i} style={{ top: d.top, left: d.left, animationDelay: d.animationDelay }} />)}

          <div className="sh-reg-lc">
            {/* Wordmark */}
            <div className="sh-reg-wordmark sh-a0">
              <div className="sh-reg-wicon"><Rocket size={18} color="#fff" /></div>
              <span className="sh-reg-wtext">StartupHub</span>
            </div>

            {/* Hero */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(52,211,153,0.08)', border: '0.5px solid rgba(52,211,153,0.22)', borderRadius: '100px', padding: '5px 14px 5px 8px', marginBottom: '22px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', animation: 'sh-pip 2s ease-in-out infinite' }} />
                <span style={{ fontSize: '11.5px', color: '#34d399', letterSpacing: '0.04em', fontWeight: 500 }}>Join 42,000+ founders today</span>
              </div>
              <h1 className="sh-reg-headline sh-a1">
                Build your<br />
                presence before<br />
                <span className="sh-reg-accent">you build traction.</span>
              </h1>
              <p className="sh-reg-desc sh-a2">
                Create your founder profile, get discovered by investors and operators, and plug into the most active startup network in Asia.
              </p>
              <div className="sh-reg-perks sh-a3">
                {PERKS.map(({ icon: Icon, text }) => (
                  <div className="sh-reg-perk" key={text}>
                    <div className="sh-reg-perk-icon"><Icon size={15} color="#34d399" /></div>
                    <span className="sh-reg-perk-text">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social proof */}
            <div className="sh-reg-social-proof sh-a4">
              <div className="sh-reg-sp-label">Recently joined</div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="sh-reg-avatars" style={{ display: 'flex' }}>
                  {[
                    { bg: 'linear-gradient(135deg,#34d399,#059669)', label: 'AK' },
                    { bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', label: 'SR' },
                    { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', label: 'MP' },
                    { bg: 'linear-gradient(135deg,#ec4899,#db2777)', label: 'KL' },
                    { bg: 'linear-gradient(135deg,#14b8a6,#0f766e)', label: 'RN' },
                  ].map((a, i) => (
                    <div key={i} className="sh-reg-av" style={{ background: a.bg, marginLeft: i === 0 ? 0 : '-8px', zIndex: 5 - i }}>{a.label}</div>
                  ))}
                </div>
                <span className="sh-reg-joined"><strong>1,240 founders</strong> joined this month</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT ═══ */}
        <div className="sh-reg-right">
          <div className="sh-reg-top-bar" />

          {/* Step progress */}
          <div className="sh-reg-step-bar sh-a0">
            <div className="sh-reg-step-seg" style={{ background: '#34d399' }} />
            <div className="sh-reg-step-seg" style={{ background: step >= 2 ? '#34d399' : 'rgba(255,255,255,0.08)' }} />
          </div>

          <div style={{ marginBottom: '30px' }} className="sh-a0">
            <h2 className="sh-reg-title">Create your account</h2>
            <p className="sh-reg-sub">Join the network. Build your momentum.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Role selector */}
            <div className="sh-reg-field sh-a1">
              <label className="sh-reg-label">I am a</label>
              <div className="sh-reg-roles">
                {ROLES.map(({ id, label, icon }) => (
                  <RoleBadge key={id} icon={icon} label={label} selected={role === id} onClick={() => { setRole(id); setStep(2) }} />
                ))}
              </div>
            </div>

            {/* Full name */}
            <div className="sh-reg-field sh-a2">
              <label className="sh-reg-label" htmlFor="sh-name">Full name</label>
              <input
                id="sh-name"
                className={`sh-reg-input${errors.name ? ' err' : ''}`}
                placeholder="Enter your full name"
                value={form.name}
                autoComplete="name"
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }))
                  if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                }}
              />
              {errors.name && <span className="sh-reg-err">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="sh-reg-field sh-a3">
              <label className="sh-reg-label" htmlFor="sh-email">Email address</label>
              <input
                id="sh-email"
                type="email"
                className={`sh-reg-input${errors.email ? ' err' : ''}`}
                placeholder="you@startup.com"
                value={form.email}
                autoComplete="email"
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }))
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                }}
              />
              {errors.email && <span className="sh-reg-err">{errors.email}</span>}
            </div>

            {/* Password */}
            <div className="sh-reg-field sh-a4">
              <label className="sh-reg-label" htmlFor="sh-password">Password</label>
              <div className="sh-reg-iw">
                <input
                  id="sh-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`sh-reg-input has-sfx${errors.password ? ' err' : ''}`}
                  placeholder="Create a secure password"
                  value={form.password}
                  autoComplete="new-password"
                  onFocus={() => setFocusedPw(true)}
                  onBlur={() => setFocusedPw(false)}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, password: e.target.value }))
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }))
                  }}
                />
                <button type="button" className="sh-reg-eye" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength bar */}
              <div className="sh-reg-strength-bar">
                <div className="sh-reg-strength-fill" style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
              </div>
              <div className="sh-reg-strength-label">
                <span>Password strength</span>
                <span style={{ color: strength.color, fontWeight: 500 }}>{strength.label}</span>
              </div>

              {/* Requirements — show when focused or has content */}
              {(focusedPw || form.password.length > 0) && (
                <div className="sh-reg-reqs">
                  {pwReqs.map((r) => <Req key={r.label} met={r.met} label={r.label} />)}
                </div>
              )}

              {errors.password && <span className="sh-reg-err">{errors.password}</span>}
            </div>

            {/* Submit */}
            <div className="sh-a5">
              <button type="submit" className="sh-reg-btn" disabled={submitting}>
                {submitting ? (
                  <><div className="sh-reg-spinner" />Creating account...</>
                ) : (
                  <>Create account <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </form>

          {/* Social sign-up */}
          <div className="sh-reg-divider sh-a6">
            <div className="sh-reg-divline" />
            <span className="sh-reg-divtxt">or sign up with</span>
            <div className="sh-reg-divline" />
          </div>

          <div className="sh-reg-social sh-a6">
            <button className="sh-reg-sbtn" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button className="sh-reg-sbtn" type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
            <button className="sh-reg-sbtn" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <p className="sh-reg-footer sh-a7">
            Already on StartupHub?{' '}
            <Link to="/login" className="sh-reg-flink">Sign in</Link>
          </p>
          <p className="sh-reg-terms">
            By creating an account, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </>
  )
}
