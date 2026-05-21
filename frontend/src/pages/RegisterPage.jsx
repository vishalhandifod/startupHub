import { Rocket } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import Button from '../components/common/Button.jsx'
import { useToast } from '../components/common/Toast.jsx'
import { getErrorMessage } from '../utils/apiError.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => {
    const password = form.password
    if (password.length >= 12) return { label: 'Strong', width: 'w-full', color: 'bg-emerald-500' }
    if (password.length >= 8) return { label: 'Good', width: 'w-2/3', color: 'bg-primary' }
    if (password.length > 0) return { label: 'Weak', width: 'w-1/3', color: 'bg-amber-500' }
    return { label: 'Start typing', width: 'w-0', color: 'bg-white/10' }
  }, [form.password])

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Name is required.'
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await register(form)
      showToast({
        title: 'Account created',
        message: 'Your StartupHub profile is live.',
        tone: 'success',
      })
      navigate('/feed')
    } catch (error) {
      showToast({
        title: 'Registration failed',
        message: getErrorMessage(error, 'Your account could not be created.'),
        tone: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-xl p-8 md:p-10">
        <div className="text-left">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15 text-primary">
            <Rocket size={28} />
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold">Join StartupHub</h1>
          <p className="mt-3 subtle-text">Build your founder presence, discover talent, and connect with startups.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Full name</span>
            <input
              className="input-base"
              placeholder="Enter your full name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              className="input-base"
              placeholder="Enter your email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              className="input-base"
              placeholder="Create a secure password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
            <div className="rounded-full bg-white/10 p-1">
              <div className={`h-2 rounded-full transition-all ${strength.width} ${strength.color}`} />
            </div>
            <p className="text-xs text-[rgb(var(--text-soft))]">Password strength: {strength.label}</p>
            {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
          </label>
            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Create Account
            </Button>
          </form>

        <p className="mt-6 text-center subtle-text">
          Already building here?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
