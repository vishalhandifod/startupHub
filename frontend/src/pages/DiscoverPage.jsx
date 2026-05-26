import { Search, UserRoundSearch, Building2, FileSearch, Compass, Users, Zap, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getSuggested, searchPosts, searchStartups, searchUsers } from '../api/discover'
import { getStartups } from '../api/startups'
import { useToast } from '../components/common/Toast.jsx'
import PostCard from '../components/post/PostCard.jsx'
import StartupCard from '../components/startup/StartupCard.jsx'
import UserCard from '../components/user/UserCard.jsx'
import { followUser, unfollowUser } from '../api/profile'
import { getErrorMessage } from '../utils/apiError.js'

const TABS = ['All', 'People', 'Startups', 'Posts']

const TAB_ICONS = {
  All: Compass,
  People: Users,
  Startups: TrendingUp,
  Posts: Zap,
}

/* ─── Style tokens mirroring MainLayout vars ─── */
const S = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    fontFamily: 'var(--font-sans)',
  },

  /* Header card */
  headerCard: {
    background: 'var(--sh-surface)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '16px',
    padding: '22px 24px 0',
    overflow: 'hidden',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },
  headerIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '11px',
    background: 'rgba(52,211,153,0.12)',
    border: '0.5px solid rgba(52,211,153,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#34d399',
    flexShrink: 0,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--sh-text-primary)',
    letterSpacing: '-0.4px',
    margin: 0,
  },
  pageSub: {
    fontSize: '13px',
    color: 'var(--sh-text-secondary)',
    marginTop: '4px',
  },

  /* Search */
  searchWrap: {
    position: 'relative',
    flex: '1',
    maxWidth: '440px',
    minWidth: '220px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--sh-text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: '40px',
    background: 'var(--sh-surface2)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '10px',
    padding: '0 16px 0 42px',
    fontSize: '13.5px',
    color: 'var(--sh-text-primary)',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    caretColor: '#34d399',
  },

  /* Tabs */
  tabsRow: {
    display: 'flex',
    gap: '2px',
    padding: '14px 0 0',
    borderTop: '0.5px solid var(--sh-border)',
    marginTop: '2px',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '0',
    border: 'none',
    background: 'transparent',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    color: 'var(--sh-text-secondary)',
    fontFamily: 'var(--font-sans)',
    transition: 'color 0.15s',
    position: 'relative',
    letterSpacing: '0.1px',
  },
  tabBtnActive: {
    color: '#34d399',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: '-1px',
    left: 0,
    right: 0,
    height: '2px',
    borderRadius: '2px 2px 0 0',
    background: '#34d399',
  },

  /* Section */
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--sh-text-primary)',
    letterSpacing: '-0.2px',
  },
  sectionPill: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '100px',
    background: 'rgba(52,211,153,0.1)',
    color: '#34d399',
    fontFamily: 'var(--font-display)',
  },
  sectionDivider: {
    flex: 1,
    height: '0.5px',
    background: 'var(--sh-border)',
  },

  /* Grid */
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '12px',
  },
  grid1: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  /* Skeleton */
  skeleton: {
    background: 'linear-gradient(90deg, var(--sh-surface2) 25%, rgba(255,255,255,0.04) 50%, var(--sh-surface2) 75%)',
    backgroundSize: '200% 100%',
    animation: 'sh-shimmer 1.4s infinite',
    borderRadius: '10px',
  },
  skeletonCard: {
    background: 'var(--sh-surface)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '14px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  /* Empty state */
  emptyCard: {
    background: 'var(--sh-surface)',
    border: '0.5px solid var(--sh-border)',
    borderRadius: '14px',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  emptyIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid var(--sh-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--sh-text-muted)',
    marginBottom: '4px',
  },
  emptyTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    fontWeight: 700,
    color: 'var(--sh-text-secondary)',
  },
  emptyMsg: {
    fontSize: '12.5px',
    color: 'var(--sh-text-muted)',
    maxWidth: '260px',
    lineHeight: 1.5,
  },

  /* Results info */
  resultsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(52,211,153,0.06)',
    border: '0.5px solid rgba(52,211,153,0.15)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--sh-text-secondary)',
  },
}

/* ─── Skeleton card ─── */
function SkeletonCard() {
  return (
    <div style={S.skeletonCard}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ ...S.skeleton, width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ ...S.skeleton, height: '11px', width: '120px' }} />
          <div style={{ ...S.skeleton, height: '10px', width: '80px' }} />
        </div>
      </div>
      <div style={{ ...S.skeleton, height: '10px', width: '100%' }} />
      <div style={{ ...S.skeleton, height: '10px', width: '75%' }} />
    </div>
  )
}

/* ─── Empty state ─── */
function EmptyBlock({ icon: Icon, title, message }) {
  return (
    <div style={S.emptyCard}>
      <div style={S.emptyIcon}><Icon size={20} /></div>
      <p style={S.emptyTitle}>{title}</p>
      <p style={S.emptyMsg}>{message}</p>
    </div>
  )
}

/* ─── Section wrapper ─── */
function Section({ title, pill, icon: Icon, children }) {
  return (
    <div style={S.section}>
      <div style={S.sectionHeader}>
        <Icon size={14} color="#34d399" />
        <span style={S.sectionTitle}>{title}</span>
        {pill != null && <span style={S.sectionPill}>{pill}</span>}
        <div style={S.sectionDivider} />
      </div>
      {children}
    </div>
  )
}

/* ─── Main component ─── */
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

  /* Initial load */
  useEffect(() => {
    let ignore = false
    async function loadInitial() {
      setLoading(true)
      try {
        const [suggestions, startupResults] = await Promise.all([getSuggested(), getStartups()])
        if (!ignore) {
          const normalizedPeople = suggestions.map(item => ({
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
        if (!ignore) setLoading(false)
      }
    }
    loadInitial()
    return () => { ignore = true }
  }, [showToast])

  /* Search with debounce */
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
        if (!ignore) setLoading(false)
      }
    }
    const timer = window.setTimeout(runSearch, 250)
    return () => { ignore = true; window.clearTimeout(timer) }
  }, [defaultPeople, defaultStartups, query, showToast])

  async function handleFollowToggle(user) {
    setPeople(current =>
      current.map(item =>
        item.id === user.id ? { ...item, followedByCurrentUser: !item.followedByCurrentUser } : item
      )
    )
    try {
      const updated = user.followedByCurrentUser
        ? await unfollowUser(user.id)
        : await followUser(user.id)
      setPeople(current =>
        current.map(item =>
          item.id === user.id ? { ...item, followedByCurrentUser: updated.followedByCurrentUser } : item
        )
      )
    } catch (error) {
      setPeople(current =>
        current.map(item =>
          item.id === user.id ? { ...item, followedByCurrentUser: user.followedByCurrentUser } : item
        )
      )
      showToast({
        title: 'Follow update failed',
        message: getErrorMessage(error, 'The follow action could not be completed.'),
        tone: 'error',
      })
    }
  }

  const visibleSections = useMemo(() => ({
    people: activeTab === 'All' || activeTab === 'People',
    startups: activeTab === 'All' || activeTab === 'Startups',
    posts: activeTab === 'All' || activeTab === 'Posts',
  }), [activeTab])

  const totalResults = people.length + startups.length + posts.length
  const isSearching = query.trim().length > 0

  return (
    <>
      <style>{`
        @keyframes sh-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .sh-search-input:focus {
          border-color: rgba(52,211,153,0.4) !important;
          box-shadow: 0 0 0 3px rgba(52,211,153,0.07) !important;
          background: rgba(52,211,153,0.04) !important;
        }
        .sh-tab-btn:hover { color: var(--sh-text-primary) !important; }
        .sh-tab-btn:hover .sh-tab-icon { color: var(--sh-text-primary) !important; }
      `}</style>

      <div style={S.page}>

        {/* ── Header card ── */}
        <div style={S.headerCard}>
          <div style={S.headerTop}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
              <div style={S.headerIcon}>
                <Compass size={18} />
              </div>
              <div>
                <h1 style={S.pageTitle}>Discover</h1>
                <p style={S.pageSub}>Find founders, operators, startups, and conversations worth joining.</p>
              </div>
            </div>

            {/* Search */}
            <div style={S.searchWrap}>
              <Search size={16} style={S.searchIcon} />
              <input
                className="sh-search-input"
                style={S.searchInput}
                placeholder="Search people, startups, posts…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <div style={S.tabsRow}>
            {TABS.map(tab => {
              const Icon = TAB_ICONS[tab]
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  className="sh-tab-btn"
                  style={{ ...S.tabBtn, ...(isActive ? S.tabBtnActive : {}) }}
                  onClick={() => setActiveTab(tab)}
                >
                  <Icon
                    size={13}
                    className="sh-tab-icon"
                    color={isActive ? '#34d399' : undefined}
                    style={{ transition: 'color 0.15s' }}
                  />
                  {tab}
                  {isActive && <div style={S.tabUnderline} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Search results info bar ── */}
        {isSearching && !loading && (
          <div style={S.resultsBar}>
            <Search size={13} color="#34d399" />
            <span>
              {totalResults > 0
                ? <><span style={{ color: '#34d399', fontWeight: 600 }}>{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for <span style={{ color: 'var(--sh-text-primary)', fontWeight: 500 }}>"{query}"</span></>
                : <>No results for <span style={{ color: 'var(--sh-text-primary)', fontWeight: 500 }}>"{query}"</span></>
              }
            </span>
          </div>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[0, 1].map(s => (
              <div key={s} style={S.section}>
                <div style={S.sectionHeader}>
                  <div style={{ ...S.skeleton, width: '130px', height: '13px' }} />
                  <div style={S.sectionDivider} />
                </div>
                <div style={S.grid3}>
                  {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

            {/* People */}
            {visibleSections.people && (
              <Section
                title={isSearching ? 'People' : 'People you might know'}
                pill={people.length > 0 ? people.length : null}
                icon={Users}
              >
                {people.length > 0 ? (
                  <div style={S.grid3}>
                    {people.map(user => (
                      <UserCard
                        key={user.id}
                        user={user}
                        isFollowing={user.followedByCurrentUser}
                        onFollowToggle={() => handleFollowToggle(user)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBlock
                    icon={UserRoundSearch}
                    title="No people found"
                    message={isSearching ? 'No results matched your search.' : 'Suggested people will appear here when available.'}
                  />
                )}
              </Section>
            )}

            {/* Startups */}
            {visibleSections.startups && (
              <Section
                title={isSearching ? 'Startups' : 'Startup radar'}
                pill={startups.length > 0 ? startups.length : null}
                icon={TrendingUp}
              >
                {startups.length > 0 ? (
                  <div style={S.grid3}>
                    {startups.map(startup => (
                      <StartupCard key={startup.id} startup={startup} />
                    ))}
                  </div>
                ) : (
                  <EmptyBlock
                    icon={Building2}
                    title="No startups found"
                    message={isSearching ? 'No results matched your search.' : 'Startup pages will appear here once they are created.'}
                  />
                )}
              </Section>
            )}

            {/* Posts */}
            {visibleSections.posts && (
              <Section
                title="Posts to explore"
                pill={posts.length > 0 ? posts.length : null}
                icon={Zap}
              >
                {posts.length > 0 ? (
                  <div style={S.grid1}>
                    {posts.map(post => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onUpdate={updated =>
                          setPosts(current => current.map(item => item.id === updated.id ? updated : item))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyBlock
                    icon={FileSearch}
                    title="No posts found"
                    message={isSearching ? 'No results matched your search.' : 'Relevant posts will appear here when you search for topics.'}
                  />
                )}
              </Section>
            )}

          </div>
        )}
      </div>
    </>
  )
}
