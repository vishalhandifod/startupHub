import { useState } from 'react'
import Button from '../common/Button.jsx'
import { useToast } from '../common/Toast.jsx'
import { uploadStartupLogo } from '../../api/uploads'
import { getErrorMessage } from '../../utils/apiError'

const initialState = {
  name: '',
  slug: '',
  description: '',
  logoUrl: '',
  website: '',
  industry: '',
  location: '',
}

export default function StartupForm({ onSubmit, initialValues = initialState, submitLabel = 'Create startup' }) {
  const [form, setForm] = useState(initialValues)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState({})
  const { showToast } = useToast()

  function validate() {
    const nextErrors = {}
    if (!form.name.trim()) nextErrors.name = 'Startup name is required.'
    if (!form.slug.trim()) nextErrors.slug = 'A unique startup slug is required.'
    if (form.description.length > 2000) nextErrors.description = 'Keep the description under 2000 characters.'
    return nextErrors
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = await uploadStartupLogo(file)
      setForm((current) => ({ ...current, logoUrl: path }))
      showToast({
        title: 'Logo uploaded',
        message: 'Your startup logo is ready to publish.',
        tone: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Upload failed',
        message: getErrorMessage(error, 'The startup logo could not be uploaded.'),
        tone: 'error',
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(form)
      setForm(initialState)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Startup name</span>
          <input
            className="input-base"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
        </label>
        <label className="space-y-2 text-sm">
          <span>Startup slug</span>
          <input
            className="input-base"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value.toLowerCase().replace(/\s+/g, '-') }))}
          />
          {errors.slug && <p className="text-xs text-rose-400">{errors.slug}</p>}
        </label>
      </div>
      <label className="space-y-2 text-sm">
        <span>Description</span>
        <textarea
          className="input-base min-h-[120px]"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />
        {errors.description && <p className="text-xs text-rose-400">{errors.description}</p>}
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Website</span>
          <input
            className="input-base"
            value={form.website}
            onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Industry</span>
          <select
            className="input-base"
            value={form.industry}
            onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))}
          >
            <option value="">Select industry</option>
            <option value="Fintech">Fintech</option>
            <option value="AI">AI</option>
            <option value="Climate">Climate</option>
            <option value="SaaS">SaaS</option>
            <option value="Healthtech">Healthtech</option>
            <option value="Developer Tools">Developer Tools</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span>Location</span>
          <input
            className="input-base"
            value={form.location}
            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span>Logo</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="input-base file:mr-3 file:rounded-xl file:border-0 file:bg-primary/15 file:px-3 file:py-2 file:text-primary" />
          {uploading && <p className="text-xs text-[rgb(var(--text-soft))]">Uploading logo...</p>}
        </label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
