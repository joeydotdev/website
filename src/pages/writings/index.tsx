import { getPosts } from '@/lib/getPosts';
import { type Post, formatForumDate, POSTER_NAME } from '@/lib/posts';

import ForumBoard from '@/components/ForumBoard';
import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

export async function getStaticProps() {
  const posts = await getPosts();

  return {
    props: {
      posts: posts.map((post) => ({
        slug: post.slug,
        title: post.title,
        date: post.date,
        dateLabel: formatForumDate(post.date),
        author: post.author,
      })),
    },
    revalidate: 3600,
  };
}

type PropsType = {
  posts: Array<
    Pick<Post, 'slug' | 'title' | 'date' | 'author'> & { dateLabel: string }
  >;
};

export default function BlogPage({ posts }: PropsType) {
  return (
    <Layout>
      <Seo templateTitle='blog' />
      <main>
        <section className='layout pb-6'>
          <div className='forum-crumb'>
            <UnstyledLink href='/'>joey.dev</UnstyledLink>
            {' » '}
            <span className='text-ink'>Writings</span>
          </div>

          <ForumBoard title='Writings'>
            <div className='forum-cols forum-cols-board'>
              <div />
              <div>Topic</div>
              <div>Last Post</div>
            </div>

            {posts.map((post, i) => (
              <UnstyledLink
                href={`/writings/${post.slug}`}
                key={post.slug}
                className={`forum-row forum-row-board ${
                  i % 2 === 0 ? 'forum-row-a' : 'forum-row-b'
                } no-underline hover:no-underline`}
              >
                <div className='forum-status'>
                  <span className='forum-status-icon' aria-hidden />
                </div>
                <div>
                  <span className='forum-topic'>{post.title}</span>
                </div>
                <div className='forum-last-post'>
                  <span>{post.dateLabel}</span>
                  <strong>{POSTER_NAME}</strong>
                </div>
              </UnstyledLink>
            ))}
          </ForumBoard>
        </section>
      </main>
    </Layout>
  );
}
