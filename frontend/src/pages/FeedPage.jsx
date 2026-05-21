import { Compass, FileText, Sparkles, TrendingUp, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getSuggested } from '../api/discover'
import { getStartups } from '../api/startups'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SkeletonLoader from '../components/common/SkeletonLoader.jsx'
import { useToast } from '../components/common/Toast.jsx'
import PostCard from '../components/post/PostCard.jsx'
import { usePosts } from '../hooks/usePosts.js'
import { getErrorMessage } from '../utils/apiError.js'

export default function FeedPage() {
  const { openCreatePost } = useOutletContext()
  const { posts, setPosts, loading } = usePosts()
  const [suggested, setSuggested] = useState([])
  const [trendingStartups, setTrendingStartups] = useState([])
  const [sideLoading, setSideLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    let ignore = false

    async function loadSideContent() {
      setSideLoading(true)
      try {
        const [suggestions, startups] = await Promise.all([getSuggested(), getStartups()])
        if (!ignore) {
          setSuggested(suggestions.slice(0, 4))
          setTrendingStartups(startups.slice(0, 3))
        }
      } catch (error) {
        showToast({
          title: 'Feed extras unavailable',
          message: getErrorMessage(error, 'Suggestions could not be loaded right now.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setSideLoading(false)
        }
      }
    }

    loadSideContent()

    return () => {
      ignore = true
    }
  }, [showToast])

  function updatePost(updatedPost) {
    setPosts((current) => current.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
  }

  async function refreshSideContent() {
    setSideLoading(true)
    try {
      const [suggestions, startups] = await Promise.all([getSuggested(), getStartups()])
      setSuggested(suggestions.slice(0, 4))
      setTrendingStartups(startups.slice(0, 3))
    } catch (error) {
      showToast({
        title: 'Refresh failed',
        message: getErrorMessage(error, 'Suggestions could not be refreshed.'),
        tone: 'error',
      })
    } finally {
      setSideLoading(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Card className="overflow-hidden p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-2xl font-bold">Momentum Feed</p>
              <p className="mt-1 subtle-text">Fresh updates from the founders and operators in your orbit.</p>
            </div>
            <Sparkles className="text-primary" />
          </div>
          <div className="hide-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
            {sideLoading ? (
              <>
                <SkeletonLoader className="h-24 w-24 rounded-full" />
                <SkeletonLoader className="h-24 w-24 rounded-full" />
                <SkeletonLoader className="h-24 w-24 rounded-full" />
              </>
            ) : suggested.length > 0 ? (
              suggested.map((user) => (
                <div key={user.id} className="min-w-[90px] text-center">
                  <div className="mx-auto rounded-full bg-gradient-to-br from-primary to-emerald-400 p-[3px]">
                    <Avatar src={user.profilePhoto} name={user.name} size="lg" className="rounded-full" />
                  </div>
                  <p className="mt-2 truncate text-xs font-medium">{user.name}</p>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Users}
                title="No people yet"
                message="Follow people to see them appear here."
                className="w-full py-8"
              />
            )}
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            <SkeletonLoader className="h-56 w-full" />
            <SkeletonLoader className="h-72 w-full" />
          </div>
        ) : (
          <div className="space-y-5">
            {posts.length > 0 ? (
              posts.map((post) => <PostCard key={post.id} post={post} onUpdate={updatePost} />)
            ) : (
              <EmptyState
                icon={FileText}
                title="No posts yet"
                message="Follow some people to see their posts, or publish the first update from your account."
                actionLabel="Create post"
                onAction={openCreatePost}
              />
            )}
          </div>
        )}
      </div>

      <div className="hidden space-y-6 xl:block">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-xl font-bold">Suggested Users</p>
            <Button variant="ghost" size="sm" onClick={refreshSideContent} loading={sideLoading}>Refresh</Button>
          </div>
          {sideLoading ? (
            <div className="mt-4 space-y-4">
              <SkeletonLoader className="h-14 w-full" />
              <SkeletonLoader className="h-14 w-full" />
            </div>
          ) : suggested.length > 0 ? (
            <div className="mt-4 space-y-4">
              {suggested.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar src={user.profilePhoto} name={user.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-left text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Compass}
              title="No suggestions"
              message="Suggested people will appear here once the network grows."
              className="mt-4 py-8"
            />
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <p className="font-display text-xl font-bold">Trending Startups</p>
          </div>
          {sideLoading ? (
            <div className="mt-4 space-y-4">
              <SkeletonLoader className="h-20 w-full" />
              <SkeletonLoader className="h-20 w-full" />
            </div>
          ) : trendingStartups.length > 0 ? (
            <div className="mt-4 space-y-4">
              {trendingStartups.map((startup) => (
                <div key={startup.id} className="rounded-2xl bg-white/5 p-4">
                  <p className="text-left font-semibold">{startup.name}</p>
                  {startup.industry ? <p className="mt-1 text-sm text-gray-400">{startup.industry}</p> : null}
                  {startup.location ? <p className="mt-3 text-left text-sm text-gray-400">{startup.location}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No startups to show"
              message="Startup activity will appear here when pages are created."
              className="mt-4 py-8"
            />
          )}
        </Card>
      </div>
    </div>
  )
}
