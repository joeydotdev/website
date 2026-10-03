import { lastFmClient } from '@/lib/lastfm';

import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

type PropsType = {
  lastfm: {
    isConnected: boolean;
    lastTrack: {
      isCurrentlyListening: boolean;
      title: string;
      url: string;
    };
  };
};

export async function getServerSideProps() {
  const recentTracks = await lastFmClient
    .getRecentTracks({ limit: 2 })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log(e);
      return null;
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tracks: any[] = Array.from(recentTracks?.track || []);
  const isCurrentlyListening = tracks.some(
    (track) =>
      typeof track === 'object' &&
      '@attr' in track &&
      Boolean(track['@attr'].nowplaying)
  );
  const lastTrackTitle = tracks[0]
    ? `${tracks[0].name} - ${tracks[0].artist['#text']}`
    : null;

  return {
    props: {
      lastfm: {
        isConnected: Boolean(recentTracks),
        lastTrack: {
          url: tracks[0]?.url || null,
          title: lastTrackTitle,
          isCurrentlyListening,
        },
      },
    },
  };
}

export default function HomePage(props: PropsType) {
  return (
    <Layout>
      <Seo />
      <main>
        <section className='layout pb-6'>
          <div className='forum-crumb'>
            <span className='text-ink'>joey.dev</span>
            {' » '}
            <span className='text-ink'>Home</span>
          </div>

          <div className='forum-board'>
            <div className='forum-cat'>
              <span>Profile</span>
              <span className='forum-cat-tools' aria-hidden>
                −
              </span>
            </div>
            <div className='forum-panel-body space-y-1.5'>
              <p>Learning and building</p>
              <p>
                Write lots of code at{' '}
                <UnstyledLink href='https://uber.com/'>Uber</UnstyledLink>
              </p>
              <p>
                On the internet{' '}
                <strong className='text-primary-200'>@joeydotdev</strong>
              </p>
              {props.lastfm.isConnected ? (
                <div className='mt-2 border-t border-border pt-2'>
                  <div className='forum-meta'>
                    {props.lastfm.lastTrack.isCurrentlyListening
                      ? 'Currently listening to:'
                      : 'Last listened to:'}
                  </div>
                  <UnstyledLink
                    className='text-[11px]'
                    href={props.lastfm.lastTrack.url}
                    target='_blank'
                  >
                    ♫ {props.lastfm.lastTrack.title}
                  </UnstyledLink>
                </div>
              ) : null}
            </div>
          </div>

          <div className='forum-board mt-2'>
            <div className='forum-cat'>
              <span>Board Index</span>
              <span className='forum-cat-tools' aria-hidden>
                −
              </span>
            </div>
            <div className='forum-cols' aria-hidden>
              <div />
              <div>Forum</div>
              <div>Info</div>
            </div>
            <UnstyledLink
              href='/writings'
              className='forum-row forum-row-a no-underline hover:no-underline'
            >
              <div className='forum-status'>
                <span className='forum-status-icon' aria-hidden />
              </div>
              <div>
                <span className='forum-topic'>Writings</span>
                <div className='forum-meta'>Posts, notes, and long reads</div>
              </div>
              <div className='forum-meta'>View topics »</div>
            </UnstyledLink>
            <UnstyledLink
              href='https://github.com/joeydotdev'
              className='forum-row forum-row-b no-underline hover:no-underline'
            >
              <div className='forum-status'>
                <span className='forum-status-icon' aria-hidden />
              </div>
              <div>
                <span className='forum-topic'>Github</span>
                <div className='forum-meta'>Code and side projects</div>
              </div>
              <div className='forum-meta'>External »</div>
            </UnstyledLink>
          </div>
        </section>
      </main>
    </Layout>
  );
}
