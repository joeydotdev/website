export type Post = {
  slug: string;
  title: string;
  /** ISO date string */
  date: string;
  url: string;
  excerpt: string;
  author: string;
};

export const POSTER_NAME = 'joey';

/** Local forum avatar (copied into public/; avoids hotlinking twimg). */
export const POSTER_AVATAR_SRC = '/images/joey-avatar.jpg';

/** Remote fallback if the local asset is unavailable. */
export const POSTER_AVATAR_REMOTE =
  'https://pbs.twimg.com/profile_images/2055903626594590720/o54xc4Sz_400x400.jpg';

export function slugify(title: string, url: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 64);
  let hash = 0;
  for (let i = 0; i < url.length; i += 1) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  return `${base || 'topic'}-${(hash >>> 0).toString(36)}`;
}

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatForumDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatForumDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
