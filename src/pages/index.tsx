import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

export default function HomePage() {
  return (
    <Layout>
      <Seo />
      <main>
        <section className='bg-white'>
          <div className='layout mt-2 flex flex-col justify-center'>
            <div className='space-y-2 text-sm text-neutral-800'>
              <p>Learning and building</p>
              <p>
                Write lots of code at{' '}
                <UnstyledLink className='font-bold' href='https://uber.com/'>
                  Uber
                </UnstyledLink>
              </p>
              <p>
                On the internet <span className='font-bold'>@joeydotdev</span>
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
