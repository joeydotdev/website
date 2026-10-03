import * as React from 'react';

import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

export default function NotFoundPage() {
  return (
    <Layout showHeader={false}>
      <Seo templateTitle='Not Found' />

      <main>
        <section className='layout flex min-h-screen flex-col justify-center'>
          <div className='forum-board'>
            <div className='forum-cat'>
              <span>Error</span>
              <span className='forum-cat-tools' aria-hidden>
                −
              </span>
            </div>
            <div className='forum-panel-body text-center'>
              <h1 className='text-2xl font-bold text-ink'>404</h1>
              <p className='forum-meta mt-1'>
                The topic you requested could not be found.
              </p>
              <p className='mt-3'>
                <UnstyledLink href='/'>« Back to Board Index</UnstyledLink>
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
