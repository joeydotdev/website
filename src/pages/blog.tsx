import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

function BlogItem({ title, date }: { title: string; date: string }) {
  const friendlyDateString = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div className='flex flex-col break-words rounded py-2 px-4 hover:bg-primary-50 active:bg-primary-100 md:h-16 md:flex-row md:items-center md:justify-between'>
      <div className='max-w-xs md:max-w-md'>
        <span className='font-medium'>{title}</span>
      </div>
      <div className='text-xs italic text-neutral-500'>
        {friendlyDateString}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const response = await fetch(
    'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@joeydotdev'
  )
    .then((res) => res.json())
    .then((data) => data.items)
    .catch(() => null);

  return {
    props: {
      posts: Array.from(response || []).map(
        // @ts-expect-error Too lazy to type properly things these days.
        (item: { title: string; pubDate: string; guid: string }) => {
          return {
            title: item.title,
            date: item.pubDate,
            url: item.guid,
          };
        }
      ),
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
