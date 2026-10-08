import { cn } from '@template/ui/lib/cn';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');

/** The user's avatar, or their initials when they have none. */
export function UserAvatar({
  user,
  size = 40,
  className,
}: {
  user: { name: string; avatarUrl: string | null };
  size?: number;
  className?: string;
}) {
  const t = useTranslations('avatar');
  const frame = cn('shrink-0 overflow-hidden rounded-full bg-muted', className);
  if (user.avatarUrl) {
    return (
      <Image
        // Presigned storage URLs: already sized by the uploader, nothing for Next to optimize.
        unoptimized
        src={user.avatarUrl}
        alt={t('alt', { name: user.name })}
        width={size}
        height={size}
        className={cn(frame, 'object-cover')}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={t('alt', { name: user.name })}
      className={cn(frame, 'flex items-center justify-center font-medium text-muted-foreground')}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(user.name)}
    </span>
  );
}
