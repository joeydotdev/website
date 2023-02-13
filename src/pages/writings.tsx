import { readFile } from 'fs/promises';
import path from 'path';

import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

function BlogItem({ title, date }: { title: string; date: string }) {
  return (
    <div className='flex flex-col break-words rounded py-2 px-4 hover:bg-primary-50 active:bg-primary-100 md:h-16 md:flex-row md:items-center md:justify-between'>
      <div className='max-w-xs md:max-w-md'>
        <span className='font-medium'>{title}</span>
      </div>
      <div className='text-xs italic text-neutral-500'>{date}</div>
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
        <section className='bg-white'>
          <div className='layout mt-2 flex flex-col justify-center space-y-2'>
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
