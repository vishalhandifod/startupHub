import { Rocket } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import Button from '../components/common/Button.jsx'
import { useToast } from '../components/common/Toast.jsx'
import { getErrorMessage } from '../utils/apiError.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const nextErrors = {}
    if (!form.email.trim()) nextErrors.email = 'Email is required.'
    if (!form.password) nextErrors.password = 'Password is required.'
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    try {
      await login(form)
      showToast({
        title: 'Welcome back',
        message: 'Your founder dashboard is ready.',
        tone: 'success',
      })
      navigate('/feed')
    } catch (error) {
      showToast({
        title: 'Sign in failed',
        message: getErrorMessage(error, 'Please check your email and password.'),
        tone: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-primary/25 via-slate-900 to-emerald-500/10 p-10 lg:block">
          <div className="max-w-lg">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">
              <Rocket size={16} />
              Startup social, built for momentum
            </p>
            <h1 className="mt-8 font-display text-6xl font-extrabold leading-tight text-white">
              Raise attention before you raise a round.
            </h1>
            <p className="mt-6 text-lg text-slate-300">
              StartupHub brings founders, startup operators, angel investors, and product builders into one premium network.
            </p>
          </div>
        </div>

        <div className="glass-panel mx-auto w-full max-w-xl p-8 md:p-10">
          <div className="text-left">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15 text-primary">
              <Rocket size={28} />
            </div>
            <h1 className="mt-6 font-display text-4xl font-extrabold">StartupHub</h1>
            <p className="mt-3 subtle-text">Sign in to your founder network.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              />
              {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
            </label>
            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center subtle-text">
            New to StartupHub?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
