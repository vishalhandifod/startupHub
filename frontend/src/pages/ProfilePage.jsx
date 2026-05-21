import { Camera, MessageCircle, PencilLine, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGlobalFeed } from '../api/posts'
import {
  followUser,
  getFollowers,
  getFollowing,
  getMyProfile,
  getProfile,
  unfollowUser,
  updateProfile,
} from '../api/profile'
import { uploadProfilePhoto } from '../api/uploads'
import Avatar from '../components/common/Avatar.jsx'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import Modal from '../components/common/Modal.jsx'
import SkeletonLoader from '../components/common/SkeletonLoader.jsx'
import { useToast } from '../components/common/Toast.jsx'
import PostGrid from '../components/post/PostGrid.jsx'
import FollowButton from '../components/user/FollowButton.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../utils/apiError.js'
import { timeAgo } from '../utils/timeAgo.js'

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { currentUser, setCurrentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [listModal, setListModal] = useState({ open: false, title: '', items: [] })
  const [form, setForm] = useState({ name: '', bio: '', profilePhoto: '' })
  const [errors, setErrors] = useState({})
  const { showToast } = useToast()

  const isMe = !userId || userId === 'me' || Number(userId) === currentUser?.id

  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      setLoading(true)
      try {
        const [profileData, feed] = await Promise.all([
          isMe ? getMyProfile() : getProfile(userId),
          getGlobalFeed(),
        ])

        if (!ignore) {
          setProfile(profileData)
          setForm({
            name: profileData.name || '',
            bio: profileData.bio || '',
            profilePhoto: profileData.profilePhoto || '',
          })
          setPosts(feed.filter((post) => post.author.id === profileData.id))
        }
      } catch (error) {
        showToast({
          title: 'Profile unavailable',
          message: getErrorMessage(error, 'This profile could not be loaded.'),
          tone: 'error',
        })
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [isMe, userId, showToast])

  const stats = useMemo(
    () => [
      { label: 'Posts', value: posts.length },
      { label: 'Followers', value: profile?.followerCount || 0 },
      { label: 'Following', value: profile?.followingCount || 0 },
    ],
    [posts.length, profile],
  )

  async function openList(type) {
    try {
      const items = type === 'Followers' ? await getFollowers(profile.id) : await getFollowing(profile.id)
      setListModal({ open: true, title: type, items })
    } catch (error) {
      showToast({
        title: `${type} unavailable`,
        message: getErrorMessage(error, `The ${type.toLowerCase()} list could not be loaded.`),
        tone: 'error',
      })
    }
  }

  async function handleFollowToggle() {
    const previous = profile
    setFollowLoading(true)
    setProfile((current) => ({
      ...current,
      followedByCurrentUser: !current.followedByCurrentUser,
      followerCount: current.followedByCurrentUser ? current.followerCount - 1 : current.followerCount + 1,
    }))
    try {
      const updated = profile.followedByCurrentUser ? await unfollowUser(profile.id) : await followUser(profile.id)
      setProfile(updated)
    } catch (error) {
      setProfile(previous)
      showToast({
        title: 'Follow update failed',
        message: getErrorMessage(error, 'The follow action could not be completed.'),
        tone: 'error',
      })
    } finally {
      setFollowLoading(false)
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const path = await uploadProfilePhoto(file)
      setForm((current) => ({ ...current, profilePhoto: path }))
      showToast({
        title: 'Photo updated',
        message: 'Your new profile photo is ready.',
        tone: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Upload failed',
        message: getErrorMessage(error, 'The profile photo could not be uploaded.'),
        tone: 'error',
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    const nextErrors = {}
    if (form.name && !form.name.trim()) nextErrors.name = 'Name cannot be blank.'
    if ((form.bio || '').length > 500) nextErrors.bio = 'Bio must be 500 characters or less.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaveLoading(true)
    try {
      const updated = await updateProfile(form)
      setProfile(updated)
      setCurrentUser((current) => ({ ...current, ...updated }))
      setEditing(false)
      showToast({
        title: 'Profile saved',
        message: 'Your founder profile has been refreshed.',
        tone: 'success',
      })
    } catch (error) {
      showToast({
        title: 'Save failed',
        message: getErrorMessage(error, 'The profile could not be updated.'),
        tone: 'error',
      })
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return <SkeletonLoader className="h-[520px] w-full" />
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/40 via-slate-800 to-emerald-500/30 md:h-64" />
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="-mt-12 flex items-end gap-4">
              <Avatar
                src={profile.profilePhoto}
                name={profile.name}
                size="xl"
                className="h-24 w-24 rounded-[28px] border-4 border-[rgb(var(--bg))]"
              />
              <div className="pb-2">
                <h1 className="font-display text-3xl font-extrabold">{profile.name}</h1>
                <p className="mt-1 text-sm text-gray-400">{profile.email}</p>
              </div>
            </div>
            {isMe ? (
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <PencilLine size={16} />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="secondary" onClick={() => navigate(`/messages?userId=${profile.id}`)}>
                  <MessageCircle size={16} />
                  Message
                </Button>
                <FollowButton
                  isFollowing={profile.followedByCurrentUser}
                  onClick={handleFollowToggle}
                  loading={followLoading}
                />
              </div>
            )}
          </div>

          <div className="mt-4 max-w-3xl">
            {profile.bio ? <p className="text-left text-sm leading-7 text-[rgb(var(--text-soft))]">{profile.bio}</p> : null}
            <p className="mt-3 text-sm text-gray-400">
              Member since {timeAgo(profile.createdAt)}
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {stats.map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={() => (stat.label === 'Followers' || stat.label === 'Following') && openList(stat.label)}
                className="rounded-2xl bg-white/5 px-4 py-4 text-center"
              >
                <p className="text-center text-2xl font-bold">{stat.value}</p>
                <p className="text-center text-sm text-gray-400">{stat.label}</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-2">
          <Users className="text-primary" size={18} />
          <h2 className="font-display text-2xl font-bold">Post grid</h2>
        </div>
        {posts.length > 0 ? (
          <PostGrid posts={posts} onSelect={setSelectedPost} />
        ) : (
          <EmptyState
            icon={Users}
            title="No posts yet"
            message={isMe ? 'Share your first update to start building your profile.' : 'This profile has not published any posts yet.'}
          />
        )}
      </Card>

      <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit profile">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span>Name</span>
            <input className="input-base" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
          </label>
          <label className="block space-y-2 text-sm">
            <span>Bio</span>
            <textarea className="input-base min-h-[140px]" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
            {errors.bio && <p className="text-xs text-rose-400">{errors.bio}</p>}
          </label>
          <label className="block space-y-2 text-sm">
            <span>Profile photo</span>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={handleUpload} className="input-base file:mr-3 file:rounded-xl file:border-0 file:bg-primary/15 file:px-3 file:py-2 file:text-primary" />
              <Camera className="text-[rgb(var(--text-soft))]" size={18} />
            </div>
            {uploadingPhoto ? <p className="text-sm text-gray-400">Uploading photo...</p> : null}
          </label>
          <div className="flex justify-end">
            <Button type="submit" loading={saveLoading}>Save changes</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(selectedPost)} onClose={() => setSelectedPost(null)} title="Post preview">
        {selectedPost && (
          <div className="space-y-4">
            {selectedPost.imageUrl && (
              <img src={selectedPost.imageUrl} alt={selectedPost.content} className="w-full rounded-3xl object-cover" />
            )}
            <p className="text-sm leading-7">{selectedPost.content}</p>
          </div>
        )}
      </Modal>

      <Modal isOpen={listModal.open} onClose={() => setListModal({ open: false, title: '', items: [] })} title={listModal.title}>
        <div className="space-y-3">
          {listModal.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
              <Avatar src={item.profilePhoto} name={item.name} />
              <div>
                <p className="text-left font-semibold">{item.name}</p>
                <p className="text-left text-sm text-gray-400">{item.email}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
