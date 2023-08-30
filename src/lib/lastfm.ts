const LASTFM_USERNAME = 'odxs';
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

const getRecentTracksEndpoint = `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&limit={limit}&format=json`;

const isServer = () => typeof window === 'undefined';

async function getRecentTracks(opts: { limit: number }) {
  if (!isServer()) {
    throw new Error('getRecentTracks should only be called on server');
  }
  if (!LASTFM_API_KEY) {
    throw new Error('API key not detected');
  }

  const url = getRecentTracksEndpoint.replace('{limit}', String(opts.limit));

  const response = await fetch(url, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((res) => res.recenttracks);

  return response;
}

export const lastFmClient = { getRecentTracks };
