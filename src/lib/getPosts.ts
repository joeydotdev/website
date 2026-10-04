import { readFile } from 'fs/promises';
import path from 'path';

import { type Post, htmlToText, POSTER_NAME, slugify } from '@/lib/posts';

export async function getPosts(): Promise<Post[]> {
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

  const posts: Post[] = [
    ...Array.from(mediumPosts || []).map(
      // @ts-expect-error RSS item shape varies by feed
      (item: {
        title: string;
        pubDate: string;
        guid: string;
        description?: string;
        content?: string;
      }) => {
        const url = item.guid;
        const raw = item.content || item.description || '';
        return {
          slug: slugify(item.title, url),
          title: item.title,
          date: new Date(item.pubDate).toJSON(),
          url,
          excerpt: htmlToText(raw).slice(0, 1200),
          author: POSTER_NAME,
        };
      }
    ),
    ...Array.from(cscareersPosts || []).map(
      // @ts-expect-error API shape is intentionally loose
      (item: { title: string; date: string; url: string }) => {
        return {
          slug: slugify(item.title, item.url),
          title: item.title,
          date: new Date(item.date).toJSON(),
          url: item.url,
          excerpt: '',
          author: POSTER_NAME,
        };
      }
    ),
    ...Array.from(tumblrPosts || []).map((item) => {
      return {
        slug: slugify(item.title, item.url),
        title: item.title,
        date: new Date(item.date).toJSON(),
        url: item.url,
        excerpt: '',
        author: POSTER_NAME,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) || null;
}
