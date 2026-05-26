import { Compass, FileText, Plus, RefreshCw, TrendingUp, Users, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { getSuggested } from '../api/discover'
import { followUser, unfollowUser } from '../api/profile'
import { getStartups } from '../api/startups'
import Avatar from '../components/common/Avatar.jsx'
import { useToast } from '../components/common/Toast.jsx'
import PostCard from '../components/post/PostCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { usePosts } from '../hooks/usePosts.js'
import { getErrorMessage } from '../utils/apiError.js'

const S = {
  page: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) 300px',
    gap: '20px',
    fontFamily: 'var(--font-sans)',
  },
  card: {
    background: 'var(--sh-surface)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  feedHeaderWrap: {
    padding: '22px 22px 0',
  },
  feedTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  feedTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--sh-text-primary)',
    letterSpacing: '-0.3px',
  },
  feedSub: {
    fontSize: '13px',
    color: 'var(--sh-text-secondary)',
    marginTop: '2px',
  },
  feedIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(52,211,153,0.12)',
    border: '0.5px solid rgba(52,211,153,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#34d399',
  },
  storiesRow: {
    display: 'flex',
    gap: '12px',
    padding: '16px 22px 20px',
    overflowX: 'auto',
    scrollbarWidth: 'none',
  },
  storyItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    flexShrink: 0,
    textDecoration: 'none',
  },
  storyRing: {
    padding: '2.5px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #34d399, #6366f1)',
  },
  storyRingSeen: {
    padding: '2.5px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
  },
  storyAvatarWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'var(--sh-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  storyName: {
    fontSize: '11px',
    color: 'var(--sh-text-secondary)',
    maxWidth: '56px',
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  composeWrap: {
    margin: '0 22px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'var(--sh-surface2)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '12px',
    padding: '10px 14px',
    cursor: 'text',
    transition: 'border-color 0.2s',
  },
  composeText: {
    flex: 1,
    fontSize: '13.5px',
    color: 'var(--sh-text-muted)',
  },
  composeBtn: {
    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
    border: 'none',
    borderRadius: '8px',
    padding: '7px 16px',
    fontFamily: 'var(--font-display)',
    fontSize: '12px',
    fontWeight: 700,
    color: '#fff',
    cursor: 'pointer',
    letterSpacing: '0.2px',
    flexShrink: 0,
    transition: 'opacity 0.15s, transform 0.15s',
    boxShadow: '0 2px 12px rgba(52,211,153,0.2)',
  },
  postOuter: {
    background: 'var(--sh-surface)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  sidebarCard: {
    background: 'var(--sh-surface)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '16px',
    padding: '18px',
    overflow: 'hidden',
  },
  sidebarTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
  },
  sidebarTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--sh-text-primary)',
    letterSpacing: '-0.2px',
  },
  refreshBtn: {
    background: 'none',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '7px',
    padding: '4px 9px',
    fontSize: '11.5px',
    color: 'var(--sh-text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 0.15s, color 0.15s',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderTop: '0.5px solid var(--sh-border)',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--sh-text-primary)',
    fontFamily: 'var(--font-display)',
  },
  userRole: {
    fontSize: '11.5px',
    color: 'var(--sh-text-secondary)',
    marginTop: '1px',
  },
  followBtn: {
    marginLeft: 'auto',
    background: 'transparent',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '7px',
    padding: '4px 12px',
    fontSize: '11.5px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    color: 'var(--sh-text-secondary)',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  followingBtn: {
    marginLeft: 'auto',
    background: 'rgba(52,211,153,0.1)',
    border: '0.5px solid rgba(52,211,153,0.25)',
    borderRadius: '7px',
    padding: '4px 12px',
    fontSize: '11.5px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    color: '#34d399',
    flexShrink: 0,
  },
  startupItem: {
    borderRadius: '10px',
    background: 'var(--sh-surface2)',
    border: '0.5px solid var(--sh-border)',
    padding: '12px 13px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
    display: 'block',
    textDecoration: 'none',
  },
  startupName: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--sh-text-primary)',
    fontFamily: 'var(--font-display)',
  },
  startupIndustry: {
    fontSize: '11.5px',
    color: 'var(--sh-text-secondary)',
    marginTop: '2px',
  },
  startupLoc: {
    fontSize: '11px',
    color: 'var(--sh-text-muted)',
    marginTop: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  startupFollowers: {
    marginTop: '10px',
    fontSize: '11.5px',
    color: '#34d399',
    fontWeight: 600,
  },
  ctaCard: {
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(99,102,241,0.15) 100%)',
    border: '0.5px solid rgba(52,211,153,0.2)',
    padding: '18px',
    position: 'relative',
    overflow: 'hidden',
  },
  skeleton: {
    background: 'linear-gradient(90deg, var(--sh-surface2) 25%, rgba(255,255,255,0.04) 50%, var(--sh-surface2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '8px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    color: 'var(--sh-text-muted)',
    textAlign: 'center',
  },
}

function rotateSlice(items, startIndex, size) {
  if (items.length <= size) {
    return items
  }

  const start = startIndex % items.length
  const visible = items.slice(start, start + size)
  if (visible.length === size) {
    return visible
  }

  return [...visible, ...items.slice(0, size - visible.length)]
}

function getRoleLabel(user) {
  return user.role ? user.role.replaceAll('_', ' ') : user.email
}

function getFirstName(name = '') {
  return name.trim().split(' ')[0] || 'User'
}

function SuggestedUser({ user, updating, onToggle }) {
  const isFollowing = Boolean(user.followedByCurrentUser)

  return (
    <div style={S.userRow}>
      <Link
        to={`/profile/${user.id}`}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, textDecoration: 'none' }}
      >
        <Avatar src={user.profilePhoto} name={user.name} size="sm" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={S.userName}>{user.name}</div>
          <div style={S.userRole}>{getRoleLabel(user)}</div>
        </div>
      </Link>
      <button
        type="button"
        style={isFollowing ? S.followingBtn : S.followBtn}
        disabled={updating}
        onClick={() => onToggle(user)}
      >
        {updating ? 'Saving...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}

export default function FeedPage() {
  const { openCreatePost } = useOutletContext()
  const { currentUser } = useAuth()
  const { posts, setPosts, loading } = usePosts()
  const [suggested, setSuggested] = useState([])
  const [trendingStartups, setTrendingStartups] = useState([])
  const [sideLoading, setSideLoading] = useState(true)
  const [suggestionOffset, setSuggestionOffset] = useState(0)
  const [seenStoryIds, setSeenStoryIds] = useState(() => new Set())
  const [updatingFollowId, setUpdatingFollowId] = useState(null)
  const { showToast } = useToast()

  useEffect(() => {
    let ignore = false

    async function loadSideContent() {
      setSideLoading(true)
      try {
        const [suggestions, startups] = await Promise.all([getSuggested(), getStartups()])
        if (ignore) {
          return
        }

        const normalizedSuggestions = suggestions
          .filter((item) => item.id !== currentUser?.id)
          .map((item) => ({
            ...item,
            followedByCurrentUser: item.followedByCurrentUser ?? false,
          }))
        const rankedStartups = [...startups]
          .sort((left, right) => right.followerCount - left.followerCount)
          .slice(0, 3)

        setSuggested(normalizedSuggestions)
        setTrendingStartups(rankedStartups)
      } catch (error) {
        if (!ignore) {
          showToast({
            title: 'Feed extras unavailable',
            message: getErrorMessage(error, 'Suggested people and startups could not be loaded.'),
            tone: 'error',
          })
          setSuggested([])
          setTrendingStartups([])
        }
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
  }, [currentUser?.id, showToast])

  const storyUsers = useMemo(() => suggested.slice(0, 6), [suggested])
  const visibleSuggestions = useMemo(() => rotateSlice(suggested, suggestionOffset, 4), [suggested, suggestionOffset])

  function updatePost(updatedPost) {
    setPosts((current) => current.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
  }

  function markStorySeen(id) {
    setSeenStoryIds((current) => {
      const next = new Set(current)
      next.add(id)
      return next
    })
  }

  async function handleFollowToggle(user) {
    setUpdatingFollowId(user.id)
    setSuggested((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, followedByCurrentUser: !item.followedByCurrentUser }
          : item,
      ),
    )

    try {
      const updated = user.followedByCurrentUser ? await unfollowUser(user.id) : await followUser(user.id)
      setSuggested((current) =>
        current.map((item) =>
          item.id === user.id
            ? { ...item, followedByCurrentUser: updated.followedByCurrentUser }
            : item,
        ),
      )
    } catch (error) {
      setSuggested((current) =>
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
    } finally {
      setUpdatingFollowId(null)
    }
  }

  function refreshSuggested() {
    if (suggested.length <= 4) {
      return
    }
    setSuggestionOffset((current) => (current + 4) % suggested.length)
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .sh-compose-wrap:focus-within { border-color: rgba(52,211,153,0.35) !important; }
        .sh-startup-item:hover { border-color: rgba(52,211,153,0.3) !important; background: rgba(52,211,153,0.06) !important; }
      `}</style>

      <div style={S.page}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.card}>
            <div style={S.feedHeaderWrap}>
              <div style={S.feedTitleRow}>
                <div>
                  <p style={S.feedTitle}>Momentum Feed</p>
                  <p style={S.feedSub}>Fresh updates from founders and operators in your network.</p>
                </div>
                <div style={S.feedIconBox}>
                  <Zap size={16} />
                </div>
              </div>
            </div>

            <div style={S.storiesRow}>
              {sideLoading ? (
                [1, 2, 3, 4].map((item) => (
                  <div key={item} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ ...S.skeleton, width: '54px', height: '54px', borderRadius: '50%' }} />
                    <div style={{ ...S.skeleton, width: '44px', height: '9px' }} />
                  </div>
                ))
              ) : storyUsers.length > 0 ? (
                storyUsers.map((user) => {
                  const seen = seenStoryIds.has(user.id)

                  return (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      style={S.storyItem}
                      onClick={() => markStorySeen(user.id)}
                    >
                      <div style={seen ? S.storyRingSeen : S.storyRing}>
                        <div style={S.storyAvatarWrap}>
                          <Avatar src={user.profilePhoto} name={user.name} size="sm" className="h-11 w-11 rounded-full ring-0" />
                        </div>
                      </div>
                      <span style={S.storyName}>{getFirstName(user.name)}</span>
                    </Link>
                  )
                })
              ) : (
                <div style={{ color: 'var(--sh-text-muted)', fontSize: '12px' }}>People you follow will appear here.</div>
              )}
            </div>

            <div className="sh-compose-wrap" style={S.composeWrap} onClick={openCreatePost}>
              <Avatar src={currentUser?.profilePhoto} name={currentUser?.name || 'Me'} size="sm" className="h-8 w-8 rounded-xl ring-0" />
              <span style={S.composeText}>Share an update with your network...</span>
              <button
                type="button"
                style={S.composeBtn}
                onClick={(event) => {
                  event.stopPropagation()
                  openCreatePost()
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.opacity = '0.88'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.opacity = '1'
                  event.currentTarget.style.transform = 'none'
                }}
              >
                <Plus size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                Post
              </button>
            </div>
          </div>

          {loading ? (
            [1, 2].map((item) => (
              <div key={item} style={S.postOuter}>
                <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ ...S.skeleton, width: '38px', height: '38px', borderRadius: '50%' }} />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ ...S.skeleton, width: '130px', height: '12px' }} />
                      <div style={{ ...S.skeleton, width: '80px', height: '10px' }} />
                    </div>
                  </div>
                  <div style={{ ...S.skeleton, width: '100%', height: '11px' }} />
                  <div style={{ ...S.skeleton, width: '80%', height: '11px' }} />
                  <div style={{ ...S.skeleton, width: '60%', height: '11px' }} />
                </div>
              </div>
            ))
          ) : posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} onUpdate={updatePost} />)
          ) : (
            <div style={S.postOuter}>
              <div style={S.emptyState}>
                <FileText size={32} style={{ color: 'var(--sh-text-muted)', marginBottom: '12px' }} />
                <p style={{ fontSize: '14px', color: 'var(--sh-text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '6px' }}>No posts yet</p>
                <p style={{ fontSize: '13px', color: 'var(--sh-text-muted)', maxWidth: '280px', lineHeight: 1.5 }}>
                  Follow more people to build your feed, or publish the first update from your account.
                </p>
                <button
                  type="button"
                  onClick={openCreatePost}
                  style={{ marginTop: '16px', background: 'rgba(52,211,153,0.12)', border: '0.5px solid rgba(52,211,153,0.25)', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 600, color: '#34d399', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
                >
                  Create post
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={S.sidebarCard}>
            <div style={S.sidebarTitleRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Users size={14} color="#34d399" />
                <span style={S.sidebarTitle}>Suggested People</span>
              </div>
              <button
                type="button"
                style={S.refreshBtn}
                onClick={refreshSuggested}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = 'rgba(52,211,153,0.3)'
                  event.currentTarget.style.color = '#34d399'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = 'var(--sh-border)'
                  event.currentTarget.style.color = 'var(--sh-text-secondary)'
                }}
              >
                <RefreshCw size={11} />
                Refresh
              </button>
            </div>

            {sideLoading ? (
              [1, 2, 3].map((item) => (
                <div key={item} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 0', borderTop: '0.5px solid var(--sh-border)' }}>
                  <div style={{ ...S.skeleton, width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ ...S.skeleton, width: '100px', height: '10px' }} />
                    <div style={{ ...S.skeleton, width: '70px', height: '9px' }} />
                  </div>
                </div>
              ))
            ) : visibleSuggestions.length > 0 ? (
              visibleSuggestions.map((user) => (
                <SuggestedUser
                  key={user.id}
                  user={user}
                  updating={updatingFollowId === user.id}
                  onToggle={handleFollowToggle}
                />
              ))
            ) : (
              <div style={{ ...S.emptyState, padding: '24px' }}>
                <Compass size={24} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '12px' }}>No suggestions yet.</p>
              </div>
            )}
          </div>

          <div style={S.sidebarCard}>
            <div style={{ ...S.sidebarTitleRow, marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <TrendingUp size={14} color="#34d399" />
                <span style={S.sidebarTitle}>Trending Startups</span>
              </div>
            </div>

            {sideLoading ? (
              [1, 2, 3].map((item) => (
                <div key={item} style={{ ...S.skeleton, height: '72px', borderRadius: '10px', marginBottom: '8px' }} />
              ))
            ) : trendingStartups.length > 0 ? (
              trendingStartups.map((startup) => (
                <Link
                  key={startup.id}
                  to={`/startups/${startup.id}`}
                  className="sh-startup-item"
                  style={S.startupItem}
                >
                  <div style={S.startupName}>{startup.name}</div>
                  <div style={S.startupIndustry}>
                    {startup.industry || `@${startup.slug}`}
                  </div>
                  {startup.location ? (
                    <div style={S.startupLoc}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', flexShrink: 0, display: 'inline-block' }} />
                      {startup.location}
                    </div>
                  ) : null}
                  <div style={S.startupFollowers}>{startup.followerCount} followers</div>
                </Link>
              ))
            ) : (
              <div style={{ ...S.emptyState, padding: '24px' }}>
                <TrendingUp size={24} style={{ marginBottom: '8px' }} />
                <p style={{ fontSize: '12px' }}>No startup activity yet.</p>
              </div>
            )}
          </div>

          <div style={S.ctaCard}>
            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(99,102,241,0.12)', pointerEvents: 'none' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--sh-text-primary)', marginBottom: '5px' }}>Build your startup page</p>
            <p style={{ fontSize: '12px', color: 'var(--sh-text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>Create a public startup profile and turn feed attention into followers.</p>
            <Link
              to="/startups"
              style={{ display: 'block', width: '100%', background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', border: 'none', borderRadius: '9px', padding: '9px', fontFamily: 'var(--font-display)', fontSize: '12.5px', fontWeight: 700, color: '#fff', cursor: 'pointer', boxShadow: '0 3px 16px rgba(52,211,153,0.25)', transition: 'opacity 0.15s', textAlign: 'center', textDecoration: 'none' }}
            >
              Open startup directory
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
