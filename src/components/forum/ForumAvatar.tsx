import * as React from 'react';

import clsxm from '@/lib/clsxm';
import {
  POSTER_AVATAR_REMOTE,
  POSTER_AVATAR_SRC,
  POSTER_NAME,
} from '@/lib/posts';

type ForumAvatarProps = {
  /** `sm` for Last Post thumbs; `lg` for topic poster sidebar. */
  size?: 'sm' | 'lg';
  className?: string;
  alt?: string;
};

/**
 * Square olive-bordered forum avatar for joey (list thumbs + topic sidebar).
 */
export default function ForumAvatar({
  size = 'sm',
  className,
  alt = POSTER_NAME,
}: ForumAvatarProps) {
  const [src, setSrc] = React.useState(POSTER_AVATAR_SRC);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size === 'lg' ? 96 : 32}
      height={size === 'lg' ? 96 : 32}
      className={clsxm(
        'forum-avatar',
        size === 'lg' ? 'forum-avatar-lg' : 'forum-avatar-sm',
        className
      )}
      onError={() => {
        if (src !== POSTER_AVATAR_REMOTE) {
          setSrc(POSTER_AVATAR_REMOTE);
        }
      }}
    />
  );
}
