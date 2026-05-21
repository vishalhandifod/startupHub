import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getComments, likePost, unlikePost } from '../../api/posts'
import { formatNumber } from '../../utils/formatNumber'
import { getErrorMessage } from '../../utils/apiError'
import { timeAgo } from '../../utils/timeAgo'
import Avatar from '../common/Avatar.jsx'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import { useToast } from '../common/Toast.jsx'
import CommentThread from './CommentThread.jsx'

export default function PostCard({ post, onUpdate }) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [liking, setLiking] = useState(false)
  const [saved, setSaved] = useState(false)
  const { showToast } = useToast()

  async function toggleLike() {
    setLiking(true)
    try {
      const next = post.likedByCurrentUser ? await unlikePost(post.id) : await likePost(post.id)
      onUpdate(next)
    } catch (error) {
      showToast({
        title: 'Action failed',
        message: getErrorMessage(error, 'The post interaction could not be completed.'),
        tone: 'error',
      })
    } finally {
      setLiking(false)
    }
  }

  async function handleToggleComments() {
    const nextOpen = !commentsOpen
    setCommentsOpen(nextOpen)

    if (nextOpen && comments.length === 0) {
      setLoadingComments(true)
      try {
        const data = await getComments(post.id)
        setComments(data)
      } catch (error) {
        showToast({
          title: 'Comments unavailable',
          message: getErrorMessage(error, 'Comments could not be loaded right now.'),
          tone: 'error',
        })
      } finally {
        setLoadingComments(false)
      }
    }
  }

  function handleCommentAdded(comment) {
    setComments((current) => [...current, comment])
    onUpdate({
      ...post,
      commentCount: post.commentCount + 1,
    })
  }

  return (
    <Card className="animate-fade-up overflow-hidden p-5">
      <div className="flex items-center gap-3">
        <Avatar src={post.author.profilePhoto} name={post.author.name} />
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${post.author.id}`} className="truncate text-sm font-semibold hover:text-primary">
            {post.author.name}
          </Link>
          <p className="text-sm text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <p className="whitespace-pre-wrap text-left text-sm leading-7 text-[rgb(var(--text))]">{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.content}
            className="w-full rounded-3xl border border-white/10 object-cover"
          />
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className={`${post.likedByCurrentUser ? 'text-rose-400' : ''}`}
            onClick={toggleLike}
            loading={liking}
          >
            <Heart size={18} fill={post.likedByCurrentUser ? 'currentColor' : 'none'} />
            {formatNumber(post.likeCount)}
          </Button>
          <Button type="button" variant="ghost" onClick={handleToggleComments}>
            <MessageCircle size={18} />
            {formatNumber(post.commentCount)}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              showToast({
                title: 'Share link copied',
                message: 'The post link is ready to share.',
                tone: 'success',
              })
            }
          >
            <Send size={18} />
          </Button>
        </div>
        <Button type="button" variant="ghost" onClick={() => setSaved((current) => !current)}>
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </Button>
      </div>

      {commentsOpen && (
        <>
          {loadingComments ? (
            <div className="mt-4 rounded-2xl bg-white/5 p-4 text-sm text-[rgb(var(--text-soft))]">
              Loading comments...
            </div>
          ) : (
            <CommentThread comments={comments} postId={post.id} onCommentAdded={handleCommentAdded} />
          )}
        </>
      )}
    </Card>
  )
}
