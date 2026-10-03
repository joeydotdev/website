import { readFile } from 'fs/promises';
import path from 'path';

import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

export async function getStaticProps() {
  const blogDirectory = path.join(process.cwd(), './src/blog/');
  const [mediumPosts, cscareersPosts, tumblrPosts] = await Promise.all([
    fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@joeydotdev'
    )
      .then((res) => res.json())
      .then((data) => data.items)
      .catch(() => null),
    fetch('https://www.cscareers.dev/api/getBlogPostsByAuthor?author=joey')
      .then((res) => res.json())
      .then((data) => data.posts)
      .catch(() => null),
    readFile(`${blogDirectory}tumblr.json`, 'utf8')
      .then(
        (data) =>
          JSON.parse(data) as Array<{
            title: string;
            date: string;
            url: string;
          }>
      )
      .catch(() => null),
  ]);

  const posts = [
    ...Array.from(mediumPosts || []).map(
      // @ts-expect-error Too lazy to type properly things these days.
      (item: { title: string; pubDate: string; guid: string }) => {
        return {
          title: item.title,
          // Desktop safari does not like the `item.pubDate` format.
          // So we convert it to a JSON string on the server.
          date: new Date(item.pubDate).toJSON(),
          url: item.guid,
        };
      }
    ),
    ...Array.from(cscareersPosts || []).map(
      // @ts-expect-error Too lazy to type properly things these days.
      (item: { title: string; date: string; url: string }) => {
        return {
          title: item.title,
          date: item.date,
          url: item.url,
        };
      }
    ),
    ...Array.from(tumblrPosts || []),
  ]
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .map((post) => {
      return {
        ...post,
        date: new Date(post.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    });

  return {
    props: {
      posts,
    },
  };
}

type PropsType = {
  posts: Array<{ title: string; date: string; url: string }>;
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

          <div className='forum-board'>
            <div className='forum-cat'>
              <span>Writings</span>
              <span className='forum-cat-tools' aria-hidden>
                −
              </span>
            </div>

            <div className='forum-cols' aria-hidden>
              <div />
              <div>Topic</div>
              <div>Last Post</div>
            </div>

            {posts.map((post, i) => (
              <UnstyledLink
                href={post.url}
                key={post.url}
                className={`forum-row ${
                  i % 2 === 0 ? 'forum-row-a' : 'forum-row-b'
                } no-underline hover:no-underline`}
              >
                <div className='forum-status'>
                  <span className='forum-status-icon' aria-hidden />
                </div>
                <div>
                  <span className='forum-topic'>{post.title}</span>
                </div>
                <div className='forum-meta'>{post.date}</div>
              </UnstyledLink>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
