import { getPosts } from '@/lib/getPosts';
import { lastFmClient } from '@/lib/lastfm';
import { formatForumDate, POSTER_NAME } from '@/lib/posts';

import ForumAvatar from '@/components/forum/ForumAvatar';
import ForumHandle from '@/components/forum/ForumHandle';
import ForumBoard from '@/components/ForumBoard';
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
  lastWriting: {
    slug: string;
    title: string;
    dateLabel: string;
  } | null;
};

export async function getServerSideProps() {
  const [recentTracks, posts] = await Promise.all([
    lastFmClient.getRecentTracks({ limit: 2 }).catch((e) => {
      // eslint-disable-next-line no-console
      console.log(e);
      return null;
    }),
    getPosts().catch(() => []),
  ]);

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

  const latest = posts[0] || null;

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
      lastWriting: latest
        ? {
            slug: latest.slug,
            title: latest.title,
            dateLabel: formatForumDate(latest.date),
          }
        : null,
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

          <ForumBoard title='Profile'>
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
          </ForumBoard>

          <ForumBoard title='Board Index' className='mt-2'>
            <div className='forum-cols forum-cols-board'>
              <div />
              <div>Forum</div>
              <div>Last Post</div>
            </div>
            <UnstyledLink
              href='/writings'
              className='forum-row forum-row-board forum-row-a no-underline hover:no-underline'
            >
              <div className='forum-status'>
                <span className='forum-status-icon' aria-hidden />
              </div>
              <div>
                <span className='forum-topic'>Writings</span>
                <div className='forum-meta'>Posts, notes, and long reads</div>
              </div>
              <div className='forum-last-post'>
                {props.lastWriting ? (
                  <>
                    <ForumAvatar size='sm' />
                    <div className='forum-last-post-meta'>
                      <span className='forum-last-post-title'>
                        {props.lastWriting.title}
                      </span>
                      <span>
                        By <ForumHandle name={POSTER_NAME} />,{' '}
                        {props.lastWriting.dateLabel}
                      </span>
                    </div>
                  </>
                ) : (
                  <span>—</span>
                )}
              </div>
            </UnstyledLink>
            <UnstyledLink
              href='https://github.com/joeydotdev'
              className='forum-row forum-row-board forum-row-b no-underline hover:no-underline'
            >
              <div className='forum-status'>
                <span className='forum-status-icon' aria-hidden />
              </div>
              <div>
                <span className='forum-topic'>Github</span>
                <div className='forum-meta'>Code and side projects</div>
              </div>
              <div className='forum-last-post'>
                <span>External »</span>
              </div>
            </UnstyledLink>
            <UnstyledLink
              href='https://x.com/joeydotdev'
              className='forum-row forum-row-board forum-row-a no-underline hover:no-underline'
            >
              <div className='forum-status'>
                <span className='forum-status-icon' aria-hidden />
              </div>
              <div>
                <span className='forum-topic'>X</span>
                <div className='forum-meta'>Updates and posts</div>
              </div>
              <div className='forum-last-post'>
                <span>External »</span>
              </div>
            </UnstyledLink>
          </ForumBoard>
        </section>
      </main>
    </Layout>
  );
}
