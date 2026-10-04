import { readdir, readFile, realpath, stat } from 'fs/promises';
import path from 'path';

import { type Post, POSTER_NAME } from '@/lib/posts';

/** Subset of Local REST `NoteJson` (Accept: application/vnd.olrapi.note+json). */
export type ObsidianNoteJson = {
  path: string;
  content: string;
  tags: string[];
  frontmatter: Record<string, unknown>;
  stat: { ctime: number; mtime: number; size: number };
};

const DEFAULT_BASE_URL = 'http://127.0.0.1:27123';
const WRITINGS_PATH = /(?:^|\/)writings\/.+\.md$/;
const PUBLIC_TAG = /(?:^|[^A-Za-z0-9/_-])#public(?![A-Za-z0-9/_-])/i;
const SEARCH_QUERY = {
  and: [
    { in: ['public', { var: 'tags' }] },
    { regexp: ['(?:^|/)writings/.+\\.md$', { var: 'path' }] },
  ],
};

export function isWritingsPath(vaultPath: string): boolean {
  const normalized = vaultPath.replace(/\\/g, '/').replace(/^\//, '');
  return WRITINGS_PATH.test(normalized);
}

export function isPublicWriting(
  note: Pick<ObsidianNoteJson, 'path' | 'tags'>
): boolean {
  if (!isWritingsPath(note.path)) return false;
  return note.tags.some((tag) => tag.trim().toLowerCase() === 'public');
}

export function noteToPost(note: ObsidianNoteJson): Post | null {
  if (!isPublicWriting(note)) return null;

  const stem = filenameStem(note.path);
  const slug = slugFromStem(stem);
  const date = dateFromNote(note);
  if (date === null) return null;

  return {
    slug,
    title: titleFromNote(note, stem),
    date,
    url: `/writings/${slug}`,
    excerpt: plainExcerpt(note.content),
    author: POSTER_NAME,
  };
}

export function assignSlugs(external: Post[], notes: Post[]): Post[] {
  const taken = new Set(external.map((post) => post.slug));
  return notes.map((note) => {
    let slug = note.slug;
    while (taken.has(slug)) slug = `${slug}-note`;
    taken.add(slug);
    if (slug === note.slug) return note;
    return { ...note, slug, url: `/writings/${slug}` };
  });
}

export async function postsFromFixtureRoot(root: string): Promise<Post[]> {
  let rootReal: string;
  try {
    rootReal = await realpath(root);
  } catch (err) {
    if (isEnoent(err)) return [];
    throw err;
  }

  const rootStat = await stat(rootReal);
  if (!rootStat.isDirectory()) return [];

  const posts: Post[] = [];
  for (const file of await markdownFiles(root, rootReal)) {
    let fileReal: string;
    try {
      fileReal = await realpath(file);
    } catch (err) {
      if (isEnoent(err)) continue;
      throw err;
    }
    if (!isInside(rootReal, fileReal)) continue;

    const [content, fileStat] = await Promise.all([
      readFile(file, 'utf8'),
      stat(file),
    ]);
    const vaultPath = path.relative(root, file).split(path.sep).join('/');
    const post = noteToPost(noteFromFixture(vaultPath, content, fileStat));
    if (post) posts.push(post);
  }
  return posts;
}

export async function postsFromRest(
  baseUrl: string,
  apiKey: string,
  fetchImpl: typeof fetch = fetch
): Promise<Post[]> {
  assertBearerUrl(baseUrl);
  const authorization = { Authorization: `Bearer ${apiKey}` };
  const searched = await requestJson(fetchImpl, endpoint(baseUrl, 'search/'), {
    method: 'POST',
    headers: {
      ...authorization,
      'Content-Type': 'application/vnd.olrapi.jsonlogic+json',
    },
    body: JSON.stringify(SEARCH_QUERY),
  });

  const posts: Post[] = [];
  for (const filename of filenamesFromSearch(searched)) {
    const payload = await requestJson(
      fetchImpl,
      endpoint(baseUrl, `vault/${vaultPathname(filename)}`),
      {
        method: 'GET',
        headers: {
          ...authorization,
          Accept: 'application/vnd.olrapi.note+json',
        },
      }
    );
    const post = noteToPost(parseNoteJson(payload));
    if (post) posts.push(post);
  }
  return posts;
}

export async function loadObsidianWritings(override?: {
  apiKey?: string | null;
  baseUrl?: string;
  fixtureRoot?: string;
  useFixtures?: boolean;
  fetchImpl?: typeof fetch;
}): Promise<Post[]> {
  const apiKey =
    override && 'apiKey' in override
      ? blankToUnset(override.apiKey)
      : blankToUnset(process.env.OBSIDIAN_API_KEY);

  if (apiKey === undefined) {
    const wantFixtures =
      override?.useFixtures === true ||
      (override !== undefined &&
        Object.prototype.hasOwnProperty.call(override, 'fixtureRoot')) ||
      blankToUnset(process.env.OBSIDIAN_USE_FIXTURES) === '1';
    if (!wantFixtures) return [];

    const fixtureRoot =
      blankToUnset(override?.fixtureRoot) ??
      blankToUnset(process.env.OBSIDIAN_FIXTURE_ROOT) ??
      path.join(process.cwd(), 'src/blog/obsidian-fixtures');
    return postsFromFixtureRoot(fixtureRoot);
  }

  const baseUrl =
    blankToUnset(override?.baseUrl) ??
    blankToUnset(process.env.OBSIDIAN_BASE_URL) ??
    DEFAULT_BASE_URL;

  return postsFromRest(baseUrl, apiKey, override?.fetchImpl);
}

function filenameStem(vaultPath: string): string {
  const normalized = vaultPath.replace(/\\/g, '/').replace(/\/+$/, '');
  const base = normalized.slice(normalized.lastIndexOf('/') + 1);
  return base.endsWith('.md') ? base.slice(0, -3) : base;
}

function slugFromStem(stem: string): string {
  const slug = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'note';
}

function titleFromNote(note: ObsidianNoteJson, stem: string): string {
  const titled = note.frontmatter.title;
  if (typeof titled === 'string' && titled.trim() !== '') return titled;

  const heading = stripFrontmatter(note.content).body.match(
    /^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/m
  );
  if (heading && heading[1].trim() !== '') return heading[1].trim();
  return stem.trim() !== '' ? stem : 'note';
}

function dateFromNote(note: ObsidianNoteJson): string | null {
  const dated = note.frontmatter.date;
  if (typeof dated === 'string' || typeof dated === 'number') {
    const parsed = isoDate(dated);
    if (parsed !== null) return parsed;
  }
  return isoDate(note.stat.mtime);
}

function isoDate(value: string | number): string | null {
  if (typeof value === 'number' && !Number.isFinite(value)) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toJSON();
}

function plainExcerpt(content: string): string {
  const text = stripFrontmatter(content)
    .body.replace(/\r\n/g, '\n')
    .replace(/%%[\s\S]*?%%/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/!\[\[[^\]]*\]\]/g, '')
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, target, alias) =>
      String(alias ?? target).trim()
    )
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*$/gm, '$1')
    .replace(/\*\*|__/g, '')
    .replace(/\*/g, '')
    .replace(/(^|[^\w])_([^_\n]+?)_(?!\w)/g, '$1$2')
    .replace(/`([^`\n]+)`/g, '$1');

  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/[ \t]*\n[ \t]*/g, ' ').trim())
    .filter((paragraph) => paragraph.length > 0)
    .join('\n\n');
}

function stripFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const text = content.replace(/^\uFEFF/, '');
  if (!text.startsWith('---')) return { frontmatter: {}, body: text };

  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: {}, body: text };

  return {
    frontmatter: parseFrontmatterBlock(match[1]),
    body: text.slice(match[0].length),
  };
}

function parseFrontmatterBlock(raw: string): Record<string, unknown> {
  const lines = raw.split(/\r?\n/);
  const frontmatter: Record<string, unknown> = {};

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const key = match[1];
    const value = match[2].trim();
    if (value === '') {
      const items: string[] = [];
      while (index + 1 < lines.length && /^\s*-\s+/.test(lines[index + 1])) {
        index += 1;
        const item = unquote(lines[index].replace(/^\s*-\s+/, '').trim());
        if (item.length > 0) items.push(item);
      }
      frontmatter[key] = items;
      continue;
    }

    const list = parseBracketList(value);
    frontmatter[key] = list ?? coerceScalar(value);
  }

  return frontmatter;
}

function parseBracketList(value: string): string[] | null {
  if (!value.startsWith('[') || !value.endsWith(']')) return null;
  const inner = value.slice(1, -1).trim();
  if (inner === '') return [];
  return inner
    .split(',')
    .map((part) => unquote(part.trim()))
    .filter((part) => part.length > 0);
}

function coerceScalar(value: string): string | number {
  const raw = unquote(value.trim());
  if (/^-?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
  return raw;
}

function unquote(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
    (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function tagsFromFrontmatter(frontmatter: Record<string, unknown>): string[] {
  const tags: string[] = [];
  for (const key of ['tags', 'tag']) {
    const value = frontmatter[key];
    if (typeof value === 'string') {
      for (const part of value.split(',')) {
        const tag = unquote(part.trim());
        if (tag.length > 0) tags.push(tag);
      }
      continue;
    }
    if (!Array.isArray(value)) continue;
    for (const item of value) {
      if (typeof item !== 'string') continue;
      const tag = item.trim();
      if (tag.length > 0) tags.push(tag);
    }
  }
  return tags;
}

function bodyHasPublicTag(body: string): boolean {
  const withoutFences = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '');
  return PUBLIC_TAG.test(withoutFences);
}

function noteFromFixture(
  vaultPath: string,
  content: string,
  fileStat: { ctimeMs: number; mtimeMs: number; size: number }
): ObsidianNoteJson {
  const { frontmatter, body } = stripFrontmatter(content);
  const tags = tagsFromFrontmatter(frontmatter);
  if (
    bodyHasPublicTag(body) &&
    !tags.some((tag) => tag.trim().toLowerCase() === 'public')
  ) {
    tags.push('public');
  }

  return {
    path: vaultPath.replace(/\\/g, '/'),
    content,
    tags,
    frontmatter,
    stat: {
      ctime: fileStat.ctimeMs,
      mtime: fileStat.mtimeMs,
      size: fileStat.size,
    },
  };
}

async function markdownFiles(
  root: string,
  rootReal: string
): Promise<string[]> {
  const found: string[] = [];
  const seen = new Set<string>();

  async function walk(dir: string): Promise<void> {
    let dirReal: string;
    try {
      dirReal = await realpath(dir);
    } catch (err) {
      if (isEnoent(err)) return;
      throw err;
    }
    if (!isInside(rootReal, dirReal) || seen.has(dirReal)) return;
    seen.add(dirReal);

    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (entry.isSymbolicLink()) {
        let linkedReal: string;
        try {
          linkedReal = await realpath(full);
        } catch (err) {
          if (isEnoent(err)) continue;
          throw err;
        }
        if (!isInside(rootReal, linkedReal)) continue;
        const linked = await stat(full);
        if (linked.isDirectory()) {
          await walk(full);
          continue;
        }
      }
      if (entry.name.endsWith('.md')) found.push(full);
    }
  }

  await walk(root);
  return found;
}

function isInside(rootReal: string, targetReal: string): boolean {
  const relative = path.relative(rootReal, targetReal);
  if (relative === '') return true;
  if (path.isAbsolute(relative)) return false;
  return relative !== '..' && !relative.startsWith(`..${path.sep}`);
}

function isEnoent(err: unknown): boolean {
  return errorCode(err) === 'ENOENT';
}

function errorCode(err: unknown): string | undefined {
  if (typeof err !== 'object' || err === null || !('code' in err)) {
    return undefined;
  }
  const code: unknown = Reflect.get(err, 'code');
  return typeof code === 'string' ? code : undefined;
}

function blankToUnset(value: string | null | undefined): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return value;
}

function endpoint(baseUrl: string, suffix: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${suffix.replace(/^\/+/, '')}`;
}

function vaultPathname(vaultPath: string): string {
  return vaultPath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function assertBearerUrl(baseUrl: string): void {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error('OBSIDIAN_BASE_URL is not a valid URL');
  }

  const loopback =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '::1';
  if (!loopback && url.protocol !== 'https:') {
    throw new Error('OBSIDIAN_BASE_URL must be HTTPS when it is not loopback');
  }
}

async function requestJson(
  fetchImpl: typeof fetch,
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string }
): Promise<unknown> {
  const response = await fetchImpl(url, init);
  if (!response.ok) {
    throw new Error(`Obsidian request failed (${response.status})`);
  }
  return response.json();
}

function filenamesFromSearch(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    throw new Error('Obsidian search returned an unexpected payload');
  }

  const filenames: string[] = [];
  for (const entry of payload) {
    if (!isRecord(entry) || typeof entry.filename !== 'string') continue;
    if (!isWritingsPath(entry.filename)) continue;
    filenames.push(entry.filename);
  }
  return filenames;
}

function parseNoteJson(payload: unknown): ObsidianNoteJson {
  if (!isRecord(payload)) {
    throw new Error('Obsidian note payload is not an object');
  }

  const {
    path: notePath,
    content,
    tags,
    frontmatter,
    stat: statValue,
  } = payload;
  if (typeof notePath !== 'string' || typeof content !== 'string') {
    throw new Error('Obsidian note payload is missing path or content');
  }
  if (!Array.isArray(tags)) {
    throw new Error('Obsidian note payload has invalid tags');
  }
  if (!isRecord(frontmatter)) {
    throw new Error('Obsidian note payload is missing frontmatter');
  }
  if (!isRecord(statValue)) {
    throw new Error('Obsidian note payload is missing stat');
  }

  const tagList: string[] = [];
  for (const tag of tags) {
    if (typeof tag !== 'string') {
      throw new Error('Obsidian note payload has invalid tags');
    }
    tagList.push(tag);
  }

  const { ctime, mtime, size } = statValue;
  if (
    typeof ctime !== 'number' ||
    typeof mtime !== 'number' ||
    typeof size !== 'number'
  ) {
    throw new Error('Obsidian note payload has invalid stat');
  }

  return {
    path: notePath,
    content,
    tags: tagList,
    frontmatter,
    stat: { ctime, mtime, size },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
