export interface CachedTweet {
  id: string
  text: string
  tweetedat: Date
  cachedat: Date
}

export const collectionNames = {
  tweetCache: 'tweetcache'
}

export const tweetCacheFieldNames = {
  tweetedAt: 'tweetedat'
}
