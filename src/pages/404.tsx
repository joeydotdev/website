import * as React from 'react';

import Layout from '@/components/layout/Layout';
import ArrowLink from '@/components/links/ArrowLink';
import Seo from '@/components/Seo';

export default function NotFoundPage() {
  return (
    <Layout showHeader={false}>
      <Seo templateTitle='Not Found' />

      <main>
        <section>
          <div className='layout flex min-h-screen flex-col items-center justify-center text-center text-ink'>
            <h1 className='text-3xl md:text-5xl'>404</h1>
            <ArrowLink className='mt-3 text-sm text-primary-300' href='/'>
              Back to Home
            </ArrowLink>
          </div>
        </section>
      </main>
    </Layout>
  );
}
