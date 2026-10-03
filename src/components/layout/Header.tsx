import * as React from 'react';

import UnstyledLink from '@/components/links/UnstyledLink';

const links = [
  { href: '/writings', label: 'Writings' },
  { href: 'https://github.com/joeydotdev', label: 'Github' },
  { href: 'https://x.com/joeydotdev', label: 'X' },
  { href: 'https://www.linkedin.com/in/~joey/', label: 'Linkedin' },
];

export default function Header() {
  return (
    <header className='layout pt-2'>
      <div className='forum-util'>
        {links.map(({ href, label }, i) => (
          <React.Fragment key={`${href}${label}`}>
            {i > 0 ? <span className='text-primary-600'>·</span> : null}
            <UnstyledLink href={href}>{label}</UnstyledLink>
          </React.Fragment>
        ))}
      </div>

      <div className='forum-banner'>
        <UnstyledLink
          href='/'
          className='forum-banner-title hover:no-underline'
        >
          joey.dev
        </UnstyledLink>
        <div className='forum-banner-sub'>personal board · est. forever</div>
      </div>
    </header>
  );
}
