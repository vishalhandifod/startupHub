import Button from '../common/Button.jsx'

export default function FollowButton({
  isFollowing,
  onClick,
  disabled = false,
  className = '',
  loading = false,
}) {
  return (
    <Button
      type="button"
      variant={isFollowing ? 'secondary' : 'success'}
      className={className}
      disabled={disabled}
      loading={loading}
      onClick={onClick}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
