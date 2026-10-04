import * as React from 'react';

import clsxm from '@/lib/clsxm';

type ForumHandleProps = {
  /** Display name (e.g. joey, Webmaster). Ignored when children are provided. */
  name?: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Retro forum byline: bold white ~ plus #b10205 name (IPB-style handle).
 */
export default function ForumHandle({
  name,
  children,
  className,
}: ForumHandleProps) {
  const label = children ?? name;

  return (
    <strong className={clsxm('forum-handle', className)}>
      <span className='forum-handle-tilde'>~</span>
      <span className='forum-handle-name'>{label}</span>
    </strong>
  );
}
