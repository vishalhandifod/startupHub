import { Search, UserRoundSearch, Building2, FileSearch } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getSuggested, searchPosts, searchStartups, searchUsers } from '../api/discover'
import { getStartups } from '../api/startups'
import Card from '../components/common/Card.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SkeletonLoader from '../components/common/SkeletonLoader.jsx'
import { useToast } from '../components/common/Toast.jsx'
import PostCard from '../components/post/PostCard.jsx'
import StartupCard from '../components/startup/StartupCard.jsx'
import UserCard from '../components/user/UserCard.jsx'
import { followUser, unfollowUser } from '../api/profile'
import { getErrorMessage } from '../utils/apiError.js'

const tabs = ['All', 'People', 'Startups', 'Posts']

export default function DiscoverPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [people, setPeople] = useState([])
  const [startups, setStartups] = useState([])
  const [posts, setPosts] = useState([])
  const [defaultPeople, setDefaultPeople] = useState([])
  const [defaultStartups, setDefaultStartups] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    let ignore = false

    async function loadInitial() {
      setLoading(true)
      try {
        const [suggestions, startupResults] = await Promise.all([getSuggested(), getStartups()])
        if (!ignore) {
          const normalizedPeople = suggestions.map((item) => ({
            ...item,
            followedByCurrentUser: item.followedByCurrentUser ?? false,
          }))
          setPeople(normalizedPeople)
          setDefaultPeople(normalizedPeople)
          setStartups(startupResults)
          setDefaultStartups(startupResults)
          setPosts([])
        }
      } catch (error) {
        showToast({
          title: 'Discover unavailable',
          message: getErrorMessage(error, 'Suggestions could not be loaded.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadInitial()

    return () => {
      ignore = true
    }
  }, [showToast])

  useEffect(() => {
    let ignore = false

    async function runSearch() {
      if (!query.trim()) {
        setPeople(defaultPeople)
        setStartups(defaultStartups)
        setPosts([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const [userResults, startupResults, postResults] = await Promise.all([
          searchUsers(query),
          searchStartups(query),
          searchPosts(query),
        ])

        if (!ignore) {
          setPeople(userResults)
          setStartups(startupResults)
          setPosts(postResults)
        }
      } catch (error) {
        showToast({
          title: 'Search failed',
          message: getErrorMessage(error, 'The discover search could not be completed.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    const timer = window.setTimeout(runSearch, 250)
    return () => {
      ignore = true
      window.clearTimeout(timer)
    }
  }, [defaultPeople, defaultStartups, query, showToast])

  async function handleFollowToggle(user) {
    setPeople((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, followedByCurrentUser: !item.followedByCurrentUser }
          : item,
      ),
    )
    try {
      const updated = user.followedByCurrentUser ? await unfollowUser(user.id) : await followUser(user.id)
      setPeople((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, followedByCurrentUser: updated.followedByCurrentUser }
            : item,
        ),
      )
    } catch (error) {
      setPeople((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, followedByCurrentUser: user.followedByCurrentUser }
            : item,
        ),
      )
      showToast({
        title: 'Follow update failed',
        message: getErrorMessage(error, 'The follow action could not be completed.'),
        tone: 'error',
      })
    }
  }

  const visibleSections = useMemo(() => {
    return {
      people: activeTab === 'All' || activeTab === 'People',
      startups: activeTab === 'All' || activeTab === 'Startups',
      posts: activeTab === 'All' || activeTab === 'Posts',
    }
  }, [activeTab])

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="page-title">Discover</h1>
            <p className="mt-2 subtle-text">Find founders, operators, startups, and post conversations worth joining.</p>
          </div>
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--text-soft))]" size={18} />
            <input
              className="input-base pl-11"
              placeholder="Search people, startups, or post themes"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? 'bg-primary text-white' : 'bg-white/5 text-[rgb(var(--text-soft))] hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonLoader className="h-56" />
          <SkeletonLoader className="h-56" />
          <SkeletonLoader className="h-56" />
        </div>
      ) : (
        <div className="space-y-8">
          {visibleSections.people && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">People you might know</h2>
              {people.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {people.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      isFollowing={user.followedByCurrentUser}
                      onFollowToggle={() => handleFollowToggle(user)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={UserRoundSearch}
                  title="No people found"
                  message={query ? 'No results found for your search.' : 'Suggested people will appear here when available.'}
                />
              )}
            </section>
          )}

          {visibleSections.startups && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">Startup radar</h2>
              {startups.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {startups.map((startup) => (
                    <StartupCard key={startup.id} startup={startup} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Building2}
                  title="No startups found"
                  message={query ? 'No results found for your search.' : 'Startup pages will appear here once they are created.'}
                />
              )}
            </section>
          )}

          {visibleSections.posts && (
            <section>
              <h2 className="mb-4 font-display text-2xl font-bold">Posts to explore</h2>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onUpdate={(updated) => setPosts((current) => current.map((item) => (item.id === updated.id ? updated : item)))} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={FileSearch}
                  title="No posts found"
                  message={query ? 'No results found for your search.' : 'Relevant posts will appear here when you search for topics.'}
                />
              )}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
