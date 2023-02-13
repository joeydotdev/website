import * as React from 'react';

import ButtonLink from '@/components/links/ButtonLink';

const links = [
  { href: '/writings', label: 'Writings' },
  { href: 'https://github.com/joeydotdev', label: 'Github' },
  { href: 'https://www.linkedin.com/in/~joey/', label: 'Linkedin' },
];

export default function Header() {
  return (
    <header className='sticky top-0 z-50 bg-white'>
      <div className='layout flex h-14 items-center justify-between'>
        <ButtonLink href='/' variant='ghost' className='text-xl text-black'>
          joey.dev
        </ButtonLink>
        <nav>
          <ul className='flex items-center justify-between space-x-4'>
            {links.map(({ href, label }) => (
              <li key={`${href}${label}`}>
                <ButtonLink
                  href={href}
                  variant='ghost'
                  className='text-sm text-black'
                >
                  {label}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
