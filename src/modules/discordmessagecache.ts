interface DiscordUser {
  id: string
  username: string
  discriminator: string // 4 digit code
  avatar?: string
  bot?: boolean
  system?: boolean
}

interface DiscordMessage {
  author: DiscordUser
}

export interface CachedDiscordMessage {
  id: string
  channelid: string
  content: string
  type: number
  sentat: Date
  authorid: string
  rawdata: DiscordMessage
  cachedat: Date
}

export const discordMessageCacheFieldNames = {
  sentAt: 'sentat'
}

export const collectionNames = {
  discordMessageCache: 'discordmessagecache'
}
