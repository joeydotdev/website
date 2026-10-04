import * as React from 'react';

import clsxm from '@/lib/clsxm';

type ForumBoardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
};

/**
 * Retro IPB-style board with a working category collapse/expand control.
 */
export default function ForumBoard({
  title,
  children,
  className,
  defaultOpen = true,
}: ForumBoardProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div
      className={clsxm(
        'forum-board',
        !open && 'forum-board-collapsed',
        className
      )}
    >
      <div className='forum-cat'>
        <span>{title}</span>
        <button
          type='button'
          className='forum-cat-tools'
          aria-expanded={open}
          aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '−' : '+'}
        </button>
      </div>
      {open ? children : null}
    </div>
  );
}
