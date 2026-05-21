import { ImagePlus, Lock, Users } from 'lucide-react'
import { useState } from 'react'
import { createPost } from '../../api/posts'
import { uploadPostImage } from '../../api/uploads'
import { getErrorMessage } from '../../utils/apiError'
import Button from '../common/Button.jsx'
import Modal from '../common/Modal.jsx'
import { useToast } from '../common/Toast.jsx'

export default function CreatePostModal({ isOpen, onClose }) {
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [audience, setAudience] = useState('public')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const { showToast } = useToast()

  function reset() {
    setContent('')
    setImageUrl('')
    setAudience('public')
    setError('')
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = await uploadPostImage(file)
      setImageUrl(path)
      showToast({
        title: 'Image ready',
        message: 'Your post image has been uploaded.',
        tone: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Upload failed',
        message: getErrorMessage(error, 'The image could not be uploaded.'),
        tone: 'error',
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!content.trim()) {
      setError('Write something meaningful before posting.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await createPost({ content, imageUrl })
      showToast({
        title: 'Post shared',
        message: audience === 'public' ? 'Your update is live on the founder feed.' : 'Your update has been shared.',
        tone: 'success',
      })
      reset()
      onClose()
    } catch (error) {
      setError(getErrorMessage(error, 'The post could not be published.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a founder update">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-2xl bg-primary/15 p-4 text-primary">
              <ImagePlus size={24} />
            </div>
            <div>
              <p className="font-semibold">Drag an image in or click to upload</p>
              <p className="mt-1 subtle-text">Product launch shots, event photos, or your latest build.</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          {uploading && <p className="mt-3 subtle-text">Uploading image...</p>}
          {imageUrl && (
            <img src={imageUrl} alt="Uploaded post" className="mt-4 w-full rounded-3xl border border-white/10 object-cover" />
          )}
        </div>

        <label className="block space-y-2 text-sm">
          <span>Caption</span>
          <textarea
            className="input-base min-h-[160px]"
            placeholder="Share what your team shipped, learned, raised, or unlocked this week."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <p className="subtle-text">Tip: add hashtags like #launchday #saas #founderstory for discoverability.</p>
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setAudience('public')}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              audience === 'public' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Users size={18} />
              Public
            </div>
            <p className="mt-1 text-sm text-[rgb(var(--text-soft))]">Visible to the entire StartupHub network.</p>
          </button>
          <button
            type="button"
            onClick={() => setAudience('followers')}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              audience === 'followers' ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              <Lock size={18} />
              Followers only
            </div>
            <p className="mt-1 text-sm text-[rgb(var(--text-soft))]">Private audience styling for a future backend rule.</p>
          </button>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting || uploading}>
            {submitting ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
