const axios = require('axios');

const LINKEDIN_POSTS_URL = 'https://api.linkedin.com/rest/posts';
const CACHE_TTL_MS = parseInt(process.env.LINKEDIN_CACHE_TTL_MS || `${15 * 60 * 1000}`, 10);

let cachedPosts = null;
let cacheTimestamp = 0;

const getLinkedInHeaders = () => {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Missing LinkedIn access token (LINKEDIN_ACCESS_TOKEN)');
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    'LinkedIn-Version': process.env.LINKEDIN_API_VERSION || '202405',
    'X-Restli-Protocol-Version': '2.0.0'
  };
};

const fetchPostsFromLinkedIn = async () => {
  const organizationUrn = process.env.LINKEDIN_ORGANIZATION_URN;
  if (!organizationUrn) {
    throw new Error('Missing LinkedIn organization URN (LINKEDIN_ORGANIZATION_URN)');
  }

  const response = await axios.get(LINKEDIN_POSTS_URL, {
    params: {
      q: 'author',
      author: organizationUrn,
      sortBy: 'LAST_MODIFIED'
    },
    headers: getLinkedInHeaders()
  });

  const raw = response.data;
  const elements = raw?.data || raw?.elements || raw;

  if (!Array.isArray(elements)) {
    return [];
  }

  return elements.map((item) => {
    const content = item?.content || {};
    const commentary = content?.commentary || {};
    const body = commentary?.text || item?.text?.body || '';

    const media = content?.media || [];
    const firstMedia = Array.isArray(media) ? media[0] : null;
    const thumbnail = firstMedia?.thumbnail?.[0]?.url || firstMedia?.thumbnailUrl;
    const permalink = item?.permalink || item?.permalinks?.[0];

    return {
      id: item?.id || item?.entityUrn || item?.urn || '',
      createdAt: item?.createdAt || item?.lastModifiedAt || item?.created?.time,
      commentary: body,
      author: item?.author || item?.owner,
      lifecycleState: item?.lifecycleState,
      media: Array.isArray(media)
        ? media.map((mediaItem) => ({
            type: mediaItem.type || mediaItem.mediaType,
            title: mediaItem.title || mediaItem.description,
            url:
              mediaItem.originalUrl ||
              mediaItem.url ||
              mediaItem.sourceUrl ||
              null,
            thumbnail:
              mediaItem?.thumbnail?.[0]?.url ||
              mediaItem?.thumbnailUrl ||
              null
          }))
        : [],
      thumbnail,
      permalink
    };
  });
};

exports.getCompanyPosts = async (_req, res) => {
  try {
    const now = Date.now();
    if (cachedPosts && now - cacheTimestamp < CACHE_TTL_MS) {
      return res.json({
        source: 'cache',
        items: cachedPosts
      });
    }

    const posts = await fetchPostsFromLinkedIn();
    cachedPosts = posts;
    cacheTimestamp = now;

    res.json({
      source: 'live',
      items: posts
    });
  } catch (error) {
    console.error('❌ LinkedIn posts fetch error:', error?.response?.data || error.message);

    const status = error.response?.status || 500;
    res.status(status >= 400 && status < 600 ? status : 502).json({
      message: 'Failed to fetch LinkedIn posts',
      details: error.response?.data || error.message
    });
  }
};

