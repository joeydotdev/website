import Layout from '@/components/layout/Layout';
import PrimaryLink from '@/components/links/PrimaryLink';
import Seo from '@/components/Seo';

export default function MusicPage() {
  return (
    <Layout>
      <Seo templateTitle='music' />
      <main>
        <section>
          <div className='layout mt-3 flex flex-col justify-center space-y-1'>
            <PrimaryLink href='https://www.last.fm/user/odxs'>
              last.fm
            </PrimaryLink>
            <PrimaryLink href='https://www.youtube.com/playlist?list=PLTytJeo9dEDFYxqtxnDs99CeUFxzH4tFp'>
              YouTube Playlist
            </PrimaryLink>
            <PrimaryLink href='https://open.spotify.com/playlist/5LwKX6PWJ2JshJGJ2IeBZR?si=35a224059d294c62'>
              Spotify Playlist
            </PrimaryLink>
          </div>
        </section>
      </main>
    </Layout>
  );
}
