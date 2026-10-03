import { readFile } from 'fs/promises';
import path from 'path';

import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

function BlogItem({ title, date }: { title: string; date: string }) {
  return (
    <div className='flex flex-col break-words rounded-sm px-2 py-1.5 hover:bg-primary-800 active:bg-primary-700 md:flex-row md:items-baseline md:justify-between md:gap-4'>
      <div className='min-w-0 flex-1'>
        <span className='text-sm font-medium text-ink'>{title}</span>
      </div>
      <div className='shrink-0 text-xs text-ink-muted tabular-nums'>{date}</div>
    </div>
  );
}

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
          month: 'long',
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
        <section>
          <div className='layout mt-3 flex flex-col justify-center space-y-0.5'>
            {posts.map((post) => {
              return (
                <UnstyledLink href={post.url} key={post.url}>
                  <BlogItem title={post.title} date={post.date} />
                </UnstyledLink>
              );
            })}
          </div>
        </section>
      </main>
    </Layout>
  );
}
