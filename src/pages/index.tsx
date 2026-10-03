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
        <section>
          <div className='layout mt-3 flex flex-col justify-center'>
            <div className='text-sm text-ink'>
              <div className='space-y-1'>
                <p>Learning and building</p>
                <p>
                  Write lots of code at{' '}
                  <UnstyledLink
                    className='font-medium text-primary-200 underline decoration-primary-600 underline-offset-2 hover:text-primary-100'
                    href='https://uber.com/'
                  >
                    Uber
                  </UnstyledLink>
                </p>
                <p>
                  On the internet{' '}
                  <span className='font-medium text-primary-200'>
                    @joeydotdev
                  </span>
                </p>
              </div>
              {props.lastfm.isConnected ? (
                <div className='mt-3 space-y-0.5'>
                  <div className='text-ink-muted'>
                    {props.lastfm.lastTrack.isCurrentlyListening ? (
                      <>Currently listening to:</>
                    ) : (
                      <>Last listened to:</>
                    )}
                  </div>
                  <UnstyledLink
                    className='text-xs text-primary-300 hover:text-primary-100'
                    href={props.lastfm.lastTrack.url}
                    target='_blank'
                  >
                    ♫ {props.lastfm.lastTrack.title}
                  </UnstyledLink>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
