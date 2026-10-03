import { GetStaticPaths, GetStaticProps } from 'next';

import { getPostBySlug, getPosts } from '@/lib/getPosts';
import { type Post, formatForumDateTime, POSTER_NAME } from '@/lib/posts';

import Layout from '@/components/layout/Layout';
import UnstyledLink from '@/components/links/UnstyledLink';
import Seo from '@/components/Seo';

type PropsType = {
  post: Post;
  postCount: number;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPosts();
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<PropsType> = async (ctx) => {
  const slug = ctx.params?.slug;
  if (typeof slug !== 'string') {
    return { notFound: true };
  }

  const [post, posts] = await Promise.all([getPostBySlug(slug), getPosts()]);
  if (!post) {
    return { notFound: true };
  }

  return {
    props: {
      post,
      postCount: posts.length,
    },
    revalidate: 3600,
  };
};

export default function WritingTopicPage({ post, postCount }: PropsType) {
  const postedAt = formatForumDateTime(post.date);
  const joined = 'Est. forever';
  const paragraphs = (post.excerpt || '')
    .split(/(?<=\.)\s+/)
    .filter(Boolean)
    .slice(0, 6);

  return (
    <Layout>
      <Seo templateTitle={post.title} />
      <main>
        <section className='layout pb-6'>
          <div className='forum-crumb'>
            <UnstyledLink href='/'>joey.dev</UnstyledLink>
            {' » '}
            <UnstyledLink href='/writings'>Writings</UnstyledLink>
            {' » '}
            <span className='text-ink'>{post.title}</span>
          </div>

          <div className='mb-1 flex items-center justify-end gap-1'>
            <UnstyledLink href='/writings' className='forum-btn'>
              Topic List
            </UnstyledLink>
            <a
              href={post.url}
              target='_blank'
              rel='noopener noreferrer'
              className='forum-btn'
            >
              Original Post
            </a>
          </div>

          <div className='forum-topic-bar'>
            <span>{post.title}</span>
            <span className='text-[10px] font-normal text-primary-200'>
              Options ▾
            </span>
          </div>

          <article className='forum-post'>
            <aside className='forum-poster'>
              <div className='forum-poster-name'>{POSTER_NAME}</div>
              <div className='forum-poster-rank'>Member</div>
              <dl className='forum-poster-stats'>
                <div>
                  <dt>Group: </dt>
                  <dd>Webmaster</dd>
                </div>
                <div>
                  <dt>Posts: </dt>
                  <dd>{postCount}</dd>
                </div>
                <div>
                  <dt>Joined: </dt>
                  <dd>{joined}</dd>
                </div>
                <div>
                  <dt>From: </dt>
                  <dd>the internet</dd>
                </div>
              </dl>
            </aside>

            <div className='forum-post-main'>
              <div className='forum-post-head'>
                <span>Posted: {postedAt}</span>
                <span>Post #1</span>
              </div>

              <div className='forum-post-body'>
                {paragraphs.length > 0 ? (
                  paragraphs.map((p) => <p key={p.slice(0, 24)}>{p}</p>)
                ) : (
                  <p>
                    {post.title}. Open the original post for the full write-up.
                  </p>
                )}
                <p className='mt-3'>
                  <a href={post.url} target='_blank' rel='noopener noreferrer'>
                    Continue reading on the original post »
                  </a>
                </p>
              </div>

              <div className='forum-post-foot'>
                <div className='forum-btn-row'>
                  <span className='forum-btn'>Card</span>
                  <UnstyledLink
                    href='https://x.com/joeydotdev'
                    className='forum-btn'
                  >
                    PM
                  </UnstyledLink>
                </div>
                <div className='forum-btn-row'>
                  <a
                    href={post.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='forum-btn'
                  >
                    + Quote
                  </a>
                  <UnstyledLink href='/writings' className='forum-btn'>
                    Reply
                  </UnstyledLink>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </Layout>
  );
}
