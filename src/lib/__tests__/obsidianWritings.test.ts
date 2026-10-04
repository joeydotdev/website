import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';

import {
  type ObsidianNoteJson,
  assignSlugs,
  isPublicWriting,
  isWritingsPath,
  loadObsidianWritings,
  noteToPost,
  postsFromFixtureRoot,
  postsFromRest,
} from '@/lib/obsidianWritings';
import { type Post } from '@/lib/posts';

const FIXTURE_ROOT = path.join(process.cwd(), 'src/blog/obsidian-fixtures');

function httpResult(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

async function withVault(
  files: Record<string, string>,
  run: (root: string) => Promise<void>
): Promise<void> {
  const root = await mkdtemp(path.join(tmpdir(), 'obsidian-writings-'));
  try {
    for (const [relative, contents] of Object.entries(files)) {
      const full = path.join(root, relative);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, contents);
    }
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

describe('obsidian writings fixtures', () => {
  it('publishes the two public notes under writings/', async () => {
    const posts = await postsFromFixtureRoot(FIXTURE_ROOT);
    const hello = posts.find((post) => post.slug === 'hello-public');

    expect(posts.map((post) => post.slug).sort()).toEqual([
      'hello-public',
      'inline-tags',
    ]);
    expect(hello).toEqual({
      slug: 'hello-public',
      title: 'Hello from Obsidian',
      date: '2026-10-03T00:00:00.000Z',
      url: '/writings/hello-public',
      author: 'joey',
      excerpt:
        'This note is public and lives under writings.\n\nIt should appear on the site after the Obsidian publish path runs.',
    });
    expect(hello?.excerpt).toContain('This note is public');
    expect(hello?.excerpt).toContain('writings');
    expect(hello?.excerpt).not.toContain('**');
    expect(hello?.date.startsWith('2026-10-03')).toBe(true);

    const inline = posts.find((post) => post.slug === 'inline-tags');
    expect(inline?.title).toBe('Inline public tag');
    expect(posts.some((post) => post.slug === 'draft-private')).toBe(false);
    expect(posts.some((post) => post.slug === 'not-a-writing')).toBe(false);
  });

  it('returns no posts when the fixture root is missing', async () => {
    const posts = await postsFromFixtureRoot(
      path.join(FIXTURE_ROOT, 'does-not-exist')
    );
    expect(posts).toEqual([]);
  });
});

describe('obsidian writings gate', () => {
  it('matches writings paths and an exact public tag', () => {
    expect(isWritingsPath('writings/hello-public.md')).toBe(true);
    expect(isWritingsPath('writings/nested/x.md')).toBe(true);
    expect(isWritingsPath('\\writings\\nested\\x.md')).toBe(true);
    expect(isWritingsPath('/writings/hello-public.md')).toBe(true);
    expect(isWritingsPath('notes/not-a-writing.md')).toBe(false);
    expect(isWritingsPath('writings.md')).toBe(false);
    expect(isWritingsPath('Writings/x.md')).toBe(false);

    expect(isPublicWriting({ path: 'writings/x.md', tags: ['PUBLIC'] })).toBe(
      true
    );
    expect(isPublicWriting({ path: 'writings/x.md', tags: [' public '] })).toBe(
      true
    );
    expect(
      isPublicWriting({ path: 'writings/x.md', tags: ['public/essay'] })
    ).toBe(false);
    expect(isPublicWriting({ path: 'Writings/x.md', tags: ['public'] })).toBe(
      false
    );
    expect(
      isPublicWriting({ path: 'notes/not-a-writing.md', tags: ['public'] })
    ).toBe(false);
  });

  it('reads #public from the body and ignores fenced or longer tags', async () => {
    await withVault(
      {
        'writings/body-tag.md': 'A note with #public in the body.\n',
        'writings/fenced.md': '```\n#public\n```\n\nNo tag here.\n',
        'writings/longer.md': 'See #publicity and #public/essay.\n',
        'writings/nested-tag.md': '---\ntags: [public/essay]\n---\n\nHidden.\n',
        'writings/singular.md': '---\ntag: public\n---\n\nShown.\n',
        'Writings/x.md': '---\ntags: [public]\n---\n\nWrong case.\n',
      },
      async (root) => {
        const posts = await postsFromFixtureRoot(root);
        expect(posts.map((post) => post.slug).sort()).toEqual([
          'body-tag',
          'singular',
        ]);
      }
    );
  });

  it('skips a note whose date cannot be parsed and has no mtime', () => {
    const note: ObsidianNoteJson = {
      path: 'writings/undated.md',
      content:
        '---\ntitle: Undated\ndate: not-a-date\ntags: [public]\n---\n\nBody.\n',
      tags: ['public'],
      frontmatter: { title: 'Undated', date: 'not-a-date' },
      stat: { ctime: Number.NaN, mtime: Number.NaN, size: 1 },
    };
    expect(noteToPost(note)).toBeNull();
  });

  it('uses mtime when frontmatter date does not parse', () => {
    const note: ObsidianNoteJson = {
      path: 'writings/mtime.md',
      content: '# From the heading\n\nBody text.\n',
      tags: ['public'],
      frontmatter: { date: 'not-a-date' },
      stat: { ctime: 1, mtime: 1_700_000_000_000, size: 10 },
    };
    expect(noteToPost(note)).toEqual({
      slug: 'mtime',
      title: 'From the heading',
      date: '2023-11-14T22:13:20.000Z',
      url: '/writings/mtime',
      excerpt: 'From the heading\n\nBody text.',
      author: 'joey',
    });
  });

  it('strips Obsidian comments and keeps only wikilink labels', () => {
    const post = noteToPost({
      path: 'writings/secret-bits.md',
      content:
        '---\ntitle: Secret bits\ndate: 2026-10-03\ntags:\n  - public\n---\n\nVisible.\n\n%% hidden comment %%\n<!-- html hide -->\nSee [[private-note|alias]] and [[other-note]].\n',
      tags: ['public'],
      frontmatter: { title: 'Secret bits', date: '2026-10-03' },
      stat: { ctime: 0, mtime: 0, size: 1 },
    });

    expect(post?.excerpt).toBe('Visible.\n\nSee alias and other-note.');
    expect(post?.excerpt).not.toContain('hidden comment');
    expect(post?.excerpt).not.toContain('html hide');
    expect(post?.excerpt).not.toContain('[[');
  });
});

describe('obsidian writings loaders', () => {
  it('does not call fetch when the api key is null', async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      throw new Error('fetch should not run');
    };

    const posts = await loadObsidianWritings({
      apiKey: null,
      useFixtures: true,
      fetchImpl,
    });

    expect(calls).toBe(0);
    expect(posts.map((post) => post.slug).sort()).toEqual([
      'hello-public',
      'inline-tags',
    ]);
  });

  it('returns no posts when the api key is unset and fixtures are off', async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      throw new Error('fetch should not run');
    };
    const previousKey = process.env.OBSIDIAN_API_KEY;
    const previousFlag = process.env.OBSIDIAN_USE_FIXTURES;
    delete process.env.OBSIDIAN_API_KEY;
    delete process.env.OBSIDIAN_USE_FIXTURES;
    try {
      const posts = await loadObsidianWritings({ fetchImpl });
      expect(calls).toBe(0);
      expect(posts).toEqual([]);
    } finally {
      if (previousKey === undefined) delete process.env.OBSIDIAN_API_KEY;
      else process.env.OBSIDIAN_API_KEY = previousKey;
      if (previousFlag === undefined) delete process.env.OBSIDIAN_USE_FIXTURES;
      else process.env.OBSIDIAN_USE_FIXTURES = previousFlag;
    }
  });

  it('treats an empty api key as unset and requires the fixtures flag', async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      throw new Error('fetch should not run');
    };
    const previous = process.env.OBSIDIAN_API_KEY;
    process.env.OBSIDIAN_API_KEY = 'present';
    try {
      const posts = await loadObsidianWritings({
        apiKey: '',
        useFixtures: true,
        fetchImpl,
      });
      expect(calls).toBe(0);
      expect(posts.map((post) => post.slug).sort()).toEqual([
        'hello-public',
        'inline-tags',
      ]);
    } finally {
      if (previous === undefined) delete process.env.OBSIDIAN_API_KEY;
      else process.env.OBSIDIAN_API_KEY = previous;
    }
  });

  it('rejects when search returns 500 and does not publish fixtures', async () => {
    const fetchImpl: typeof fetch = async () => httpResult(500, { ok: false });
    await expect(
      postsFromRest('http://127.0.0.1:27123', 'secret', fetchImpl)
    ).rejects.toThrow('Obsidian request failed (500)');
    await expect(
      loadObsidianWritings({
        apiKey: 'secret',
        baseUrl: 'http://127.0.0.1:27123',
        fetchImpl,
      })
    ).rejects.toThrow('Obsidian request failed (500)');
  });

  it('refuses a non-loopback http base url before sending the bearer token', async () => {
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      return httpResult(200, []);
    };
    await expect(
      postsFromRest('http://example.com', 'secret', fetchImpl)
    ).rejects.toThrow('HTTPS');
    expect(calls).toBe(0);
  });

  it('projects search hits and skips paths outside writings/', async () => {
    const calls: Array<{ url: string; init: RequestInit | undefined }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.endsWith('/search/')) {
        return httpResult(200, [
          { filename: 'writings/hello-public.md' },
          { filename: 'notes/secret.md' },
          { filename: 'Writings/x.md' },
        ]);
      }
      return httpResult(200, {
        path: 'writings/hello-public.md',
        content:
          '---\ntitle: Hello from Obsidian\ndate: 2026-10-03\ntags:\n  - public\n---\n\nThis note is public and lives under **writings**.\n',
        tags: ['public', 'essay'],
        frontmatter: { title: 'Hello from Obsidian', date: '2026-10-03' },
        stat: { ctime: 0, mtime: 0, size: 1 },
      });
    };

    const posts = await postsFromRest(
      'http://127.0.0.1:27123',
      'secret',
      fetchImpl
    );

    expect(posts).toEqual([
      {
        slug: 'hello-public',
        title: 'Hello from Obsidian',
        date: '2026-10-03T00:00:00.000Z',
        url: '/writings/hello-public',
        author: 'joey',
        excerpt: 'This note is public and lives under writings.',
      },
    ]);
    expect(calls.map((call) => call.url)).toEqual([
      'http://127.0.0.1:27123/search/',
      'http://127.0.0.1:27123/vault/writings/hello-public.md',
    ]);

    const search = calls[0].init;
    expect(search?.method).toBe('POST');
    expect(search?.headers).toEqual({
      Authorization: 'Bearer secret',
      'Content-Type': 'application/vnd.olrapi.jsonlogic+json',
    });
    expect(JSON.parse(String(search?.body))).toEqual({
      and: [
        { in: ['public', { var: 'tags' }] },
        { regexp: ['(?:^|/)writings/.+\\.md$', { var: 'path' }] },
      ],
    });
    expect(calls[1].init?.headers).toEqual({
      Authorization: 'Bearer secret',
      Accept: 'application/vnd.olrapi.note+json',
    });
  });
});

describe('assignSlugs', () => {
  it('keeps the external slug and rewrites the colliding note', () => {
    const external: Post = {
      slug: 'hello-public',
      title: 'External',
      date: '2020-01-01T00:00:00.000Z',
      url: 'https://example.com/hello',
      excerpt: '',
      author: 'joey',
    };
    const note: Post = {
      slug: 'hello-public',
      title: 'Note',
      date: '2026-10-03T00:00:00.000Z',
      url: '/writings/hello-public',
      excerpt: 'Body',
      author: 'joey',
    };

    const rewritten = assignSlugs([external], [note]);

    expect(external.slug).toBe('hello-public');
    expect(external.url).toBe('https://example.com/hello');
    expect(rewritten).toEqual([
      {
        ...note,
        slug: 'hello-public-note',
        url: '/writings/hello-public-note',
      },
    ]);
  });
});
