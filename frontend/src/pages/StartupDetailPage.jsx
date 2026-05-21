import { Globe, MapPin, UserPlus2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { followStartup, getStartup, unfollowStartup } from '../api/startups'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import SkeletonLoader from '../components/common/SkeletonLoader.jsx'
import { useToast } from '../components/common/Toast.jsx'
import { getErrorMessage } from '../utils/apiError.js'
import { formatNumber } from '../utils/formatNumber.js'

export default function StartupDetailPage() {
  const { id } = useParams()
  const [startup, setStartup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    let ignore = false

    async function load() {
      setLoading(true)
      try {
        const data = await getStartup(id)
        if (!ignore) {
          setStartup(data)
        }
      } catch (error) {
        showToast({
          title: 'Startup unavailable',
          message: getErrorMessage(error, 'The startup detail page could not be loaded.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      ignore = true
    }
  }, [id, showToast])

  async function handleFollowToggle() {
    const previous = startup
    setFollowLoading(true)
    setStartup((current) => ({
      ...current,
      followedByCurrentUser: !current.followedByCurrentUser,
      followerCount: current.followedByCurrentUser ? current.followerCount - 1 : current.followerCount + 1,
    }))
    try {
      const updated = startup.followedByCurrentUser
        ? await unfollowStartup(startup.id)
        : await followStartup(startup.id)
      setStartup(updated)
    } catch (error) {
      setStartup(previous)
      showToast({
        title: 'Follow failed',
        message: getErrorMessage(error, 'The startup follow action could not be completed.'),
        tone: 'error',
      })
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return <SkeletonLoader className="h-[560px] w-full" />
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-52 bg-gradient-to-r from-primary/30 via-slate-800 to-emerald-500/25 md:h-64" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <Avatar src={startup.logoUrl} name={startup.name} size="xl" className="h-24 w-24 rounded-[28px] border-4 border-[rgb(var(--bg))]" />
              <div>
                <h1 className="font-display text-4xl font-extrabold">{startup.name}</h1>
                <p className="mt-2 subtle-text">@{startup.slug}</p>
              </div>
            </div>
            <Button
              onClick={handleFollowToggle}
              variant={startup.followedByCurrentUser ? 'secondary' : 'success'}
              loading={followLoading}
            >
              <UserPlus2 size={16} />
              {startup.followedByCurrentUser ? 'Following Startup' : 'Follow Startup'}
            </Button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-bold">About</h2>
                {startup.description ? <p className="mt-3 text-left text-sm leading-7 text-[rgb(var(--text-soft))]">{startup.description}</p> : null}
              </div>
              <div className="flex flex-wrap gap-3">
                {startup.industry && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {startup.industry}
                  </span>
                )}
                {startup.location && (
                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-[rgb(var(--text-soft))]">
                    {startup.location}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-sm text-[rgb(var(--text-soft))]">Followers</p>
                <p className="mt-2 text-3xl font-bold">{formatNumber(startup.followerCount)}</p>
              </div>
              {startup.website && (
                <a href={startup.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-3xl bg-white/5 p-5 hover:bg-white/10">
                  <Globe size={18} />
                  <span>Visit website</span>
                </a>
              )}
              {startup.location && (
                <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-5">
                  <MapPin size={18} />
                  <span>{startup.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-2xl font-bold">Founder</h2>
        <div className="mt-4 flex items-center gap-4 rounded-3xl bg-white/5 p-5">
          <Avatar src={startup.owner.profilePhoto} name={startup.owner.name} size="lg" />
          <div className="flex-1">
            <p className="text-left font-semibold">{startup.owner.name}</p>
            <p className="text-left text-sm text-gray-400">{startup.owner.email}</p>
          </div>
          <Link to={`/profile/${startup.owner.id}`}>
            <Button variant="secondary">Connect with Founder</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
