import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

interface UserAvatarProps {
  avatarUrl?: string | null
  name?: string | null
  className?: string
}

export function UserAvatar({ avatarUrl, name, className }: UserAvatarProps) {
  const initials = name ? getInitials(name) : '?'

  return (
    <Avatar className={className}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? 'Avatar'} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}
