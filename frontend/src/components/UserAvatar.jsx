export default function UserAvatar({ user, size = 'md' }) {
  const name = user?.name || 'User'
  const photoUrl = user?.photo_url || user?.avatar_url
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return photoUrl ? (
    <img className={`user-avatar user-avatar-${size}`} src={photoUrl} alt={`${name} profile`} />
  ) : (
    <span className={`user-avatar user-avatar-${size}`} aria-label={`${name} profile`}>{initial}</span>
  )
}
