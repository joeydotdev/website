import Layout from '@/components/layout/Layout';
import PrimaryLink from '@/components/links/PrimaryLink';
import Seo from '@/components/Seo';

export default function HomePage() {
  return (
    <Layout>
      <Seo />
      <main>
        <section className='bg-white'>
          <div className='layout flex flex-col justify-center'>
            <div className='text-sm text-gray-800'>
              <p className='mt-2'>hey - i&#39;m joey. welcome my website :)</p>
              <p className='mt-4'>
                i&#39;m a software engineer living in san francisco. i currently
                work on{' '}
                <PrimaryLink className='font-bold' href='https://ubereats.com/'>
                  UberEats
                </PrimaryLink>{' '}
                focusing on growth & building out new bets within the eats
                ecosystem.
              </p>
              <p className='mt-4'>
                outside of my day job, i&#39;m the founder of{' '}
                <PrimaryLink
                  className='font-bold'
                  href='https://cscareers.dev/'
                >
                  cscareers.dev
                </PrimaryLink>{' '}
                - a community with focused on helping those land their first
                software engineering role. some other hobbies of mine include
                video games (runescape ftw), corgi spotting, and raving.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
