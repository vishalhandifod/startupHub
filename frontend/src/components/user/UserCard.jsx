import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar.jsx'
import Card from '../common/Card.jsx'
import FollowButton from './FollowButton.jsx'

export default function UserCard({ user, onFollowToggle, isFollowing }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <Avatar src={user.profilePhoto} name={user.name} size="lg" />
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${user.id}`} className="text-sm font-semibold hover:text-primary">
            {user.name}
          </Link>
          <p className="mt-1 text-sm text-gray-400">{user.email}</p>
          {user.bio && <p className="mt-3 text-left text-sm text-[rgb(var(--text-soft))]">{user.bio}</p>}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {user.role ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{user.role}</span> : <span />}
        <FollowButton isFollowing={isFollowing} onClick={onFollowToggle} />
      </div>
    </Card>
  )
}
