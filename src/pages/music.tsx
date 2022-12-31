import Layout from '@/components/layout/Layout';
import PrimaryLink from '@/components/links/PrimaryLink';
import Seo from '@/components/Seo';

export default function MusicPage() {
  return (
    <Layout>
      <Seo templateTitle='music' />
      <main>
        <section className='bg-white'>
          <div className='layout mt-2 flex flex-col justify-center space-y-2'>
            <PrimaryLink
              href='https://www.last.fm/user/odxs'
              className='text-sm'
            >
              last.fm
            </PrimaryLink>
            <PrimaryLink
              href='https://www.youtube.com/playlist?list=PLTytJeo9dEDFYxqtxnDs99CeUFxzH4tFp'
              className='text-sm'
            >
              YouTube Playlist
            </PrimaryLink>
            <PrimaryLink
              href='https://open.spotify.com/playlist/5LwKX6PWJ2JshJGJ2IeBZR?si=35a224059d294c62'
              className='text-sm'
            >
              Spotify Playlist
            </PrimaryLink>
            <p className='text-sm text-neutral-800'></p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
