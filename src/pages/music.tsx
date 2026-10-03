import ForumBoard from '@/components/ForumBoard';
import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

const links = [
  {
    href: 'https://www.last.fm/user/odxs',
    label: 'last.fm',
    meta: 'Scrobbles',
  },
  {
    href: 'https://www.youtube.com/playlist?list=PLTytJeo9dEDFYxqtxnDs99CeUFxzH4tFp',
    label: 'YouTube Playlist',
    meta: 'External »',
  },
  {
    href: 'https://open.spotify.com/playlist/5LwKX6PWJ2JshJGJ2IeBZR?si=35a224059d294c62',
    label: 'Spotify Playlist',
    meta: 'External »',
  },
];

export default function MusicPage() {
  return (
    <Layout>
      <Seo templateTitle='music' />
      <main>
        <section className='layout pb-6'>
          <div className='forum-crumb'>
            <UnstyledLink href='/'>joey.dev</UnstyledLink>
            {' » '}
            <span className='text-ink'>Music</span>
          </div>

          <ForumBoard title='Music'>
            <div className='forum-cols' aria-hidden>
              <div />
              <div>Forum</div>
              <div>Info</div>
            </div>
            {links.map((link, i) => (
              <UnstyledLink
                key={link.href}
                href={link.href}
                className={`forum-row ${
                  i % 2 === 0 ? 'forum-row-a' : 'forum-row-b'
                } no-underline hover:no-underline`}
              >
                <div className='forum-status'>
                  <span className='forum-status-icon' aria-hidden />
                </div>
                <div>
                  <span className='forum-topic'>{link.label}</span>
                </div>
                <div className='forum-meta'>{link.meta}</div>
              </UnstyledLink>
            ))}
          </ForumBoard>
        </section>
      </main>
    </Layout>
  );
}
