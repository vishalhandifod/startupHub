import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { commentPost } from '../../api/posts'
import { getErrorMessage } from '../../utils/apiError'
import { timeAgo } from '../../utils/timeAgo'
import Avatar from '../common/Avatar.jsx'
import Button from '../common/Button.jsx'
import EmptyState from '../common/EmptyState.jsx'
import { useToast } from '../common/Toast.jsx'

export default function CommentThread({ comments, postId, onCommentAdded }) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(event) {
    event.preventDefault()
    if (!content.trim()) {
      return
    }

    setSubmitting(true)
    try {
      const comment = await commentPost(postId, { content })
      onCommentAdded(comment)
      setContent('')
    } catch (error) {
      showToast({
        title: 'Comment failed',
        message: getErrorMessage(error, 'Your comment could not be posted.'),
        tone: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 rounded-2xl bg-white/5 p-3">
              <Avatar src={comment.author.profilePhoto} name={comment.author.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-left text-sm font-semibold">{comment.author.name}</p>
                  <span className="text-sm text-gray-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-1 text-left text-sm text-[rgb(var(--text-soft))]">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageCircle}
          title="No comments yet"
          message="Be the first person to join this conversation."
          className="py-8"
        />
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <input
          className="input-base flex-1"
          placeholder="Add a comment"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <Button type="submit" loading={submitting} disabled={!content.trim()}>
          Reply
        </Button>
      </form>
    </div>
  )
}
