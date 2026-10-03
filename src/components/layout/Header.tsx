import * as React from 'react';

import ButtonLink from '@/components/links/ButtonLink';

const links = [
  { href: '/writings', label: 'Writings' },
  { href: 'https://github.com/joeydotdev', label: 'Github' },
  { href: 'https://www.linkedin.com/in/~joey/', label: 'Linkedin' },
];

export default function Header() {
  return (
    <header className='sticky top-0 z-50 border-b border-primary-800/80 bg-surface/95 backdrop-blur-sm'>
      <div className='layout flex h-11 items-center justify-between'>
        <ButtonLink href='/' variant='ghost' className='px-1.5 text-base'>
          joey.dev
        </ButtonLink>
        <nav>
          <ul className='flex items-center space-x-0.5'>
            {links.map(({ href, label }) => (
              <li key={`${href}${label}`}>
                <ButtonLink href={href} variant='ghost' className='px-1.5'>
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
