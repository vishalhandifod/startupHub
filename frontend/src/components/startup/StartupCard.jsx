import { Link } from 'react-router-dom'
import Avatar from '../common/Avatar.jsx'
import Button from '../common/Button.jsx'
import Card from '../common/Card.jsx'
import { formatNumber } from '../../utils/formatNumber'

function getStageLabel(followerCount) {
  if (followerCount >= 50) {
    return 'Growth Stage'
  }
  if (followerCount >= 10) {
    return 'Seed Stage'
  }
  return 'Early Stage'
}

export default function StartupCard({ startup }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <Avatar src={startup.logoUrl} name={startup.name} size="lg" />
        <div className="min-w-0 flex-1">
          <Link to={`/startups/${startup.id}`} className="text-sm font-semibold hover:text-primary">
            {startup.name}
          </Link>
          <p className="mt-1 text-sm text-gray-400">@{startup.slug}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {startup.industry && (
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {startup.industry}
          </span>
        )}
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          {getStageLabel(startup.followerCount)}
        </span>
      </div>
      {startup.location && <p className="mt-3 text-left text-sm text-gray-400">{startup.location}</p>}
      {startup.description ? (
        <p className="mt-3 line-clamp-3 text-left text-sm text-[rgb(var(--text-soft))]">{startup.description}</p>
      ) : null}
      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {formatNumber(startup.followerCount)} followers
        </span>
        <Link to={`/startups/${startup.id}`}>
          <Button variant="secondary">View Details</Button>
        </Link>
      </div>
    </Card>
  )
}
