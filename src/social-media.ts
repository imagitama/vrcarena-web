// TODO: Move to utils

export function getUrlForVrChatAvatarId(avatarId: string): string {
  return `https://vrchat.com/home/avatar/${avatarId}`
}

export function getUrlForVrChatWorldId(worldId: string): string {
  return `https://vrchat.com/home/world/${worldId}`
}

export function getUrlForVrChatUserId(userId: string): string {
  return `https://vrchat.com/home/user/${userId}`
}

export function getUrlForTwitterUsername(username: string): string {
  return `https://twitter.com/${username}`
}

export function getUrlForYouTubeChannelByChannelId(channelId: string): string {
  return `https://www.youtube.com/channel/${channelId}`
}

export function getUrlForTelegramUsername(username: string): string {
  return `https://t.me/${username}`
}

export function getUrlForTwitchByUsername(username: string): string {
  return `https://twitch.tv/${username}`
}

export function getUrlForGumroadUsername(username: string): string {
  return `https://gumroad.com/${username}`
}

export function getUrlForPatreonByUsername(username: string): string {
  return `https://patreon.com/${username}`
}

export function getUrlForBoothByUsername(username: string): string {
  return `https://${username}.booth.pm`
}
